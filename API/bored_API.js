async function buscarDados() {
  // Se o contentor das piadas não existir na página atual, interrompe a execução
  if (!document.getElementById("jokesAPI")) {
    return;
  }

  try {
    const response = await fetch("https://icanhazdadjoke.com", {
      headers: {
        Accept: "application/json",
        "User-Agent": "MiniprojetoTDW",
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const dados = await response.json();
    const listaHtml = document.getElementById("jokesAPI");

    listaHtml.innerHTML = "";

    dados.results.forEach((piada) => {
      const li = document.createElement("li");
      const botao = document.createElement("button");

      botao.textContent = piada.joke;
      botao.classList.add("list-group-item", "list-group-item-action");

      botao.type = "button";
      botao.dataset.id = piada.id;
      botao.dataset.joke = piada.joke;

      botao.setAttribute("data-bs-toggle", "modal");
      botao.setAttribute("data-bs-target", "#detalhesModal");

      li.appendChild(botao);
      listaHtml.appendChild(li);
    });
  } catch (error) {
    console.error("Ocorreu um erro ao procurar os dados:", error);
  }
}

// Executa a chamada à API
buscarDados();

// Configuração segura do Modal (Master-Detail)
const modal = document.getElementById("detalhesModal");

if (modal) {
  modal.addEventListener("show.bs.modal", (event) => {
    const botao = event.relatedTarget;

    const modalPiada = document.getElementById("modalPiada");
    const modalId = document.getElementById("modalId");

    // Injeta os dados apenas se os elementos existirem no HTML da página atual
    if (modalPiada) {
      modalPiada.textContent = botao.dataset.joke;
    }

    if (modalId) {
      modalId.textContent = `Identificador: ${botao.dataset.id}`;
    }
  });
}
