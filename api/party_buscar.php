
<?php
session_start();

header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

try {
    $id = $_GET["id"] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "ID da campanha não informado."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Buscar campanha
    $stmt = $pdo->prepare("
        SELECT id, nome, descricao, img, privada
        FROM campanhas
        WHERE id = :id
        LIMIT 1
    ");

    $stmt->execute(["id" => $id]);
    $campanha = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campanha) {
        http_response_code(404);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Campanha não encontrada."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Verificar acesso à campanha
    $usuario = $_SESSION["usuario"] ?? null;
    $ehAdmin = $usuario && $usuario["tipo"] === "admin";

    $campanhasAcessadas = $_SESSION["campanhas_acessadas"] ?? [];
    $temAcesso = in_array($id, $campanhasAcessadas);

    if ($campanha["privada"] && !$ehAdmin && !$temAcesso) {
        http_response_code(403);
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Você não tem autorização para acessar esta campanha."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Buscar personagens da campanha
    $stmt = $pdo->prepare("
        SELECT
            id,
            nome,
            classe,
            nivel,
            img,
            pv_atual,
            pv_max,
            ed_atual,
            ed_max,
            eh_atual,
            eh_max
        FROM personagens
        WHERE campanha_id = :campanha_id
        ORDER BY nome ASC
    ");

    $stmt->execute(["campanha_id" => $id]);
    $personagens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Buscar últimas rolagens da campanha
    $stmt = $pdo->prepare("
        SELECT
            r.id,
            r.personagem_id,
            p.nome AS personagem,
            r.tipo,
            r.nome,
            r.resultado,
            r.detalhes,
            r.critico,
            r.criado_em
        FROM rolagens r
        INNER JOIN personagens p ON p.id = r.personagem_id
        WHERE p.campanha_id = :campanha_id
        ORDER BY r.criado_em DESC
        LIMIT 30
    ");

    $stmt->execute(["campanha_id" => $id]);
    $rolagens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rolagens as &$rolagem) {
        $rolagem["critico"] = (bool) $rolagem["critico"];
    }
    unset($rolagem);

    echo json_encode([
        "sucesso" => true,
        "campanha" => $campanha,
        "personagens" => $personagens,
        "rolagens" => $rolagens
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log("Erro ao buscar party: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao carregar os dados da campanha."
    ], JSON_UNESCAPED_UNICODE);
}
?>
