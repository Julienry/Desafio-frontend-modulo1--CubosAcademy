const dados = require("../dados/bancodedados");

let numUsuario = 1;

function validarConta(conta) {
  if (
    !conta.nome ||
    !conta.cpf ||
    !conta.data_nascimento ||
    !conta.telefone ||
    !conta.email ||
    !conta.senha
  ) {
    return "Todos os campos devem ser informados.";
  }
  if (isNaN(Number(conta.cpf))) {
    return "O cpf deve conter apenas números.";
  }
  if (isNaN(Number(conta.telefone))) {
    return "O telefone deve conter apenas números.";
  }
  if (!conta.email.includes("@")) {
    return "Um email válido deve ser informado.";
  }
}

function compararContas(conta, num) {
  for (let i = 0; i < dados.contas.length; i++) {
    if (dados.contas[num] !== dados.contas[i]) {
      if (dados.contas[i].usuario.email === conta.email) {
        return "O email informado já está em uso.";
      }
      if (dados.contas[i].usuario.cpf === conta.cpf) {
        return "O cpf informado já está em uso.";
      }
    }
  }
}

function checarNumConta(num) {
  if (isNaN(num)) {
    return ["Deve ser informado um número de usuário válido.", 400];
  }
  if (!dados.contas.find((x) => Number(x.numero) === num)) {
    return [`Conta de número ${num} não encontrada.`, 404];
  }
}

function checarSenha(senha, num) {
  if (senha !== dados.contas[num].usuario.senha) {
    return "A senha deve ser informada corretamente.";
  }
}

function listarContas(req, res) {
  const senhaBanco = req.query.senha_banco;

  if (!senhaBanco || senhaBanco !== "Cubos123Bank") {
    return res.status(400).json("A senha deve ser informada corretamente.");
  }

  if (dados.contas.length === 0) {
    return res.json({ mensagem: "Nenhuma conta encontrada." });
  }
  res.json(dados.contas);
}

function saldo(req, res) {
  const senha = req.query.senha;
  const numeroConta = Number(req.query.numero_conta);

  const erroNumero = checarNumConta(numeroConta);
  if (erroNumero) {
    return res.status(erroNumero[1]).json({ mensagem: erroNumero[0] });
  }
  const erroSenha = checarSenha(senha, numeroConta - 1);
  if (erroSenha) {
    return res.status(401).json({ mensagem: erroSenha });
  }

  res.json({ saldo: dados.contas[numeroConta - 1].saldo });
}

function extrato(req, res) {
  const senha = req.query.senha;
  const numeroConta = Number(req.query.numero_conta);

  const erroNumero = checarNumConta(numeroConta);
  if (erroNumero) {
    return res.status(erroNumero[1]).json({ mensagem: erroNumero[0] });
  }
  const erroSenha = checarSenha(senha, numeroConta - 1);
  if (erroSenha) {
    return res.status(401).json({ mensagem: erroSenha });
  }

  const depositos = dados.depositos.filter(
    (deposito) => deposito.numero_conta === numeroConta
  );
  const saques = dados.saques.filter(
    (saque) => saque.numero_conta === numeroConta
  );
  const transferenciasEnviadas = dados.transferencias.filter(
    (transferencia) => transferencia.numero_conta_origem === numeroConta
  );
  const transferenciasRecebidas = dados.transferencias.filter(
    (transferencia) => transferencia.numero_conta_destino === numeroConta
  );
  res.json({
    depositos,
    saques,
    transferenciasEnviadas,
    transferenciasRecebidas,
  });
}

function criarContas(req, res) {
  const erroValidacao = validarConta(req.body);
  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }
  const erroComparacao = compararContas(req.body);
  if (erroComparacao) {
    return res.status(403).json({ mensagem: erroComparacao });
  }

  const novaConta = {
    numero: numUsuario,
    saldo: 0,
    usuario: {
      nome: req.body.nome,
      cpf: req.body.cpf,
      data_nascimento: req.body.data_nascimento,
      telefone: req.body.telefone,
      email: req.body.email,
      senha: req.body.senha,
    },
  };
  numUsuario++;
  dados.contas.push(novaConta);
  res.status(201).json();
}

function atualizarUsuario(req, res) {
  const num = Number(req.params.numeroConta);

  const erroNumero = checarNumConta(num);
  if (erroNumero) {
    return res.status(erroNumero[1]).json({ mensagem: erroNumero[0] });
  }
  const erroValidacao = validarConta(req.body);
  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }
  const erroComparacao = compararContas(req.body, num - 1);
  if (erroComparacao) {
    return res.status(403).json({ mensagem: erroComparacao });
  }

  const novosDados = {
    nome: req.body.nome,
    cpf: req.body.cpf,
    data_nascimento: req.body.data_nascimento,
    telefone: req.body.telefone,
    email: req.body.email,
    senha: req.body.senha,
  };
  dados.contas[num - 1].usuario = novosDados;
  res.status(204).json();
}

function excluirContas(req, res) {
  const num = Number(req.params.numeroConta);
  const erroNumero = checarNumConta(num);

  if (erroNumero) {
    return res.status(erroNumero[1]).json({ mensagem: erroNumero[0] });
  }
  if (dados.contas[num - 1].saldo !== 0) {
    return res.status(403).json({
      mensagem: "Para que a conta seja excluída é necessário um saldo zerado",
    });
  }
  dados.contas.splice(num - 1, 1);
  res.status(204).json();
}

module.exports = {
  listarContas,
  criarContas,
  atualizarUsuario,
  excluirContas,
  saldo,
  extrato,
};
