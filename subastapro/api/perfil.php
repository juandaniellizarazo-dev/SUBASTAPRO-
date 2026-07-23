<?php
// api/perfil.php
// GET /api/perfil.php  → perfil completo del usuario autenticado
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Método no permitido.', 405);

$user = requireAuth();
$uid  = $user['id'];
$db   = getDB();

// ── Datos básicos del usuario ─────────────────────────────
$st = $db->prepare('SELECT id, nombre, apellido, email, fecha_registro FROM usuarios WHERE id = ?');
$st->bind_param('i', $uid);
$st->execute();
$userData = $st->get_result()->fetch_assoc();
if (!$userData) jsonError('Usuario no encontrado.', 404);

// ── Estadísticas generales ────────────────────────────────

// Total de lotes publicados
$sq = $db->prepare('SELECT COUNT(*) AS total FROM productos WHERE vendedor_id = ?');
$sq->bind_param('i', $uid);
$sq->execute();
$totalPublicados = $sq->get_result()->fetch_assoc()['total'];

// Total de subastas en que participó (como pujador)
$sp = $db->prepare('SELECT COUNT(DISTINCT producto_id) AS total FROM ofertas WHERE usuario_id = ?');
$sp->bind_param('i', $uid);
$sp->execute();
$totalParticipaciones = $sp->get_result()->fetch_assoc()['total'];

// Subastas ganadas
$sg = $db->prepare('SELECT COUNT(*) AS total FROM productos WHERE ganador_id = ? AND estado = "finalizada"');
$sg->bind_param('i', $uid);
$sg->execute();
$totalGanadas = $sg->get_result()->fetch_assoc()['total'];

// Mayor puja realizada
$sm = $db->prepare('SELECT MAX(valor) AS max_puja FROM ofertas WHERE usuario_id = ?');
$sm->bind_param('i', $uid);
$sm->execute();
$mayorPuja = $sm->get_result()->fetch_assoc()['max_puja'] ?? 0;

// Total acumulado pujado
$sa = $db->prepare('SELECT SUM(valor) AS total FROM (SELECT MAX(valor) AS valor FROM ofertas WHERE usuario_id = ? GROUP BY producto_id) t');
$sa->bind_param('i', $uid);
$sa->execute();
$totalPujado = $sa->get_result()->fetch_assoc()['total'] ?? 0;

// ── Lotes publicados ──────────────────────────────────────
$sl = $db->prepare("
    SELECT p.id, p.nombre, p.imagen_url AS imagen, p.precio_inicial, p.oferta_actual,
           p.fecha_cierre, p.estado, p.ganador_id,
           c.nombre AS categoria,
           (SELECT COUNT(*) FROM ofertas o WHERE o.producto_id = p.id) AS total_ofertas,
           g.nombre AS ganador_nombre, g.apellido AS ganador_apellido
    FROM productos p
    JOIN categorias c ON c.id = p.categoria_id
    LEFT JOIN usuarios g ON g.id = p.ganador_id
    WHERE p.vendedor_id = ?
    ORDER BY p.fecha_creacion DESC
");
$sl->bind_param('i', $uid);
$sl->execute();
$lotesPublicados = $sl->get_result()->fetch_all(MYSQLI_ASSOC);

// ── Subastas en que participó (como pujador) ──────────────
$sb = $db->prepare("
    SELECT p.id, p.nombre, p.imagen_url AS imagen, p.oferta_actual,
           p.fecha_cierre, p.estado, p.lider_actual_id, p.ganador_id,
           c.nombre AS categoria,
           MAX(o.valor) AS mi_mejor_puja,
           MAX(o.fecha) AS fecha_ultima_puja
    FROM ofertas o
    JOIN productos p ON p.id = o.producto_id
    JOIN categorias c ON c.id = p.categoria_id
    WHERE o.usuario_id = ?
    GROUP BY p.id
    ORDER BY fecha_ultima_puja DESC
");
$sb->bind_param('i', $uid);
$sb->execute();
$misParticipaciones = $sb->get_result()->fetch_all(MYSQLI_ASSOC);

// Agregar estado del pujador en cada participación
foreach ($misParticipaciones as &$item) {
    if ($item['estado'] === 'activa') {
        $item['estado_pujador'] = (string)$item['lider_actual_id'] === (string)$uid ? 'Ganando' : 'Superado';
    } else {
        $item['estado_pujador'] = (string)$item['ganador_id'] === (string)$uid ? 'Ganado' : 'Perdido';
    }
}

jsonResponse([
    'success' => true,
    'usuario' => [
        'id'              => $userData['id'],
        'nombre'          => $userData['nombre'],
        'apellido'        => $userData['apellido'],
        'email'           => $userData['email'],
        'fecha_registro'  => $userData['fecha_registro'],
    ],
    'estadisticas' => [
        'total_publicados'     => (int)$totalPublicados,
        'total_participaciones'=> (int)$totalParticipaciones,
        'total_ganadas'        => (int)$totalGanadas,
        'mayor_puja'           => (float)$mayorPuja,
        'total_pujado'         => (float)$totalPujado,
    ],
    'lotes_publicados'   => $lotesPublicados,
    'participaciones'    => $misParticipaciones,
]);
