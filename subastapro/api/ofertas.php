<?php
// api/ofertas.php
// GET /api/ofertas.php  → historial de pujas del usuario autenticado
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Método no permitido.', 405);

$user = requireAuth();
$db   = getDB();
$uid  = $user['id'];

$st = $db->prepare("
    SELECT o.id, o.valor, o.fecha,
           o.producto_id,
           p.nombre  AS producto_nombre,
           p.estado  AS producto_estado,
           p.imagen_url AS producto_imagen,
           p.oferta_actual AS producto_oferta_actual,
           p.lider_actual_id AS producto_lider_id,
           p.fecha_cierre   AS producto_fecha_cierre
    FROM ofertas o
    JOIN productos p ON p.id = o.producto_id
    WHERE o.usuario_id = ?
    ORDER BY o.fecha DESC
");
$st->bind_param('i', $uid);
$st->execute();
$rows = $st->get_result()->fetch_all(MYSQLI_ASSOC);

jsonResponse(['success' => true, 'ofertas' => $rows]);
