<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "conexao.php";

$dados = json_decode(file_get_contents("php://input"), true);

$nome = trim($dados["nome"] ?? "");
$username = trim($dados["username"] ?? "");
$email = trim($dados["email"] ?? "");
$senha = $dados["senha"] ?? "";

if (!$nome || !$username || !$email || !$senha) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Preencha todos os campos."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "E-mail inválido."
    ]);
    exit;
}

if (strlen($senha) < 6) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "A senha precisa ter pelo menos 6 caracteres."
    ]);
    exit;
}

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

try {
    $sql = "INSERT INTO usuarios (username, nome, email, senha_hash)
            VALUES (:username, :nome, :email, :senha)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":username" => $username,
        ":nome" => $nome,
        ":email" => $email,
        ":senha" => $senhaHash
    ]);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Conta criada com sucesso!"
    ]);

} catch (PDOException $e) {

    if ($e->getCode() == "23000") {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Esse nome de usuário ou e-mail já está cadastrado."
        ]);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao cadastrar usuário."
        ]);
    }
}