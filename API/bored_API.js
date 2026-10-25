async function buscarDados() {
  // Se o contentor das facts não existir na página atual, interrompe a execução
  if (!document.getElementById("factAPI")) {
    return;
  }

  try {
    const response = await fetch(
      "https://uselessfacts.jsph.pl/api/v2/facts/random",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "MiniprojetoTDW",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const dados = await response.json();
    const listaHtml = document.getElementById("factAPI");

    listaHtml.innerHTML = "";

    dados.results.forEach((fact) => {
      const li = document.createElement("li");
      const botao = document.createElement("button");

      botao.textContent = fact.text;
      botao.classList.add("list-group-item", "list-group-item-action");

      botao.type = "button";
      botao.dataset.id = fact.id;
      botao.dataset.text = fact.text;

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

    const modalfact = document.getElementById("modalfact");
    const modalId = document.getElementById("modalId");

    // Injeta os dados apenas se os elementos existirem no HTML da página atual
    if (modalfact) {
      modalfact.textContent = botao.dataset.text;
    }

    if (modalId) {
      modalId.textContent = `Identificador: ${botao.dataset.id}`;
    }
  });
}
