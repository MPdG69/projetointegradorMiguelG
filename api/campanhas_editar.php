
<?php
require_once "conexao.php";
session_start();

header("Content-Type: application/json; charset=utf-8");

if (!isset($_SESSION["usuario"])) {
    http_response_code(401);
    echo json_encode(["sucesso" => false, "mensagem" => "Faça login primeiro."]);
    exit;
}

if ($_SESSION["usuario"]["tipo"] !== "admin") {
    http_response_code(403);
    echo json_encode(["sucesso" => false, "mensagem" => "Apenas administradores podem editar campanhas."]);
    exit;
}

$dados = json_decode(file_get_contents("php://input"), true);

$id = $dados["id"] ?? "";
$nome = trim($dados["nome"] ?? "");
$descricao = trim($dados["descricao"] ?? "");
$img = trim($dados["img"] ?? "");
$privada = !empty($dados["privada"]) ? 1 : 0;
$link = trim($dados["link"] ?? "");
$senha = trim($dados["senha"] ?? "");

if (!$id || !$nome || !$link) {
    http_response_code(400);
    echo json_encode(["sucesso" => false, "mensagem" => "Preencha os campos obrigatórios."]);
    exit;
}

try {
    $consulta = $pdo->prepare("SELECT id, senha_hash FROM campanhas WHERE id = ?");
    $consulta->execute([$id]);
    $campanha = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$campanha) {
        http_response_code(404);
        echo json_encode(["sucesso" => false, "mensagem" => "Campanha não encontrada."]);
        exit;
    }

    if ($privada) {
        if ($senha !== "") {
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
        } else {
            $senhaHash = $campanha["senha_hash"];
        }
    } else {
        $senhaHash = null;
    }

    $sql = "UPDATE campanhas
            SET nome = ?, descricao = ?, img = ?, privada = ?,
                senha_hash = ?, link = ?
            WHERE id = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $nome,
        $descricao,
        $img,
        $privada,
        $senhaHash,
        $link,
        $id
    ]);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Campanha atualizada com sucesso."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao atualizar campanha: " . $e->getMessage()
    ]);
}
?>
