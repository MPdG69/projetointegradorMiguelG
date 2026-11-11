
<?php
header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

$codigo = $_GET["convite"] ?? "";

if (empty($codigo)) {
    http_response_code(400);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Código de convite não informado."
    ]);
    exit;
}

try {
    $sql = "SELECT id, nome, descricao, img, privada, link
            FROM campanhas
            WHERE link = :codigo
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":codigo" => $codigo
    ]);

    $campanha = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campanha) {
        http_response_code(404);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Convite inválido ou campanha inexistente."
        ]);
        exit;
    }

    echo json_encode([
        "sucesso" => true,
        "campanha" => [
            "id" => $campanha["id"],
            "nome" => $campanha["nome"],
            "descricao" => $campanha["descricao"],
            "img" => $campanha["img"],
            "privada" => (bool) $campanha["privada"],
            "convite" => $campanha["link"]
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao consultar o convite."
    ]);
}
?>
