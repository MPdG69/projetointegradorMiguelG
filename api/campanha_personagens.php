
<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

function responder($sucesso, $mensagem = "", $dados = []) {
    echo json_encode(array_merge([
        "sucesso" => $sucesso,
        "mensagem" => $mensagem
    ], $dados));
    exit;
}

// Apenas administradores podem gerenciar participantes.
if (!isset($_SESSION["usuario"]) || $_SESSION["usuario"]["tipo"] !== "admin") {
    http_response_code(403);
    responder(false, "Acesso permitido apenas para administradores.");
}

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo === "GET") {
    $campanha_id = $_GET["campanha_id"] ?? "";

    if (!$campanha_id) {
        responder(false, "Campanha não informada.");
    }

    $verificar = $pdo->prepare("SELECT id FROM campanhas WHERE id = :id");
    $verificar->execute([":id" => $campanha_id]);

    if (!$verificar->fetch()) {
        responder(false, "Campanha não encontrada.");
    }

    // Personagens disponíveis para adicionar.
    $sql = "
        SELECT p.id, p.nome, p.classe, p.nivel, p.campanha_id,
               u.nome AS dono
        FROM personagens p
        LEFT JOIN usuarios u ON u.id = p.usuario_id
        WHERE p.campanha_id IS NULL OR p.campanha_id = :campanha_id
        ORDER BY p.nome ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([":campanha_id" => $campanha_id]);
    $personagens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Personagens que já participam da campanha.
    $stmt = $pdo->prepare("
        SELECT p.id, p.nome, p.classe, p.nivel,
               u.nome AS dono
        FROM personagens p
        LEFT JOIN usuarios u ON u.id = p.usuario_id
        WHERE p.campanha_id = :campanha_id
        ORDER BY p.nome ASC
    ");

    $stmt->execute([":campanha_id" => $campanha_id]);
    $participantes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    responder(true, "", [
        "personagens" => $personagens,
        "participantes" => $participantes
    ]);
}

if ($metodo === "POST") {
    $dados = json_decode(file_get_contents("php://input"), true);

    $acao = $dados["acao"] ?? "";
    $campanha_id = $dados["campanha_id"] ?? "";
    $personagem_id = $dados["personagem_id"] ?? "";

    if (!$campanha_id || !$personagem_id) {
        responder(false, "Dados incompletos.");
    }

    if (!in_array($acao, ["adicionar", "remover"], true)) {
        responder(false, "Ação inválida.");
    }

    $stmt = $pdo->prepare("SELECT id FROM campanhas WHERE id = :id");
    $stmt->execute([":id" => $campanha_id]);

    if (!$stmt->fetch()) {
        responder(false, "Campanha não encontrada.");
    }

    $stmt = $pdo->prepare("
        SELECT id, campanha_id
        FROM personagens
        WHERE id = :id
    ");
    $stmt->execute([":id" => $personagem_id]);
    $personagem = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$personagem) {
        responder(false, "Personagem não encontrado.");
    }

    if ($acao === "adicionar") {
        if ($personagem["campanha_id"] === $campanha_id) {
            responder(false, "Esse personagem já participa da campanha.");
        }

        if ($personagem["campanha_id"] !== null) {
            responder(false, "Esse personagem já pertence a outra campanha. Remova-o dela primeiro.");
        }

        $stmt = $pdo->prepare("
            UPDATE personagens
            SET campanha_id = :campanha_id
            WHERE id = :personagem_id AND campanha_id IS NULL
        ");

        $stmt->execute([
            ":campanha_id" => $campanha_id,
            ":personagem_id" => $personagem_id
        ]);

        if ($stmt->rowCount() === 0) {
            responder(false, "Não foi possível adicionar o personagem.");
        }

        responder(true, "Personagem adicionado à campanha.");
    }

    if ($acao === "remover") {
        if ($personagem["campanha_id"] !== $campanha_id) {
            responder(false, "Esse personagem não participa desta campanha.");
        }

        $stmt = $pdo->prepare("
            UPDATE personagens
            SET campanha_id = NULL
            WHERE id = :personagem_id AND campanha_id = :campanha_id
        ");

        $stmt->execute([
            ":personagem_id" => $personagem_id,
            ":campanha_id" => $campanha_id
        ]);

        responder(true, "Personagem removido da campanha.");
    }
}

http_response_code(405);
responder(false, "Método não permitido.");
