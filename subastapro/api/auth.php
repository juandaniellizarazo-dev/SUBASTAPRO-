<?php
// api/auth.php
// POST /api/auth.php?action=registro
// POST /api/auth.php?action=login
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

// ── REGISTRO ─────────────────────────────────────────────
if ($action === 'registro' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $b = requireBody(['nombre','apellido','email','password']);

    $nombre   = trim($b['nombre']);
    $apellido = trim($b['apellido']);
    $email    = strtolower(trim($b['email']));
    $password = $b['password'];
    $catNombre = $b['categoriaInteres'] ?? null;

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonError('El formato de correo es inválido.');
    if (strlen($password) < 8) jsonError('La contraseña debe tener mínimo 8 caracteres.');

    $db = getDB();

    // ¿Email ya existe?
    $st = $db->prepare('SELECT id FROM usuarios WHERE email = ?');
    $st->bind_param('s', $email);
    $st->execute();
    if ($st->get_result()->num_rows > 0) jsonError('El correo electrónico ya está registrado.', 409);

    // Resolver categoría
    $catId = null;
    if ($catNombre) {
        $sc = $db->prepare('SELECT id FROM categorias WHERE nombre = ?');
        $sc->bind_param('s', $catNombre);
        $sc->execute();
        $row = $sc->get_result()->fetch_assoc();
        if ($row) $catId = $row['id'];
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $si = $db->prepare('INSERT INTO usuarios (nombre, apellido, email, password_hash, categoria_interes_id) VALUES (?,?,?,?,?)');
    $si->bind_param('ssssi', $nombre, $apellido, $email, $hash, $catId);
    if (!$si->execute()) jsonError('Error al registrar usuario.', 500);

    $userId = $db->insert_id;
    $user   = ['id' => $userId, 'nombre' => $nombre, 'apellido' => $apellido, 'email' => $email];
    $token  = jwtEncode(array_merge($user, ['exp' => time() + 7 * 86400]));

    jsonResponse(['success' => true, 'message' => 'Registro completado con éxito.', 'user' => $user, 'token' => $token], 201);
}

// ── LOGIN ─────────────────────────────────────────────────
if ($action === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $b = requireBody(['email','password']);

    $email    = strtolower(trim($b['email']));
    $password = $b['password'];

    $db = getDB();
    $st = $db->prepare('SELECT id, nombre, apellido, email, password_hash FROM usuarios WHERE email = ?');
    $st->bind_param('s', $email);
    $st->execute();
    $u = $st->get_result()->fetch_assoc();

    if (!$u || !password_verify($password, $u['password_hash'])) {
        jsonError('Correo electrónico o contraseña incorrectos.', 401);
    }

    $user  = ['id' => $u['id'], 'nombre' => $u['nombre'], 'apellido' => $u['apellido'], 'email' => $u['email']];
    $token = jwtEncode(array_merge($user, ['exp' => time() + 7 * 86400]));

    jsonResponse(['success' => true, 'message' => 'Inicio de sesión correcto.', 'user' => $user, 'token' => $token]);
}

jsonError('Acción no válida.', 404);
