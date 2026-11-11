
<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once "conexao.php";

if (!isset($_SESSION["usuario"]["id"])) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Você precisa estar logado."
    ]);
    exit;
}

try {
    // Confere a permissão diretamente no banco.
    $stmt = $pdo->prepare(
        "SELECT tipo FROM usuarios WHERE id = :id LIMIT 1"
    );
    $stmt->execute([":id" => $_SESSION["usuario"]["id"]]);
    $usuarioAtual = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuarioAtual || $usuarioAtual["tipo"] !== "admin") {
        http_response_code(403);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Apenas administradores podem listar usuários."
        ]);
        exit;
    }

    $stmt = $pdo->query(
        "SELECT id, username, nome, email, tipo, foto
         FROM usuarios
         ORDER BY CASE WHEN tipo = 'admin' THEN 0 ELSE 1 END, nome ASC"
    );

    echo json_encode([
        "sucesso" => true,
        "usuarios" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao consultar os usuários."
    ]);
}
