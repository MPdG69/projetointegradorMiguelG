
<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

function responder($sucesso, $mensagem) {
    echo json_encode([
        "sucesso" => $sucesso,
        "mensagem" => $mensagem
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verificar login
if (!isset($_SESSION["usuario"])) {
    http_response_code(401);
    responder(false, "Você precisa estar logado.");
}

$usuario = $_SESSION["usuario"];
$usuarioId = $usuario["id"];
$tipoUsuario = $usuario["tipo"];

// Anônimos não podem registrar rolagens
if ($tipoUsuario === "anonimo") {
    http_response_code(403);
    responder(false, "Usuários anônimos não podem registrar rolagens.");
}

// Receber dados
$dados = json_decode(file_get_contents("php://input"), true);

if (
    !is_array($dados) ||
    empty($dados["personagem_id"]) ||
    !isset($dados["resultado"])
) {
    http_response_code(400);
    responder(false, "Dados da rolagem inválidos.");
}

$personagemId = $dados["personagem_id"];
$tipo = substr((string)($dados["tipo"] ?? ""), 0, 50);
$nome = substr((string)($dados["nome"] ?? ""), 0, 100);
$resultado = substr((string)$dados["resultado"], 0, 255);
$detalhes = (string)($dados["detalhes"] ?? "");
$critico = !empty($dados["critico"]) ? 1 : 0;

try {
    // Verificar se o personagem existe
    $consulta = $pdo->prepare(
        "SELECT usuario_id FROM personagens WHERE id = ?"
    );
    $consulta->execute([$personagemId]);

    $personagem = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$personagem) {
        http_response_code(404);
        responder(false, "Personagem não encontrado.");
    }

    // Verificar permissão
    if (
        $tipoUsuario !== "admin" &&
        $personagem["usuario_id"] != $usuarioId
    ) {
        http_response_code(403);
        responder(false, "Você não tem permissão para registrar rolagens neste personagem.");
    }

    // Inserir rolagem
    $inserir = $pdo->prepare(
        "INSERT INTO rolagens
        (personagem_id, tipo, nome, resultado, detalhes, critico)
        VALUES (?, ?, ?, ?, ?, ?)"
    );

    $inserir->execute([
        $personagemId,
        $tipo,
        $nome,
        $resultado,
        $detalhes,
        $critico
    ]);

    responder(true, "Rolagem registrada com sucesso.");

} catch (PDOException $e) {
    error_log("Erro ao registrar rolagem: " . $e->getMessage());

    http_response_code(500);
    responder(false, "Erro ao registrar a rolagem no banco de dados.");
}
?>
