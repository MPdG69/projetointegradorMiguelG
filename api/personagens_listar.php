
<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once "conexao.php";

if (!isset($_SESSION["usuario"])) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Você precisa estar logado."
    ]);
    exit;
}

$usuarioId = $_SESSION["usuario"]["id"];

try {
    $sql = "SELECT
                 id, usuario_id, nome, classe, nivel, gnivel,
                campanha_id, dom, img, pv_atual, pv_max,
                ed_atual, ed_max, eh_atual, eh_max
            FROM personagens
            WHERE usuario_id = :usuario_id
            ORDER BY criado_em DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([":usuario_id" => $usuarioId]);

    $personagens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "sucesso" => true,
        "personagens" => $personagens
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao buscar personagens."
    ]);
}
?>
