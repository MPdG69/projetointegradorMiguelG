<?php
session_start();
header("Content-Type: application/json; charset=utf-8");

require_once "conexao.php";

function responder($sucesso, $mensagem) {
    echo json_encode([
        "sucesso" => $sucesso,
        "mensagem" => $mensagem
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION["usuario"])) {
    http_response_code(401);
    responder(false, "Você precisa estar logado.");
}

$usuario = $_SESSION["usuario"];
$usuarioId = $usuario["id"];
$tipoUsuario = $usuario["tipo"];

if ($tipoUsuario === "anonimo") {
    http_response_code(403);
    responder(false, "Usuários anônimos não podem editar personagens.");
}

$dados = json_decode(file_get_contents("php://input"), true);

if (!is_array($dados) || empty($dados["id"])) {
    http_response_code(400);
    responder(false, "Dados inválidos.");
}

$id = $dados["id"];

try {
    $pdo->beginTransaction();

    // Verificar existência e permissão
    $consulta = $pdo->prepare(
        "SELECT usuario_id FROM personagens WHERE id = ?"
    );
    $consulta->execute([$id]);
    $personagem = $consulta->fetch(PDO::FETCH_ASSOC);

    if (!$personagem) {
        $pdo->rollBack();
        http_response_code(404);
        responder(false, "Personagem não encontrado.");
    }

    if (
        $tipoUsuario !== "admin" &&
        $personagem["usuario_id"] != $usuarioId
    ) {
        $pdo->rollBack();
        http_response_code(403);
        responder(false, "Você não tem permissão para editar este personagem.");
    }

    // =========================================
    // DADOS PRINCIPAIS DO PERSONAGEM
    // =========================================

    $campos = [
        "nome", "classe", "nivel", "gnivel", "dom",
        "lembrancas", "divinity_val", "senha", "img", "anotacoes",
        "pv_atual", "pv_max", "ed_atual", "ed_max",
        "eh_atual", "eh_max", "forca", "destreza",
        "compostura", "fe", "inteligencia", "carisma",
        "mente", "corpo", "alma", "vig_atual",
        "vig_esquivas", "carga_max", "pos_grande",
        "pos_pequena", "esq_natural", "esq_escudo",
        "esq_armadura", "esq_itens", "esq_tecnicas",
        "esq_reflexos"
    ];

    $valores = [];

    foreach ($campos as $campo) {
        $valores[$campo] = $dados[$campo] ?? null;
    }

    $sql = "UPDATE personagens SET " .
        implode(" = ?, ", $campos) . " = ? WHERE id = ?";

    $valores[] = $id;

    $atualizar = $pdo->prepare($sql);
    $atualizar->execute(array_values($valores));


    // =========================================
    // PERÍCIAS
    // =========================================

    if (isset($dados["pericias"]) && is_array($dados["pericias"])) {

    $excluir = $pdo->prepare(
        "DELETE FROM pericias WHERE personagem_id = ?"
    );
    $excluir->execute([$id]);

    $inserir = $pdo->prepare(
        "INSERT INTO pericias
        (personagem_id, nome, atributo_associado, treino, outros)
        VALUES (?, ?, ?, ?, ?)"
    );

    foreach ($dados["pericias"] as $nome => $pericia) {

        if (!is_array($pericia)) {
            continue;
        }

        $atributo = $pericia["atributo"] ?? "";
        $treino = (int) ($pericia["treino"] ?? 0);
        $outros = (int) ($pericia["outros"] ?? 0);

        $inserir->execute([
            $id,
            $nome,
            $atributo,
            $treino,
            $outros
        ]);
    }
}


    // =========================================
    // INVENTÁRIO
    // =========================================

    if (isset($dados["inventario"]) && is_array($dados["inventario"])) {

        $excluir = $pdo->prepare(
            "DELETE FROM inventario WHERE personagem_id = ?"
        );
        $excluir->execute([$id]);

        $inserir = $pdo->prepare(
            "INSERT INTO inventario
            (personagem_id, nome, peso, tipo, descricao,
             arma_dano, arma_teste, arma_critico)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );

        foreach ($dados["inventario"] as $item) {
            $inserir->execute([
                $id,
                $item["nome"] ?? "",
                $item["peso"] ?? 0,
                $item["tipo"] ?? "item",
                $item["desc"] ?? "",
                $item["dano"] ?? null,
                $item["teste"] ?? null,
                $item["critico"] ?? null
            ]);
        }
    }


    // =========================================
    // HABILIDADES PASSIVAS E ATIVAS
    // =========================================

    if (
        isset($dados["habilidadesPassivas"]) &&
        is_array($dados["habilidadesPassivas"]) &&
        isset($dados["habilidadesAtivas"]) &&
        is_array($dados["habilidadesAtivas"])
    ) {
        $excluir = $pdo->prepare(
            "DELETE FROM habilidades WHERE personagem_id = ?"
        );
        $excluir->execute([$id]);

        $inserir = $pdo->prepare(
            "INSERT INTO habilidades
            (personagem_id, nome, tipo_habilidade, categoria,
             descricao, expandida, magia_ativa, arcanos, forma,
             funcao, efeito, duracao, alvos, custo,
             amplificadores, concedido, dados, dano)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        // Habilidades passivas
        foreach ($dados["habilidadesPassivas"] as $habilidade) {
            $inserir->execute([
                $id,
                $habilidade["nome"] ?? "",
                "passiva",
                $habilidade["categoria"] ?? null,
                $habilidade["desc"] ?? "",
                !empty($habilidade["expandida"]) ? 1 : 0,
                0,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]);
        }

        // Habilidades ativas
        foreach ($dados["habilidadesAtivas"] as $habilidade) {
            $inserir->execute([
                $id,
                $habilidade["nome"] ?? "",
                "ativa",
                $habilidade["categoria"] ?? ($habilidade["tipo"] ?? null),
                $habilidade["desc"] ?? "",
                !empty($habilidade["expandida"]) ? 1 : 0,
                !empty($habilidade["ativa"]) ? 1 : 0,
                $habilidade["arcanos"] ?? null,
                $habilidade["forma"] ?? null,
                $habilidade["funcao"] ?? null,
                $habilidade["efeito"] ?? null,
                $habilidade["duracao"] ?? null,
                $habilidade["alvos"] ?? null,
                $habilidade["custo"] ?? null,
                $habilidade["amplificadores"] ?? null,
                $habilidade["concedido"] ?? null,
                $habilidade["dados"] ?? null,
                $habilidade["dano"] ?? null
            ]);
        }
    }


    // =========================================
    // RESISTÊNCIAS
    // =========================================

    if (isset($dados["resistencias"]) && is_array($dados["resistencias"])) {

        $excluir = $pdo->prepare(
            "DELETE FROM resistencias WHERE personagem_id = ?"
        );
        $excluir->execute([$id]);

        $inserir = $pdo->prepare(
            "INSERT INTO resistencias
            (personagem_id, tipo, descricao)
            VALUES (?, ?, ?)"
        );

        foreach ($dados["resistencias"] as $resistencia) {
            $inserir->execute([
                $id,
                $resistencia["tipo"] ?? "",
                $resistencia["desc"] ?? ""
            ]);
        }
    }


    // =========================================
    // FINALIZAR
    // =========================================

    $pdo->commit();

    responder(true, "Ficha salva com sucesso.");

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Erro ao salvar personagem: " . $e->getMessage());

    http_response_code(500);
    responder(false, "Erro ao salvar a ficha no banco de dados.");
}
?>