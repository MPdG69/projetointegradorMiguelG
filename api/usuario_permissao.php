
<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once "conexao.php";

function responder($sucesso, $mensagem, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode([
        "sucesso" => $sucesso,
        "mensagem" => $mensagem
    ]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(false, "Método não permitido.", 405);
}

if (!isset($_SESSION["usuario"]["id"])) {
    responder(false, "Você precisa estar logado.", 401);
}

$dados = json_decode(file_get_contents("php://input"), true);

$usuarioId = $dados["usuario_id"] ?? null;
$novoTipo = $dados["tipo"] ?? "";

if (!$usuarioId || !in_array($novoTipo, ["admin", "normal"], true)) {
    responder(false, "Dados inválidos.", 400);
}

try {
    $pdo->beginTransaction();

    // Confere se quem está fazendo a alteração ainda é administrador.
    $stmt = $pdo->prepare(
        "SELECT tipo FROM usuarios WHERE id = :id FOR UPDATE"
    );
    $stmt->execute([
        ":id" => $_SESSION["usuario"]["id"]
    ]);

    $administradorAtual = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$administradorAtual || $administradorAtual["tipo"] !== "admin") {
        $pdo->rollBack();
        responder(false, "Você não tem permissão para realizar esta ação.", 403);
    }

    // Busca o usuário que receberá a alteração.
    $stmt = $pdo->prepare(
        "SELECT id, nome, tipo FROM usuarios WHERE id = :id FOR UPDATE"
    );
    $stmt->execute([":id" => $usuarioId]);

    $usuarioAlvo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuarioAlvo) {
        $pdo->rollBack();
        responder(false, "Usuário não encontrado.", 404);
    }

    // Impede que o administrador remova a própria permissão.
    if (
        (string)$usuarioAlvo["id"] === (string)$_SESSION["usuario"]["id"]
        && $novoTipo !== "admin"
    ) {
        $pdo->rollBack();
        responder(false, "Você não pode remover sua própria permissão de administrador.", 400);
    }

    // Impede que o sistema fique sem administradores.
    if ($usuarioAlvo["tipo"] === "admin" && $novoTipo === "normal") {
        $stmt = $pdo->query(
            "SELECT id FROM usuarios WHERE tipo = 'admin' FOR UPDATE"
        );

        $administradores = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($administradores) <= 1) {
            $pdo->rollBack();
            responder(false, "Não é possível remover o último administrador.", 400);
        }
    }

    $stmt = $pdo->prepare(
        "UPDATE usuarios SET tipo = :tipo WHERE id = :id"
    );

    $stmt->execute([
        ":tipo" => $novoTipo,
        ":id" => $usuarioId
    ]);

    $pdo->commit();

    responder(
        true,
        $novoTipo === "admin"
            ? $usuarioAlvo["nome"] . " agora é administrador."
            : "A permissão de administrador de " . $usuarioAlvo["nome"] . " foi removida."
    );

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    responder(false, "Erro ao alterar a permissão do usuário.", 500);
}
