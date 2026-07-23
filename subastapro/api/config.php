<?php
// ============================================================
// config.php — Configuración de conexión a MySQL
// Edita estos 4 valores con tus datos de phpMyAdmin / hosting
// ============================================================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Tu usuario de MySQL
define('DB_PASS', '');            // Tu contraseña de MySQL
define('DB_NAME', 'subastapro');  // Nombre de la base de datos

define('JWT_SECRET', 'SubastaProClave2024CambiaEsto');  // Clave secreta para tokens

// Cabeceras CORS — permite que el HTML llame a la API desde cualquier origen
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder preflight OPTIONS inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Conexión ──────────────────────────────────────────────
function getDB(): mysqli {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        $conn->set_charset('utf8mb4');
        if ($conn->connect_error) {
            jsonError('Error de conexión a la base de datos: ' . $conn->connect_error, 500);
        }
    }
    return $conn;
}

// ── Helpers ───────────────────────────────────────────────
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function jsonError(string $message, int $code = 400): void {
    jsonResponse(['success' => false, 'message' => $message], $code);
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function requireBody(array $fields): array {
    $body = getBody();
    foreach ($fields as $f) {
        if (!isset($body[$f]) || $body[$f] === '') {
            jsonError("El campo '$f' es obligatorio.");
        }
    }
    return $body;
}

// ── JWT mínimo (sin librería externa) ────────────────────
function jwtEncode(array $payload): string {
    $header  = base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url(json_encode($payload));
    $sig     = base64url(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function jwtDecode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = base64url(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
    if (isset($data['exp']) && $data['exp'] < time()) return null;
    return $data;
}


function base64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

//ACA INICIA LA CORRECCION DE PRODUCTOS


#function requireAuth(): array {
    #$header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    #$token  = str_starts_with($header, 'Bearer ') ? substr($header, 7) : '';
    #$user   = $token ? jwtDecode($token) : null;
    
    
    #if (!$user) jsonError('Token inválido o no proporcionado.', 401);
    #return $user;
#}
function requireAuth(): array {

    #$header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!$header && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

    if (!$header && function_exists('getallheaders')) {
    $headers = getallheaders();

    if (isset($headers['Authorization'])) {
        $header = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $header = $headers['authorization'];
    }
}

    if (!$header) {
        jsonError("HTTP_AUTHORIZATION VACIO");
    }

    if (!str_starts_with($header, 'Bearer ')) {
        jsonError("NO EMPIEZA CON BEARER");
    }

    $token = substr($header, 7);

    $user = jwtDecode($token);

    if ($user === null) {
        jsonError("JWTDECODE DEVOLVIO NULL");
    }

    return $user;
}


//ACA TERMINA LA CORRECCION DE PRODUCTOS

// ── Cierra subastas vencidas automáticamente ─────────────
function finalizarVencidas(): void {
    $db = getDB();
    $db->query("
        UPDATE productos p
        LEFT JOIN (
            SELECT producto_id, usuario_id, valor
            FROM ofertas o1
            WHERE valor = (SELECT MAX(valor) FROM ofertas o2 WHERE o2.producto_id = o1.producto_id)
            LIMIT 1
        ) mejor ON mejor.producto_id = p.id
        SET p.estado         = 'finalizada',
            p.ganador_id     = mejor.usuario_id,
            p.oferta_ganadora = mejor.valor
        WHERE p.estado = 'activa'
          AND p.fecha_cierre <= NOW()
    ");
}
