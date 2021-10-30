const body = document.querySelector("body");

const btnTema = document.querySelector(".btn-theme");
const input = document.querySelector(".input");

const listaFilmes = document.querySelector(".movies");
const btnNext = document.querySelector(".btn-next");
const btnPrev = document.querySelector(".btn-prev");

const videoHighlight = document.querySelector(".highlight__video");
const tituloHighlight = document.querySelector(".highlight__title");
const avaliacaoHighlight = document.querySelector(".highlight__rating");
const generoHighlight = document.querySelector(".highlight__genres");
const lancamentoHighlight = document.querySelector(".highlight__launch");
const descricaoHighlight = document.querySelector(".highlight__description");
const linkHighlight = document.querySelector(".highlight__video-link");

const modal = document.querySelector(".modal");
const tituloModal = document.querySelector(".modal__title");
const imgModal = document.querySelector(".modal__img");
const descricaoModal = document.querySelector(".modal__description");
const avaliacaoModal = document.querySelector(".modal__average");
const generosModal = document.querySelector(".modal__genres");

let temaAtual = localStorage.getItem("tema");
const btnClaro = "./assets/light-mode.svg";
const btnEscuro = "./assets/dark-mode.svg";

let indexBusca = 0;
let contadorBusca = 5;
let resultadosFilmes;

document.body.onload = function () {
  criaDivs();
  criaHighlight();
  iniciarTema();
};

btnTema.addEventListener("click", function () {
  localStorage.setItem("tema", temaAtual === "escuro" ? "claro" : "escuro");
  temaAtual = temaAtual === "escuro" ? "claro" : "escuro";
  mudarTema();
});

modal.addEventListener("click", function () {
  modal.classList.add("hidden");
  const generos = document.querySelectorAll(".modal__genres > *");
  for (let i = 0; i < generos.length; i++) {
    generosModal.removeChild(generos[i]);
  }
});

function iniciarTema() {
  if (!temaAtual) {
    temaAtual = "escuro";
  }
  btnTema.src = temaAtual === "claro" ? btnClaro : btnEscuro;

  body.style.setProperty(
    "--background-color",
    temaAtual === "claro" ? "#fff" : "#242424"
  );
  body.style.setProperty(
    "--highlight-background",
    temaAtual === "claro" ? "#fff" : "#454545"
  );
  body.style.setProperty(
    "--highlight-color",
    temaAtual === "claro" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)"
  );
  body.style.setProperty(
    "--shadow-color",
    temaAtual === "claro"
      ? "0px 4px 8px rgba(0, 0, 0, 0.15)"
      : "0px 4px 8px rgba(255, 255, 255, 0.15)"
  );
  body.style.setProperty(
    "--input-border-color",
    temaAtual === "claro" ? "#979797" : "#fff"
  );
  body.style.setProperty("--color", temaAtual === "claro" ? "#000" : "#fff");
  body.style.setProperty(
    "--highlight-description",
    temaAtual === "claro" ? "#000" : "#fff"
  );
}

function mudarTema() {
  const corDeFundo =
    body.style.getPropertyValue("--background-color") === "#242424"
      ? "#fff"
      : "#242424";

  const corHighlight =
    body.style.getPropertyValue("--highlight-background") === "#454545"
      ? "#fff"
      : "#454545";

  const corSpan =
    body.style.getPropertyValue("--highlight-color") ===
    "rgba(255, 255, 255, 0.7)"
      ? "rgba(0, 0, 0, 0.7)"
      : "rgba(255, 255, 255, 0.7)";

  const corSombra =
    body.style.getPropertyValue("--shadow-color") ===
    "0px 4px 8px rgba(255, 255, 255, 0.15)"
      ? "0px 4px 8px rgba(0, 0, 0, 0.15)"
      : "0px 4px 8px rgba(255, 255, 255, 0.15)";

  const corInput =
    body.style.getPropertyValue("--input-border-color") === "#fff"
      ? "#979797"
      : "#fff";

  const corDeTexto =
    body.style.getPropertyValue("--color") === "#fff" ? "#000" : "#fff";

  btnTema.src = temaAtual === "claro" ? btnClaro : btnEscuro;

  body.style.setProperty("--background-color", corDeFundo);
  body.style.setProperty("--highlight-background", corHighlight);
  body.style.setProperty("--highlight-color", corSpan);
  body.style.setProperty("--shadow-color", corSombra);
  body.style.setProperty("--input-border-color", corInput);
  body.style.setProperty("--color", corDeTexto);
  body.style.setProperty("--highlight-description", corDeTexto);
}

