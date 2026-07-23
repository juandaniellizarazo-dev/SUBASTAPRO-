<?php
// api/productos.php
// GET  /api/productos.php                     → listar (con filtros ?q=&categoria=&orden=&estado=)
// GET  /api/productos.php?id=X                → detalle + historial de ofertas
// POST /api/productos.php                     → crear lote (auth)
// POST /api/productos.php?id=X&action=ofertar → pujar    (auth)
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = $_GET['action'] ?? null;

// ── GET: Listar productos ────────────────────────────────
if ($method === 'GET' && !$id) {
    finalizarVencidas();

    $db     = getDB();
    $estado = $_GET['estado'] ?? 'activa';
    $q      = $_GET['q']      ?? '';
    $cat    = $_GET['categoria'] ?? '';
    $orden  = $_GET['orden']  ?? 'ending';

    $where  = ['p.estado = ?'];
    $params = [$estado];
    $types  = 's';

    if ($q) {
        $like = "%$q%";
        $where[] = '(p.nombre LIKE ? OR p.descripcion LIKE ?)';
        $params[] = $like; $params[] = $like;
        $types .= 'ss';
    }
    if ($cat && $cat !== 'Todas') {
        $where[] = 'c.nombre = ?';
        $params[] = $cat;
        $types .= 's';
    }

    $orderSQL = match($orden) {
        'highest' => 'p.oferta_actual DESC',
        'lowest'  => 'p.oferta_actual ASC',
        'newest'  => 'p.fecha_creacion DESC',
        default   => 'p.fecha_cierre ASC',   // 'ending'
    };

    $sql = "
        SELECT p.*,
               c.nombre          AS categoria,
               v.nombre          AS vendedor_nombre,
               v.apellido        AS vendedor_apellido,
               l.nombre          AS lider_nombre,
               l.apellido        AS lider_apellido,
               g.nombre          AS ganador_nombre,
               g.apellido        AS ganador_apellido
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        JOIN usuarios   v ON v.id = p.vendedor_id
        LEFT JOIN usuarios l ON l.id = p.lider_actual_id
        LEFT JOIN usuarios g ON g.id = p.ganador_id
        WHERE " . implode(' AND ', $where) . "
        ORDER BY $orderSQL
    ";

    $st = $db->prepare($sql);
    $st->bind_param($types, ...$params);
    $st->execute();
    $rows = $st->get_result()->fetch_all(MYSQLI_ASSOC);

    $productos = array_map('formatProducto', $rows);
    jsonResponse(['success' => true, 'productos' => $productos]);
}

