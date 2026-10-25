// nav.js
//  LOGICA DE CORES E TEMAS (Executa assim que o DOM estiver pronto)
document.addEventListener("DOMContentLoaded", () => {
  const savedScheme = localStorage.getItem("colorScheme") || "default";
  const savedTheme = localStorage.getItem("theme") || "light";

  // Aplica o Dark/Light Mode no elemento raiz (HTML)
  document.documentElement.setAttribute("data-bs-theme", savedTheme);
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  // Aplica o Esquema de Cores dinâmico ao body
  const body = document.body;
  if (body) {
    body.classList.remove("theme-danger", "theme-primary", "theme-accent");

    switch (savedScheme) {
      case "default":
        body.classList.add("theme-danger");
        break;
      case "blue":
        body.classList.add("theme-primary");
        break;
      case "purple":
        body.classList.add("theme-accent");
        break;
    }
  }

  //  NAVBAR DINÂMICA COM ARRAY DE OBJETOS
  const navItems = [
    { name: "Timer", url: "index.html" },
    { name: "Pausas", url: "breaks.html" },
    { name: "Definições", url: "settings.html" },
  ];

  const navLinksContainer = document.getElementById("nav-links");
  if (navLinksContainer) {
    // Limpa os botões estáticos do HTML para evitar duplicações
    navLinksContainer.innerHTML = "";

    // Lógica para extrair a página atual sem falhar na raiz do servidor 
    let currentPath = window.location.pathname.split("/").pop() || "index.html";
    if (currentPath === "") {
      currentPath = "index.html";
    }

    for (const item of navItems) {
      const li = document.createElement("li");
      li.classList.add("nav-item");

      const link = document.createElement("a");
      link.textContent = item.name;
      link.href = item.url;
      link.classList.add("nav-link", "nav-btn");

      // Se for a página ativa, adiciona o destaque visual correto
      if (item.url === currentPath) {
        link.classList.add("active");
      }

      li.appendChild(link);
      navLinksContainer.appendChild(li);
    }
  }

  // LOGICA DO TEMPORIZADOR GLOBAL EM FORMATO BADGE NA NAVBAR
  const globalTimerBadge = document.getElementById("global-timer-badge");
  const globalTimerText = document.getElementById("global-timer-text");

  function checkGlobalTimer() {
    const isRunning = localStorage.getItem("pomodoroRunning") === "true";
    const endTime = parseInt(localStorage.getItem("pomodoroEndTime"), 10);

    if (!globalTimerBadge || !globalTimerText) return;

    if (isRunning && endTime) {
      const now = Date.now();
      const difference = Math.round((endTime - now) / 1000);

      if (difference > 0) {
        const minutes = Math.floor(difference / 60);
        const seconds = difference % 60;
        const formattedMinutes = String(minutes).padStart(2, "0");
        const formattedSeconds = String(seconds).padStart(2, "0");

        globalTimerText.textContent = `${formattedMinutes}:${formattedSeconds}`;
        globalTimerBadge.classList.remove("hidden");
      } else {
        // Se o tempo acabou noutra página, esconde a badge
        globalTimerBadge.classList.add("hidden");
      }
    } else {
      globalTimerBadge.classList.add("hidden");
    }
  }

  // Executar imediatamente e depois a cada segundo
  checkGlobalTimer();
  setInterval(checkGlobalTimer, 1000);
});
