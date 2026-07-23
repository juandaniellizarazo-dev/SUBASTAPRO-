<?php
// api/notificaciones.php
// GET   /api/notificaciones.php          → últimas 30 del usuario
// PATCH /api/notificaciones.php?id=X    → marcar como leída
require_once __DIR__ . '/config.php';

$user   = requireAuth();
$uid    = $user['id'];
$method = $_SERVER['REQUEST_METHOD'];
$nid    = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db     = getDB();

if ($method === 'GET') {
    $st = $db->prepare("
        SELECT id, mensaje, tipo, leida, fecha
        FROM notificaciones
        WHERE usuario_id = ? AND leida = 0
        ORDER BY fecha DESC
        LIMIT 30
    ");
    $st->bind_param('i', $uid);
    $st->execute();
    $rows = $st->get_result()->fetch_all(MYSQLI_ASSOC);
    jsonResponse(['success' => true, 'notificaciones' => $rows]);
}

if ($method === 'PATCH' && $nid) {
    $st = $db->prepare('UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?');
    $st->bind_param('ii', $nid, $uid);
    $st->execute();
    jsonResponse(['success' => true]);
}

jsonError('Método o ruta no válida.', 404);
