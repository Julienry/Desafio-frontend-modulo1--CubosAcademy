const { format } = require("date-fns");
const dados = require("../dados/bancodedados");

function checarValor(valor) {
  if (isNaN(valor)) {
    return "O valor deve ser informado corretamente.";
  }
  if (!valor || valor <= 0) {
    return "Deve ser informado um valor maior que zero.";
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

function checarSaldo(saldo, valor) {
  const valorFinal = saldo - valor;
  if (valorFinal < 0) {
    return "Não há saldo disponível para";
  }
  return valorFinal;
}

function registrarTransacao(numConta, valor) {
  const data = new Date();
  return {
    data: format(data, "dd-MM-yyyy kk:mm:ss"),
    numero_conta: numConta,
    valor,
  };
}

function registrarTransferencia(numContaOrigem, numContaDestino, valor) {
  const data = new Date();
  return {
    data: format(data, "dd-MM-yyyy kk:mm:ss"),
    numero_conta_origem: numContaOrigem,
    numero_conta_destino: numContaDestino,
    valor,
  };
}

function depositar(req, res) {
  const numeroConta = Number(req.body.numero_conta);
  const valor = Number(req.body.valor);

  const erroNumero = checarNumConta(numeroConta);
  if (erroNumero) {
    return res.status(erroNumero[1]).json({ mensagem: erroNumero[0] });
  }
  const erroValor = checarValor(valor);
  if (erroValor) {
    return res.status(400).json({ mensagem: erroValor });
  }

  dados.contas[numeroConta - 1].saldo += valor;
  dados.depositos.push(registrarTransacao(numeroConta, valor));
  res.status(204).json();
}

function sacar(req, res) {
  const numeroConta = Number(req.body.numero_conta);
  const senha = req.body.senha;
  const valor = Number(req.body.valor);

  const erroNumero = checarNumConta(numeroConta);
  if (erroNumero) {
    return res.status(erroNumero[1]).json({ mensagem: erroNumero[0] });
  }
  const erroSenha = checarSenha(senha, numeroConta - 1);
  if (erroSenha) {
    return res.status(401).json({ mensagem: erroSenha });
  }
  const erroValor = checarValor(valor);
  if (erroValor) {
    return res.status(400).json({ mensagem: erroValor });
  }

  const valorSaque = checarSaldo(dados.contas[numeroConta - 1].saldo, valor);
  if (isNaN(valorSaque)) {
    return res.status(403).json({ mensagem: `${valorSaque} saque.` });
  }
  dados.contas[numeroConta - 1].saldo = valorSaque;
  dados.saques.push(registrarTransacao(numeroConta, valor));
  res.status(204).json();
}

function transferir(req, res) {
  const numeroContaOrigem = Number(req.body.numero_conta_origem);
  const numeroContaDestino = Number(req.body.numero_conta_destino);
  const senha = req.body.senha;
  const valor = Number(req.body.valor);

  const erroNumeroOrigem = checarNumConta(numeroContaOrigem);
  if (erroNumeroOrigem) {
    return res
      .status(erroNumeroOrigem[1])
      .json({ mensagem: erroNumeroOrigem[0] });
  }
  const erroNumeroDestino = checarNumConta(numeroContaDestino);
  if (erroNumeroDestino) {
    return res
      .status(erroNumeroDestino[1])
      .json({ mensagem: erroNumeroDestino[0] });
  }
  const erroSenha = checarSenha(senha, numeroContaOrigem - 1);
  if (erroSenha) {
    return res.status(401).json({ mensagem: erroSenha });
  }
  const erroValor = checarValor(valor);
  if (erroValor) {
    return res.status(400).json({ mensagem: erroValor });
  }

  const valorTransferencia = checarSaldo(
    dados.contas[numeroContaOrigem - 1].saldo,
    valor
  );
  if (isNaN(valorTransferencia)) {
    return res
      .status(403)
      .json({ mensagem: `${valorTransferencia} transferência.` });
  }
  dados.contas[numeroContaOrigem - 1].saldo -= valor;
  dados.contas[numeroContaDestino - 1].saldo += valor;
  dados.transferencias.push(
    registrarTransferencia(numeroContaOrigem, numeroContaDestino, valor)
  );
  res.status(204).json();
}

module.exports = { depositar, sacar, transferir };
