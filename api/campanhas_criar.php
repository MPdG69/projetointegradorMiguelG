<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

$usuario = $_SESSION["usuario"] ?? null;

if (!$usuario || $usuario["tipo"] !== "admin") {
    http_response_code(401);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Apenas administradores podem criar campanhas."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);

if (!is_array($dados)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Dados inválidos."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$nome = trim($dados["nome"] ?? "");
$descricao = trim($dados["desc"] ?? "");
$img = trim($dados["img"] ?? "");
$privada = !empty($dados["privada"]);
$senha = $dados["senha"] ?? "";

if ($nome === "") {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Informe o nome da campanha."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($privada && trim($senha) === "") {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Campanhas privadas precisam de uma senha."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $id = bin2hex(random_bytes(8));
    $link = bin2hex(random_bytes(16));
    $senhaHash = $privada ? password_hash($senha, PASSWORD_DEFAULT) : null;

    $sql = "INSERT INTO campanhas
            (id, nome, descricao, img, privada, senha_hash, link, criado_por_usuario_id)
            VALUES
            (:id, :nome, :descricao, :img, :privada, :senha_hash, :link, :criador)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":id" => $id,
        ":nome" => $nome,
        ":descricao" => $descricao,
        ":img" => $img,
        ":privada" => $privada ? 1 : 0,
        ":senha_hash" => $senhaHash,
        ":link" => $link,
        ":criador" => $usuario["id"]
    ]);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Campanha criada com sucesso.",
        "campanha" => [
            "id" => $id,
            "nome" => $nome,
            "desc" => $descricao,
            "img" => $img,
            "privada" => $privada,
            "link" => $link,
            "dono" => $usuario["id"]
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log("Erro ao criar campanha: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao criar campanha."
    ], JSON_UNESCAPED_UNICODE);
}
?>