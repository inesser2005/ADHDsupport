document.addEventListener("DOMContentLoaded", () => {
  /*      ELEMENTOS DA PÁGINA  */
  const themeBtn = document.getElementById("theme-toggle-btn");
  const colorSelect = document.getElementById("color-scheme-select");
  const focusInput = document.getElementById("default-focus-time");
  const animationsToggle = document.getElementById("animations-toggle");
  const saveBtn = document.getElementById("save-all-settings");
  const resetSessionsBtn = document.getElementById("reset-sessions-btn"); // Novo elemento para apagar sessões

  const html = document.documentElement;
  const body = document.body;

  /*  CHAVES DO LOCALSTORAGE */

  const KEYS = {
    theme: "theme",
    colorScheme: "colorScheme",
    focusTime: "pomodoroFocusTime",
    animations: "animations",
    sessionsCount: "sessionsCount", // Chave usada pelo teu timer.js para contar as sessões
  };

  const VALID_THEMES = ["light", "dark"];
  const VALID_SCHEMES = ["default", "blue", "purple", "purple-creative"];

  /*  APLICAR O TEMA  */

  function applyTheme(theme) {
    const validTheme = VALID_THEMES.includes(theme) ? theme : "dark";

    html.setAttribute("data-bs-theme", validTheme);

    if (themeBtn) {
      themeBtn.textContent =
        validTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";

      themeBtn.setAttribute(
        "aria-label",
        `Tema atual: ${validTheme === "dark" ? "escuro" : "claro"}`,
      );

      themeBtn.setAttribute("aria-pressed", String(validTheme === "dark"));
    }
  }

  function toggleTheme() {
    const currentTheme = html.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem(KEYS.theme, newTheme);
    applyTheme(newTheme);
  }

  /*  APLICAR O ESQUEMA DE CORES  */

  function applyColorScheme(scheme) {
    const validScheme = VALID_SCHEMES.includes(scheme)
      ? scheme
      : "purple-creative";

    body.classList.remove(
      "theme-danger",
      "theme-primary",
      "theme-accent",
      "theme-purple-creative",
    );

    switch (validScheme) {
      case "default":
        body.classList.add("theme-danger");
        break;
      case "blue":
        body.classList.add("theme-primary");
        break;
      case "purple":
        body.classList.add("theme-accent");
        break;
      case "purple-creative":
        body.classList.add("theme-purple-creative");
        break;
    }

    if (colorSelect && colorSelect.value !== validScheme) {
      colorSelect.value = validScheme;
    }
  }

  /*  CONTROLAR AS ANIMAÇÕES */

  function controlAnimations(enabled) {
    body.classList.toggle("dialog-instant", !enabled);
    body.classList.toggle("animations-disabled", !enabled);
  }

  /*  VALIDAR AS DEFINIÇÕES GUARDADAS */

  function getSavedFocusTime() {
    const value = Number.parseInt(localStorage.getItem(KEYS.focusTime), 10);
    return Number.isInteger(value) && value >= 1 && value <= 60 ? value : 20;
  }

  function getSavedAnimations() {
    return localStorage.getItem(KEYS.animations) !== "false";
  }

  /* CARREGAR AS PREFERÊNCIAS   */

  function loadPreferences() {
    const theme = localStorage.getItem(KEYS.theme) || "dark";
    const scheme = localStorage.getItem(KEYS.colorScheme) || "purple-creative";
    const animations = getSavedAnimations();

    applyTheme(theme);
    applyColorScheme(scheme);
    controlAnimations(animations);

    if (colorSelect) {
      colorSelect.value = VALID_SCHEMES.includes(scheme)
        ? scheme
        : "purple-creative";
    }

    if (focusInput) {
      focusInput.value = getSavedFocusTime();
    }

    if (animationsToggle) {
      animationsToggle.checked = animations;
    }
  }

  /*  GUARDAR AS DEFINIÇÕES */

  function savePreferences() {
    const focusMinutes = Number(focusInput?.value);

    if (
      !focusInput ||
      !Number.isInteger(focusMinutes) ||
      focusMinutes < 1 ||
      focusMinutes > 60
    ) {
      alert(
        "A duração do foco deve ser um número inteiro entre 1 e 60 minutos.",
      );
      focusInput?.focus();
      return;
    }

    const scheme = colorSelect?.value || "purple-creative";

    if (!VALID_SCHEMES.includes(scheme)) {
      alert("Seleciona um esquema de cores válido.");
      return;
    }

    localStorage.setItem(KEYS.colorScheme, scheme);
    localStorage.setItem(KEYS.focusTime, String(focusMinutes));
    localStorage.setItem(
      KEYS.animations,
      String(animationsToggle?.checked ?? true),
    );

    applyColorScheme(scheme);
    controlAnimations(animationsToggle?.checked ?? true);

    alert("Definições guardadas com sucesso!");
  }

  /*  APAGAR HISTÓRICO DE SESSÕES  */

  function resetSessions() {
    if (
      confirm(
        "Tens a certeza de que queres apagar o contador de sessões de foco concluídas?",
      )
    ) {
      localStorage.setItem(KEYS.sessionsCount, "0");
      alert("Histórico de sessões reiniciado!");

      // Desencadeia o evento storage manualmente para atualizar o ecrã do timer se estiver aberto
      window.dispatchEvent(new Event("storage"));
    }
  }

  /*  EVENTOS DOS CONTROLOS   */

  themeBtn?.addEventListener("click", toggleTheme);

  colorSelect?.addEventListener("change", () => {
    applyColorScheme(colorSelect.value);
  });

  animationsToggle?.addEventListener("change", () => {
    controlAnimations(animationsToggle.checked);
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", savePreferences);
  }

  if (resetSessionsBtn) {
    resetSessionsBtn.addEventListener("click", resetSessions);
  }

  /*       SINCRONIZAR OUTROS SEPARADORES */

  window.addEventListener("storage", (event) => {
    if (event.key === null || Object.values(KEYS).includes(event.key)) {
      loadPreferences();
    }
  });

  /*      INICIALIZAÇÃO */

  loadPreferences();
});