function criaDivs() {
  for (let i = 1; i <= 5; i++) {
    const divFilme = document.createElement("div");
    divFilme.classList.add("movie");
    const divInformacao = document.createElement("div");
    divInformacao.classList.add("movie__info");
    const tituloFilme = document.createElement("span");
    tituloFilme.classList.add("movie__title");
    const avaliacaoFilme = document.createElement("span");
    avaliacaoFilme.classList.add("movie__rating");

    divInformacao.append(tituloFilme, avaliacaoFilme);
    divFilme.append(divInformacao);
    listaFilmes.append(divFilme);
  }
  const filmes = document.querySelectorAll(".movie");
  const titulos = document.querySelectorAll(".movie__title");
  const avaliacoes = document.querySelectorAll(".movie__rating");
  criaFilmes(filmes, titulos, avaliacoes);
}

function criaHighlight() {
  const promiseHighlight = fetch(
    "https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969?language=pt-BR"
  );
  promiseHighlight.then((resposta) => {
    resposta = resposta.json();
    resposta.then((bodyFilme) => {
      videoHighlight.style.backgroundImage = `url(${bodyFilme.backdrop_path})`;
      tituloHighlight.textContent = bodyFilme.title;
      avaliacaoHighlight.textContent = bodyFilme.vote_average;

      let generos = "";
      for (let i = 0; i < bodyFilme.genres.length; i++) {
        generos +=
          i > 0 ? `, ${bodyFilme.genres[i].name}` : bodyFilme.genres[i].name;
      }
      generoHighlight.textContent = generos;
      descricaoHighlight.textContent = bodyFilme.overview;

      const lancamentoData = new Date(bodyFilme.release_date);
      let lancamentoMes = consultaMes(lancamentoData.getMonth());
      lancamentoHighlight.textContent = `${lancamentoData.getDate()} DE ${lancamentoMes} DE ${lancamentoData.getFullYear()}`;
    });
  });

  const promiseLink = fetch(
    "https://tmdb-proxy.cubos-academy.workers.dev/3/movie/436969/videos?language=pt-BR"
  );
  promiseLink.then((resposta) => {
    resposta = resposta.json();
    resposta.then((bodyVideo) => {
      linkHighlight.href = `https://www.youtube.com/watch?v=${bodyVideo.results[1].key}`;
    });
  });
}

