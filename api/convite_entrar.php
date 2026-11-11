
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

if (!isset($_SESSION["usuario"])) {
    http_response_code(401);
    responder(false, "Você precisa fazer login.");
}

$dados = json_decode(file_get_contents("php://input"), true);

$codigo = $dados["convite"] ?? "";
$personagem_id = $dados["personagem_id"] ?? "";
$senha = $dados["senha"] ?? "";

if (empty($codigo) || empty($personagem_id)) {
    http_response_code(400);
    responder(false, "Dados incompletos.");
}

$usuario_id = $_SESSION["usuario"]["id"];

try {
    $pdo->beginTransaction();

    // Localiza a campanha
    $stmt = $pdo->prepare("
        SELECT id, nome, privada, senha_hash
        FROM campanhas
        WHERE link = :codigo
        LIMIT 1
    ");

    $stmt->execute([":codigo" => $codigo]);
    $campanha = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campanha) {
        $pdo->rollBack();
        http_response_code(404);
        responder(false, "Convite inválido ou campanha inexistente.");
    }

    // Verifica a senha de campanhas privadas
    if ((bool) $campanha["privada"]) {
        $ja_autorizado = in_array(
            $campanha["id"],
            $_SESSION["campanhas_acessadas"] ?? [],
            true
        );

        if (!$ja_autorizado) {
            if (
                empty($senha) ||
                empty($campanha["senha_hash"]) ||
                !password_verify($senha, $campanha["senha_hash"])
            ) {
                $pdo->rollBack();
                http_response_code(403);
                responder(false, "Senha da campanha incorreta.");
            }
        }
    }

    // Busca e bloqueia o personagem durante a operação
    $stmt = $pdo->prepare("
        SELECT id, campanha_id
        FROM personagens
        WHERE id = :personagem_id
        AND usuario_id = :usuario_id
        FOR UPDATE
    ");

    $stmt->execute([
        ":personagem_id" => $personagem_id,
        ":usuario_id" => $usuario_id
    ]);

    $personagem = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$personagem) {
        $pdo->rollBack();
        http_response_code(403);
        responder(false, "Personagem não encontrado ou não pertence à sua conta.");
    }

    // Impede entrada em outra campanha
    if (
        $personagem["campanha_id"] !== null &&
        $personagem["campanha_id"] !== $campanha["id"]
    ) {
        $pdo->rollBack();
        http_response_code(409);
        responder(false, "Este personagem já pertence a outra campanha.");
    }

    // Associa o personagem à campanha
    if ($personagem["campanha_id"] === null) {
        $stmt = $pdo->prepare("
            UPDATE personagens
            SET campanha_id = :campanha_id
            WHERE id = :personagem_id
            AND usuario_id = :usuario_id
            AND campanha_id IS NULL
        ");

        $stmt->execute([
            ":campanha_id" => $campanha["id"],
            ":personagem_id" => $personagem_id,
            ":usuario_id" => $usuario_id
        ]);
    }

    $pdo->commit();

    // Libera o acesso à campanha privada nesta sessão
    if (!isset($_SESSION["campanhas_acessadas"])) {
        $_SESSION["campanhas_acessadas"] = [];
    }

    if (!in_array(
        $campanha["id"],
        $_SESSION["campanhas_acessadas"],
        true
    )) {
        $_SESSION["campanhas_acessadas"][] = $campanha["id"];
    }

    responder(true, "Personagem associado à campanha.", [
        "campanha_id" => $campanha["id"],
        "personagem_id" => $personagem_id
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    responder(false, "Erro ao adicionar personagem à campanha.");
}
?>
