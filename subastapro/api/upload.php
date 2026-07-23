<?php
// api/upload.php
// POST /api/upload.php  — recibe una imagen y la guarda en /uploads/productos/
// Devuelve: { success: true, url: "uploads/productos/abc123.jpg" }
require_once __DIR__ . '/config.php';

requireAuth(); // Solo usuarios logueados pueden subir imágenes

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Método no permitido.', 405);
if (empty($_FILES['imagen'])) jsonError('No se recibió ningún archivo.');

$file  = $_FILES['imagen'];
$error = $file['error'];

if ($error !== UPLOAD_ERR_OK) {
    $msgs = [
        UPLOAD_ERR_INI_SIZE   => 'El archivo supera el límite del servidor (upload_max_filesize).',
        UPLOAD_ERR_FORM_SIZE  => 'El archivo supera el límite del formulario.',
        UPLOAD_ERR_PARTIAL    => 'El archivo se subió de forma incompleta.',
        UPLOAD_ERR_NO_FILE    => 'No se seleccionó ningún archivo.',
        UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal del servidor.',
        UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo en el disco.',
    ];
    jsonError($msgs[$error] ?? "Error de subida (código $error).");
}

// Validar tipo MIME real (no solo la extensión)
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedMimes)) {
    jsonError('Solo se permiten imágenes JPG, PNG, WEBP o GIF.');
}

// Validar tamaño: máx 5 MB
$maxBytes = 5 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    jsonError('El archivo supera el límite de 5 MB.');
}

// Crear carpeta si no existe
$uploadDir = __DIR__ . '/../uploads/productos/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Nombre único para evitar colisiones
$ext      = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    default      => 'jpg'
};
$filename = uniqid('img_', true) . '.' . $ext;
$destPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    jsonError('No se pudo guardar el archivo. Verifica los permisos de la carpeta uploads/.', 500);
}

// URL relativa que el frontend usará como src de la imagen
$url = 'uploads/productos/' . $filename;

jsonResponse(['success' => true, 'url' => $url], 201);
