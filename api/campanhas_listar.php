
<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

try {
    // Usuários sem sessão PHP podem visualizar apenas campanhas públicas.
    $usuario = $_SESSION["usuario"] ?? null;

    if (!$usuario || $usuario["tipo"] === "anonimo") {
        $sql = "SELECT id, nome, descricao, img, privada, link,
                       criado_por_usuario_id
                FROM campanhas
                WHERE privada = 0";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    } else {
        // Usuários normais e administradores visualizam todas.
        $sql = "SELECT id, nome, descricao, img, privada, link,
                       criado_por_usuario_id
                FROM campanhas";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    }

    $campanhas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($campanhas as &$campanha) {
        $campanha["privada"] = (bool)$campanha["privada"];
    }
    unset($campanha);

    echo json_encode([
        "sucesso" => true,
        "campanhas" => $campanhas
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log("Erro ao listar campanhas: " . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao carregar campanhas."
    ], JSON_UNESCAPED_UNICODE);
}
?>