// ── GET: Detalle de un producto ──────────────────────────
if ($method === 'GET' && $id) {
    finalizarVencidas();
    $db = getDB();

    $st = $db->prepare("
        SELECT p.*,
               c.nombre   AS categoria,
               v.nombre   AS vendedor_nombre, v.apellido AS vendedor_apellido,
               l.nombre   AS lider_nombre,    l.apellido AS lider_apellido,
               g.nombre   AS ganador_nombre,  g.apellido AS ganador_apellido
        FROM productos p
        JOIN categorias c ON c.id = p.categoria_id
        JOIN usuarios   v ON v.id = p.vendedor_id
        LEFT JOIN usuarios l ON l.id = p.lider_actual_id
        LEFT JOIN usuarios g ON g.id = p.ganador_id
        WHERE p.id = ?
    ");
    $st->bind_param('i', $id);
    $st->execute();
    $row = $st->get_result()->fetch_assoc();
    if (!$row) jsonError('Lote no encontrado.', 404);

    // Historial de ofertas
    $so = $db->prepare("
        SELECT o.id, o.valor, o.fecha, u.id AS usuario_id, u.nombre, u.apellido
        FROM ofertas o
        JOIN usuarios u ON u.id = o.usuario_id
        WHERE o.producto_id = ?
        ORDER BY o.valor DESC, o.fecha DESC
    ");
    $so->bind_param('i', $id);
    $so->execute();
    $ofertas = $so->get_result()->fetch_all(MYSQLI_ASSOC);

    jsonResponse([
        'success'  => true,
        'producto' => formatProducto($row),
        'ofertas'  => $ofertas
    ]);
}

// ── POST: Crear lote ─────────────────────────────────────
if ($method === 'POST' && !$id) {
    $user = requireAuth();
    $b    = requireBody(['nombre','categoria','descripcion','imagen','precioInicial','fechaCierre']);

    $nombre       = trim($b['nombre']);
    $catNombre    = $b['categoria'];
    $descripcion  = trim($b['descripcion']);
    $imagen       = trim($b['imagen']);
    $precio       = (float)$b['precioInicial'];
    $fechaCierre  = $b['fechaCierre'];

    if ($precio <= 0) jsonError('El precio inicial debe ser mayor a cero.');
    if (strtotime($fechaCierre) <= time()) jsonError('La fecha de cierre debe estar en el futuro.');

    $db = getDB();
    $sc = $db->prepare('SELECT id FROM categorias WHERE nombre = ?');
    $sc->bind_param('s', $catNombre);
    $sc->execute();
    $cat = $sc->get_result()->fetch_assoc();
    if (!$cat) {
        // Insertar categoría si no existe
        $si = $db->prepare('INSERT INTO categorias (nombre) VALUES (?)');
        $si->bind_param('s', $catNombre);
        $si->execute();
        $catId = $db->insert_id;
    } else {
        $catId = $cat['id'];
    }

    $vendedorId = $user['id'];
    $sp = $db->prepare("
        INSERT INTO productos (vendedor_id, nombre, categoria_id, descripcion, imagen_url, precio_inicial, oferta_actual, fecha_cierre, estado)
        VALUES (?,?,?,?,?,?,?,?,'activa')
    ");
    $sp->bind_param('isissdds', $vendedorId, $nombre, $catId, $descripcion, $imagen, $precio, $precio, $fechaCierre);
    if (!$sp->execute()) jsonError('Error al publicar el lote.', 500);

    jsonResponse(['success' => true, 'message' => 'Lote publicado exitosamente.', 'productoId' => $db->insert_id], 201);
}

// ── POST: Pujar ───────────────────────────────────────────
if ($method === 'POST' && $id && $action === 'ofertar') {
    $user = requireAuth();
    $b    = requireBody(['valor']);
    $valor = (float)$b['valor'];

    if ($valor <= 0) jsonError('El monto debe ser un número positivo.');

    $db = getDB();
    $db->begin_transaction();

    try {
        // Bloquear fila del producto
        $st = $db->prepare('SELECT * FROM productos WHERE id = ? FOR UPDATE');
        $st->bind_param('i', $id);
        $st->execute();
        $p = $st->get_result()->fetch_assoc();
        if (!$p) { $db->rollback(); jsonError('Lote no encontrado.', 404); }

        $vencido = ($p['estado'] === 'activa' && strtotime($p['fecha_cierre']) <= time());
        if ($p['estado'] === 'finalizada' || $vencido) {
            $db->rollback();
            jsonError('Esta subasta ya ha finalizado.', 400);
        }

        $minimo = max((float)$p['oferta_actual'], (float)$p['precio_inicial']);
        if ($valor <= $minimo) {
            $db->rollback();
            jsonError("La puja debe superar la oferta actual de $" . number_format($minimo, 2));
        }

        // Insertar oferta
        $userId = $user['id'];
        $so = $db->prepare('INSERT INTO ofertas (producto_id, usuario_id, valor) VALUES (?,?,?)');
        $so->bind_param('iid', $id, $userId, $valor);
        $so->execute();

        // Anti-sniping: si faltan ≤2 min se extiende 2 min
        $cierre   = strtotime($p['fecha_cierre']);
        $diff     = $cierre - time();
        $newCierre = ($diff > 0 && $diff <= 120)
            ? date('Y-m-d H:i:s', $cierre + 120)
            : $p['fecha_cierre'];

        $su = $db->prepare('UPDATE productos SET oferta_actual=?, lider_actual_id=?, fecha_cierre=? WHERE id=?');
        $su->bind_param('disi', $valor, $userId, $newCierre, $id);
        $su->execute();

        // Notificación al líder anterior si existe y es distinto
        if ($p['lider_actual_id'] && $p['lider_actual_id'] != $userId) {
            $nombre = $user['nombre'] . ' ' . $user['apellido'];
            $msg    = "¡Has sido superado! $nombre ofertó $" . number_format($valor, 2) . " en \"{$p['nombre']}\".";
            $tipo   = 'warning';
            $sn = $db->prepare('INSERT INTO notificaciones (usuario_id, mensaje, tipo) VALUES (?,?,?)');
            $sn->bind_param('iss', $p['lider_actual_id'], $msg, $tipo);
            $sn->execute();
        }

        $db->commit();
        jsonResponse(['success' => true, 'message' => '¡Oferta colocada exitosamente! Eres el líder.'], 201);

    } catch (Exception $e) {
        $db->rollback();
        jsonError('Error al procesar la puja: ' . $e->getMessage(), 500);
    }
}

jsonError('Método o ruta no válida.', 404);

// ── Formatea fila de producto para el frontend ────────────
function formatProducto(array $p): array {
    return [
        'id'            => $p['id'],
        'nombre'        => $p['nombre'],
        'categoria'     => $p['categoria'],
        'descripcion'   => $p['descripcion'],
        'imagen'        => $p['imagen_url'],
        'precioInicial' => (float)$p['precio_inicial'],
        'ofertaActual'  => (float)$p['oferta_actual'],
        'liderActual'   => $p['lider_actual_id'],
        'liderNombre'   => $p['lider_nombre'] ? trim($p['lider_nombre'] . ' ' . $p['lider_apellido']) : null,
        'vendedorId'    => $p['vendedor_id'],
        'vendedorNombre'=> trim($p['vendedor_nombre'] . ' ' . $p['vendedor_apellido']),
        'fechaCreacion' => $p['fecha_creacion'],
        'fechaCierre'   => $p['fecha_cierre'],
        'estado'        => $p['estado'],
        'ganadorNombre' => $p['ganador_nombre'] ? trim($p['ganador_nombre'] . ' ' . $p['ganador_apellido']) : null,
        'ofertaGanadora'=> $p['oferta_ganadora'] ? (float)$p['oferta_ganadora'] : null,
    ];
}
