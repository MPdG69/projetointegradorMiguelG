
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

if ($_SESSION["usuario"]["tipo"] === "anonimo") {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Usuários anônimos não podem criar personagens."
    ]);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);

$nome = trim($dados["nome"] ?? "");
$classe = trim($dados["classe"] ?? "");

if ($nome === "") {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Informe o nome do personagem."
    ]);
    exit;
}

$usuarioId = $_SESSION["usuario"]["id"];
$id = uniqid("p_");

try {
    $sql = "INSERT INTO personagens
            (id, usuario_id, nome, classe, nivel, gnivel, divinity_val)
            VALUES
            (:id, :usuario_id, :nome, :classe, 1, 1, 50)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":id" => $id,
        ":usuario_id" => $usuarioId,
        ":nome" => $nome,
        ":classe" => $classe
    ]);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Personagem criado com sucesso!",
        "personagem" => [
            "id" => $id,
            "nome" => $nome,
            "classe" => $classe,
            "nivel" => 1,
            "gnivel" => 1
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao criar personagem."
    ]);
}
?>