function criaFilmes(filmes, titulos, avaliacoes) {
  const promiseFilmes = fetch(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/discover/movie?language=pt-BR&include_adult=false`
  );
  promiseFilmes.then((resposta) => {
    resposta = resposta.json();
    resposta.then((bodyFilme) => {
      resultadosFilmes = bodyFilme.results;
      paginacaoFilmes(resultadosFilmes, filmes, titulos, avaliacoes);

      btnNext.addEventListener("click", function () {
        if (contadorBusca === resultadosFilmes.length) {
          contadorBusca = 5;
          indexBusca = 0;
        } else {
          indexBusca += 5;
          contadorBusca += 5;
          if (
            contadorBusca > resultadosFilmes.length &&
            resultadosFilmes.length < 20
          ) {
            contadorBusca = resultadosFilmes.length;
          }
        }
        paginacaoFilmes(resultadosFilmes, filmes, titulos, avaliacoes);
      });
      btnPrev.addEventListener("click", function () {
        if (
          contadorBusca === resultadosFilmes.length &&
          resultadosFilmes.length < 20
        ) {
          contadorBusca = contadorBusca - (contadorBusca - indexBusca);
          indexBusca = contadorBusca - 5;
        } else {
          contadorBusca -= 5;
          indexBusca = contadorBusca - 5;
        }

        if (contadorBusca <= 0 && resultadosFilmes.length < 20) {
          contadorBusca = resultadosFilmes.length;
          indexBusca = contadorBusca;
          for (let cont = 5; cont < contadorBusca; cont += 5) {
            indexBusca = contadorBusca - cont;
          }
          indexBusca = contadorBusca - indexBusca;
        } else if (contadorBusca <= 0 && resultadosFilmes.length >= 20) {
          contadorBusca = resultadosFilmes.length;
          indexBusca = contadorBusca - 5;
        }
        paginacaoFilmes(resultadosFilmes, filmes, titulos, avaliacoes);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") {
          return;
        }
        if (event.target.value === "") {
          contadorBusca = 5;
          indexBusca = 0;
          resultadosFilmes = bodyFilme.results;
          paginacaoFilmes(resultadosFilmes, filmes, titulos, avaliacoes);
          return;
        }
        buscarFilme(
          event.target.value,
          resultadosFilmes,
          filmes,
          titulos,
          avaliacoes
        );
        event.target.value = "";
      });
      filmes.forEach((filme, i) => {
        filme.addEventListener("click", function () {
          const filmeSelect = resultadosFilmes[i + indexBusca];
          criaModal(filmeSelect);
        });
      });
    });
  });
}

function paginacaoFilmes(resultados, filmes, titulos, avaliacoes) {
  if (resultados.length < 5 + indexBusca) {
    contadorBusca = resultados.length;
    for (let i = 5 + indexBusca; i > contadorBusca; i--) {
      filmes[i - indexBusca - 1].classList.add("hidden");
    }
  }
  for (let i = 0; indexBusca + i < contadorBusca; i++) {
    filmes[i].classList.remove("hidden");
    filmes[i].style.backgroundImage = `url(${
      resultados[indexBusca + i].poster_path
    })`;

    titulos[i].textContent = resultados[indexBusca + i].title;
    avaliacoes[i].innerHTML = resultados[indexBusca + i].vote_average;

    avaliacoes[i].innerHTML = `<img src='./assets/estrela.svg' alt="Estrela">
    ${resultados[indexBusca + i].vote_average}`;
  }
}

function buscarFilme(inputFilme, resultados, filmes, titulos, avaliacoes) {
  const promiseFilmes = fetch(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false&query=${inputFilme}`
  );
  promiseFilmes.then((resposta) => {
    resposta = resposta.json();
    resposta.then((bodyFilme) => {
      if (bodyFilme.total_results === 0) {
        contadorBusca = 5;
        indexBusca = 0;
        resultadosFilmes = resultados;
        paginacaoFilmes(resultadosFilmes, filmes, titulos, avaliacoes);
        return;
      }
      resultadosFilmes = bodyFilme.results;
      contadorBusca = 5;
      indexBusca = 0;
      paginacaoFilmes(resultadosFilmes, filmes, titulos, avaliacoes);
    });
  });
}

function criaModal(filme) {
  const promiseModal = fetch(
    `https://tmdb-proxy.cubos-academy.workers.dev/3/movie/${filme.id}?language=pt-BR`
  );
  promiseModal.then((resposta) => {
    resposta = resposta.json();
    resposta.then((bodyFilme) => {
      modal.classList.remove("hidden");
      tituloModal.textContent = bodyFilme.title;
      imgModal.src = bodyFilme.backdrop_path;
      descricaoModal.textContent = bodyFilme.overview;
      avaliacaoModal.textContent = bodyFilme.vote_average;

      const generoSpan = document.createElement("span");
      generoSpan.classList.add("modal__genre");
      for (let i = 0; i < bodyFilme.genres.length; i++) {
        const generoSpan = document.createElement("span");
        generoSpan.classList.add("modal__genre");
        generoSpan.textContent = bodyFilme.genres[i].name;
        generosModal.append(generoSpan);
      }
    });
  });
}

function consultaMes(mes) {
  switch (mes) {
    case 0:
      mes = "JANEIRO";
      break;
    case 1:
      mes = "FEVEREIRO";
      break;
    case 2:
      mes = "MARÇO";
      break;
    case 3:
      mes = "ABRIL";
      break;
    case 4:
      mes = "MAIO";
      break;
    case 5:
      mes = "JUNHO";
      break;
    case 6:
      mes = "JULHO";
      break;
    case 7:
      mes = "AGOSTO";
      break;
    case 8:
      mes = "SETEMBRO";
      break;
    case 9:
      mes = "OUTUBRO";
      break;
    case 10:
      mes = "NOVEMBRO";
      break;
    case 11:
      mes = "DEZEMBRO";
      break;
  }
  return mes;
}
