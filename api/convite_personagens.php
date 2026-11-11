
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

// Verifica se o usuário está logado
if (!isset($_SESSION["usuario"])) {
    http_response_code(401);
    responder(false, "Você precisa fazer login para continuar.");
}

$codigo = $_GET["convite"] ?? "";

if (empty($codigo)) {
    http_response_code(400);
    responder(false, "Código de convite não informado.");
}

try {
    // Procura a campanha pelo código do convite
    $stmt = $pdo->prepare("
        SELECT id, nome, privada
        FROM campanhas
        WHERE link = :codigo
        LIMIT 1
    ");

    $stmt->execute([":codigo" => $codigo]);
    $campanha = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campanha) {
        http_response_code(404);
        responder(false, "Convite inválido ou campanha inexistente.");
    }

    $usuario_id = $_SESSION["usuario"]["id"];

    // Busca os personagens pertencentes ao usuário
    // que ainda não estão em outra campanha
    $stmt = $pdo->prepare("
        SELECT id, nome, classe, nivel, img, campanha_id
        FROM personagens
        WHERE usuario_id = :usuario_id
        AND (campanha_id IS NULL OR campanha_id = :campanha_id)
        ORDER BY nome ASC
    ");

    $stmt->execute([
        ":usuario_id" => $usuario_id,
        ":campanha_id" => $campanha["id"]
    ]);

    $personagens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    responder(true, "Personagens carregados.", [
        "campanha" => [
            "id" => $campanha["id"],
            "nome" => $campanha["nome"],
            "privada" => (bool) $campanha["privada"]
        ],
        "personagens" => $personagens
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    responder(false, "Erro ao buscar personagens.");
}
?>
