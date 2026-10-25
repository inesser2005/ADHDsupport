// comp/breaks.js
document.addEventListener("DOMContentLoaded", () => {
  const musicContainer = document.getElementById("music-container");
  const songSelect = document.getElementById("song-select");

  if (!musicContainer || !songSelect) return;

  //  Mapeamento dos URLs de incorporação (Embed) do YouTube
  const IFRAME_URLS = {
    none: null,
    jazz: "https://www.youtube.com/embed/ZXni9_91ORs?si=GNjsPGIg752QC09Q",
    radiohead: "https://www.youtube.com/embed/aRa8CUbkzgY?si=Y7fryTRjcH8rNZGM",
    lofi: "https://www.youtube.com/embed/sF80I-TQiW0?si=oAfBYK4CAE1_xB5S",
  };

  /** Função que reconstrói e injeta o iframe ou o estado vazio no DOM  */
  function carregarPlayer(faixa) {
    if (faixa === "none" || !IFRAME_URLS[faixa]) {
      musicContainer.innerHTML = `
        <div class="p-4 text-center border rounded-4" style="background-color: var(--input-bg);">
          <i class="bi bi-disc fs-1 text-secondary" aria-hidden="true"></i>
          <h3 class="h6 mt-3 mb-1">Nenhum som ambiente ativo</h3>
          <p class="text-body-secondary small mb-0">Selecione uma faixa no menu acima para começar.</p>
        </div>
      `;
    } else {
      musicContainer.innerHTML = `
        <div class="ratio ratio-16x9 rounded-4 overflow-hidden shadow-sm border border-secondary border-opacity-25">
          <iframe 
            src="${IFRAME_URLS[faixa]}" 
            title="AttentionSpan Ambient Sound" 
            allow="autoplay; encrypted-media" 
            allowfullscreen
            style="border: none;">
          </iframe>
        </div>
      `;
    }
  }

  // Event listener: Captura a alteração do select e atualiza o iframe
  songSelect.addEventListener("change", (event) => {
    const faixaEscolhida = event.target.value;

    carregarPlayer(faixaEscolhida);

    // Guarda na LocalStorage para persistência do estado
    localStorage.setItem("selectedSong", faixaEscolhida);
  });

  // Carrega a preferência guardada na cache ou 'none'
  const estadoGuardado = localStorage.getItem("selectedSong") || "none";
  songSelect.value = estadoGuardado;
  carregarPlayer(estadoGuardado);
});
