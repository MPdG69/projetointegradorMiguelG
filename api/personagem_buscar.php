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

$id = $_GET["id"] ?? "";

if ($id === "") {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "ID do personagem não informado."
    ]);
    exit;
}

$usuario = $_SESSION["usuario"];

try {
    $sql = "SELECT p.*
            FROM personagens p
            LEFT JOIN campanhas c ON p.campanha_id = c.id
            WHERE p.id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([":id" => $id]);

    $personagem = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$personagem) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Personagem não encontrado."
        ]);
        exit;
    }

    if ($usuario["tipo"] === "admin") {
        // Administradores podem visualizar qualquer personagem.
    } elseif ($usuario["tipo"] === "anonimo") {
        if ($personagem["campanha_id"] === null) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Este personagem não é público."
            ]);
            exit;
        }

        $sql = "SELECT privada FROM campanhas WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([":id" => $personagem["campanha_id"]]);
        $campanha = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$campanha || $campanha["privada"]) {
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Este personagem não é público."
            ]);
            exit;
        }
    } elseif ((string)$personagem["usuario_id"] !== (string)$usuario["id"]) {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Você não tem permissão para acessar esta ficha."
        ]);
        exit;
    }

    $personagem["atributos"] = [
        "Força" => (int)$personagem["forca"],
        "Destreza" => (int)$personagem["destreza"],
        "Compostura" => (int)$personagem["compostura"],
        "Fé" => (int)$personagem["fe"],
        "Inteligência" => (int)$personagem["inteligencia"],
        "Carisma" => (int)$personagem["carisma"],
        "Mente" => (int)$personagem["mente"],
        "Corpo" => (int)$personagem["corpo"],
        "Alma" => (int)$personagem["alma"]
    ];

    $personagem["defesa"] = [
        "esquiva_natural" => (int)$personagem["esq_natural"],
        "esquiva_escudo" => (int)$personagem["esq_escudo"],
        "esquiva_armadura" => (int)$personagem["esq_armadura"],
        "esquiva_itens" => (int)$personagem["esq_itens"],
        "esquiva_tecnicas" => (int)$personagem["esq_tecnicas"],
        "esquiva_reflexos" => (int)$personagem["esq_reflexos"]
    ];

    $stmt = $pdo->prepare(
        "SELECT nome, atributo_associado, treino, outros
         FROM pericias WHERE personagem_id = :id"
    );
    $stmt->execute([":id" => $id]);

    $personagem["pericias"] = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $pericia) {
        $personagem["pericias"][$pericia["nome"]] = [
            "atributo" => $pericia["atributo_associado"],
            "treino" => (int)$pericia["treino"],
            "outros" => (int)$pericia["outros"]
        ];
    }

    // Objeto vazio vira {} no JSON (e não []), mantendo o formato esperado pelo JS
    if (empty($personagem["pericias"])) {
        $personagem["pericias"] = new stdClass();
    }

    $stmt = $pdo->prepare(
        "SELECT * FROM inventario WHERE personagem_id = :id"
    );
    $stmt->execute([":id" => $id]);

    $personagem["inventario"] = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $item) {
        $personagem["inventario"][$item["id"]] = [
            "nome" => $item["nome"],
            "peso" => $item["peso"],
            "tipo" => $item["tipo"],
            "desc" => $item["descricao"],
            "dano" => $item["arma_dano"],
            "teste" => $item["arma_teste"],
            "critico" => $item["arma_critico"]
        ];
    }

    $stmt = $pdo->prepare(
        "SELECT * FROM habilidades WHERE personagem_id = :id"
    );
    $stmt->execute([":id" => $id]);

    $personagem["habilidadesPassivas"] = [];
    $personagem["habilidadesAtivas"] = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $habilidade) {
        $h = [
            "nome" => $habilidade["nome"],
            "categoria" => $habilidade["categoria"],
            "tipo" => $habilidade["tipo_habilidade"],
            "ativa" => (bool)$habilidade["magia_ativa"],
            "arcanos" => $habilidade["arcanos"],
            "forma" => $habilidade["forma"],
            "funcao" => $habilidade["funcao"],
            "efeito" => $habilidade["efeito"],
            "duracao" => $habilidade["duracao"],
            "alvos" => $habilidade["alvos"],
            "custo" => $habilidade["custo"],
            "amplificadores" => $habilidade["amplificadores"],
            "concedido" => $habilidade["concedido"],
            "dados" => $habilidade["dados"],
            "dano" => $habilidade["dano"],
            "desc" => $habilidade["descricao"],
            "expandida" => (bool)$habilidade["expandida"]
        ];

        if ($habilidade["tipo_habilidade"] === "passiva") {
            $personagem["habilidadesPassivas"][] = $h;
        } else {
            $personagem["habilidadesAtivas"][] = $h;
        }
    }

    $stmt = $pdo->prepare(
        "SELECT tipo, descricao FROM resistencias WHERE personagem_id = :id"
    );
    $stmt->execute([":id" => $id]);

    $personagem["resistencias"] = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $resistencia) {
        $personagem["resistencias"][] = [
            "tipo" => $resistencia["tipo"],
            "desc" => $resistencia["descricao"]
        ];
    }

    echo json_encode([
        "sucesso" => true,
        "personagem" => $personagem
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao buscar personagem."
    ]);
}
?>