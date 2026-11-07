<?php

session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once "conexao.php";

$dados = json_decode(file_get_contents("php://input"), true);

$usuario = trim($dados["usuario"] ?? "");
$senha = $dados["senha"] ?? "";

if (!$usuario || !$senha) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Preencha usuário e senha."
    ]);
    exit;
}

$sql = "SELECT id, username, nome, email, senha_hash, tipo, foto
        FROM usuarios
        WHERE username = :usuario OR email = :usuario
        LIMIT 1";

$stmt = $pdo->prepare($sql);
$stmt->execute([":usuario" => $usuario]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($senha, $user["senha_hash"])) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Usuário ou senha incorretos."
    ]);
    exit;
}

$_SESSION["usuario"] = [
    "id" => $user["id"],
    "nome" => $user["nome"],
    "username" => $user["username"],
    "email" => $user["email"],
    "tipo" => $user["tipo"],
    "foto" => $user["foto"]
];

echo json_encode([
    "sucesso" => true,
    "mensagem" => "Login realizado com sucesso!",
    "usuario" => $_SESSION["usuario"]
]);

?>