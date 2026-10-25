document.addEventListener("DOMContentLoaded", () => {
  /* OS ELEMENTOS HTML EM VARIÁVEIS */
  const display = document.getElementById("timer-display");
  const modeText = document.getElementById("timer-mode");
  const sessionCountDisplay = document.getElementById("session-count");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const focusBtn = document.getElementById("focus-btn");
  const shortBreakBtn = document.getElementById("short-break-btn");
  const longBreakBtn = document.getElementById("long-break-btn");
  // Modal e objetivos: IDs correspondentes ao HTML
  const modal = document.getElementById("goal-modal");
  const modalInput = document.getElementById("goal-input");
  const confirmGoalBtn = document.getElementById("confirm-goal-btn");
  const closeModalBtn = document.getElementById("cancel-goal-btn");
  const modalXBtn = document.getElementById("close-modal-x");
  const errorMsg = document.getElementById("error-msg");

  const goalDisplayGroup = document.getElementById("goal-display-group");
  const activeGoalText = document.getElementById("active-goal-text");
  const editGoalBtn = document.getElementById("edit-goal-btn");
  // Não executar a lógica do temporizador noutras páginas
  if (!display) return;
  /*  CONFIGURAÇÕES E ESTADO */
  const TIMES = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };
  const MODES = {
    focus: { title: "Modo Foco", button: focusBtn },
    shortBreak: { title: "Pausa Curta", button: shortBreakBtn },
    longBreak: { title: "Pausa Longa", button: longBreakBtn },
  };
  const KEYS = {
    mode: "pomodoroMode",
    sessions: "pomodoroSessions",
    goal: "pomodoroGoal",
    endTime: "pomodoroEndTime",
    running: "pomodoroRunning",
    timeLeft: "pomodoroTimeLeft",
    completedEnd: "pomodoroCompletedEndTime",
  };
  let currentMode = "focus";
  let timeLeft = getDuration("focus");
  let timerInterval = null;
  let targetEnd = null;
  let completedSessions = 0;
  let savedGoal = "";
  let startAfterConfirm = false;
  let storageTimeout = null;
  // Lê a duração personalizada guardada nas definições
  function getDuration(mode) {
    if (mode === "focus") {
      const savedMinutes = Number.parseInt(
        localStorage.getItem("pomodoroFocusTime"),
        10,
      );

      if (
        Number.isFinite(savedMinutes) &&
        savedMinutes >= 1 &&
        savedMinutes <= 180
      ) {
        return savedMinutes * 60;
      }
    }

    return TIMES[mode];
  }
  /*    FUNÇÕES AUXILIARES */
  function readInt(key) {
    const value = Number(localStorage.getItem(key));

    return localStorage.getItem(key) !== null && Number.isSafeInteger(value)
      ? value
      : null;
  }

  function clearRunningState() {
    localStorage.removeItem(KEYS.endTime);
    localStorage.removeItem(KEYS.running);
  }

  function stopInterval() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function setButtons(running) {
    if (startBtn) startBtn.disabled = running;
    if (pauseBtn) pauseBtn.disabled = !running;
  }

  function getRemaining() {
    if (targetEnd === null) return timeLeft;

    return Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000));
  }

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");

    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
  }
  /*      ATUALIZAÇÃO DA INTERFACE  */
  function updateDisplay() {
    const formatted = formatTime(timeLeft);
    const goalTitle = savedGoal ? ` - ${savedGoal}` : "";

    document.title = `(${formatted}) Pomodoro${goalTitle}`;

    display.textContent = formatted;

    // Atualiza também o temporizador da navbar, se existir
    const globalTimerText = document.getElementById("global-timer-text");

    if (globalTimerText) {
      globalTimerText.textContent = formatted;
    }
  }
  function updateGoalUI() {
    if (!goalDisplayGroup || !activeGoalText) return;

    if (savedGoal.trim() !== "") {
      activeGoalText.textContent = savedGoal;
      goalDisplayGroup.classList.remove("hidden");
    } else {
      goalDisplayGroup.classList.add("hidden");
    }
  }
  function updateSessionCount() {
    if (sessionCountDisplay) {
      sessionCountDisplay.textContent = completedSessions;
    }
  }
  /*      MODAL DOS OBJETIVOS  */

  function openModal() {
    if (!modal) return;

    if (modalInput) {
      modalInput.value = savedGoal;
    }

    errorMsg?.classList.add("d-none");

    if (!modal.open) {
      modal.showModal();
    }

    modalInput?.focus();
  }

  function closeModal() {
    startAfterConfirm = false;

    if (modal?.open) {
      modal.close();
    }
  }

  confirmGoalBtn?.addEventListener("click", () => {
    errorMsg?.classList.add("d-none");

    const value = modalInput?.value.trim() || "";

    if (!value) {
      errorMsg?.classList.remove("d-none");
      modalInput?.focus();
      return;
    }
    savedGoal = value;
    localStorage.setItem(KEYS.goal, savedGoal);
    updateGoalUI();
    updateDisplay();
    const shouldStart = startAfterConfirm;
    closeModal();
    if (shouldStart) {
      runTimer();
    }
  });
  closeModalBtn?.addEventListener("click", closeModal);
  modalXBtn?.addEventListener("click", closeModal);
  editGoalBtn?.addEventListener("click", openModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.open) {
      closeModal();
    }
  });
  modalInput?.addEventListener("input", () => {
    errorMsg?.classList.add("d-none");
  });
  modalInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmGoalBtn?.click();
    }
  });
  /*  CONCLUSÃO DE UMA SESSÃO */
  function registerFocusCompletion() {
    completedSessions = (readInt(KEYS.sessions) || 0) + 1;

    localStorage.setItem(KEYS.sessions, completedSessions);

    updateSessionCount();

    const finishedGoal = savedGoal;

    savedGoal = "";

    localStorage.removeItem(KEYS.goal);

    updateGoalUI();

    return finishedGoal;
  }

  // Evita processar novamente uma conclusão já registada
  function claimCompletion(endTime) {
    const completionId = String(endTime);

    if (localStorage.getItem(KEYS.completedEnd) === completionId) {
      return false;
    }

    localStorage.setItem(KEYS.completedEnd, completionId);

    return true;
  }
  function tick() {
    const remaining = getRemaining();

    if (remaining > 0) {
      if (remaining !== timeLeft) {
        timeLeft = remaining;
        updateDisplay();
      }
    } else {
      completeTimer();
    }
  }
  function completeTimer() {
    const completedEnd = targetEnd;

    stopInterval();
    // Confirma que este temporizador ainda é o ativo
    if (localStorage.getItem(KEYS.endTime) !== String(completedEnd)) {
      restoreState();
      return;
    }
    // Reclama a conclusão antes de atualizar as sessões
    if (!claimCompletion(completedEnd)) {
      restoreState();
      return;
    }
    clearRunningState();
    localStorage.removeItem(KEYS.timeLeft);

    const finishedGoal =
      currentMode === "focus" ? registerFocusCompletion() : null;

    timeLeft = getDuration(currentMode);
    targetEnd = null;

    setButtons(false);
    updateDisplay();

    const message =
      currentMode === "focus"
        ? finishedGoal
          ? `🎉 Parabéns! Concluíste o objetivo: "${finishedGoal}"`
          : "🎉 Parabéns! Sessão de foco concluída!"
        : "O tempo de pausa acabou!";

    alert(message);
  }
  /*    INICIAR, PAUSAR E REINICIAR  */
  function runTimer(end = Date.now() + timeLeft * 1000, saveState = true) {
    if (timerInterval) return;

    targetEnd = end;

    if (saveState) {
      localStorage.setItem(KEYS.endTime, String(targetEnd));
      localStorage.setItem(KEYS.running, "true");
      localStorage.removeItem(KEYS.timeLeft);
    }

    setButtons(true);

    updateDisplay();

    timerInterval = setInterval(tick, 250);
  }

  function pauseTimer() {
    if (!timerInterval) return;

    const remaining = getRemaining();

    if (remaining === 0) {
      completeTimer();
      return;
    }

    stopInterval();

    timeLeft = remaining;
    targetEnd = null;

    clearRunningState();

    localStorage.setItem(KEYS.timeLeft, String(timeLeft));

    setButtons(false);
    updateDisplay();
  }

  function resetTimer() {
    stopInterval();

    clearRunningState();
    localStorage.removeItem(KEYS.timeLeft);

    targetEnd = null;
    timeLeft = getDuration(currentMode);

    setButtons(false);
    updateDisplay();
  }

  /*  MUDANÇA DE MODO  */

  function applyMode(mode) {
    if (!Object.hasOwn(TIMES, mode)) return;

    currentMode = mode;

    localStorage.setItem(KEYS.mode, currentMode);

    if (modeText) {
      modeText.textContent = MODES[mode].title;
    }

    Object.values(MODES).forEach(({ button }) => {
      button?.classList.remove("active-mode");
    });

    MODES[mode].button?.classList.add("active-mode");
  }

  function switchMode(mode) {
    if (!Object.hasOwn(TIMES, mode)) return;
    if (mode === currentMode) return;

    if (
      timerInterval &&
      !confirm(
        "O temporizador está a correr. Mudar de modo vai reiniciá-lo. Continuar?",
      )
    ) {
      return;
    }

    applyMode(mode);
    resetTimer();
  }

  /*       RESTAURAR O ESTADO GUARDADO   */

  function restoreState() {
    stopInterval();

    const storedMode = localStorage.getItem(KEYS.mode);

    applyMode(Object.hasOwn(TIMES, storedMode) ? storedMode : "focus");

    completedSessions = readInt(KEYS.sessions) || 0;
    updateSessionCount();

    savedGoal = localStorage.getItem(KEYS.goal) || "";
    updateGoalUI();

    timeLeft = getDuration(currentMode);
    targetEnd = null;

    setButtons(false);

    const storedEnd = readInt(KEYS.endTime);

    const wasRunning =
      localStorage.getItem(KEYS.running) === "true" && storedEnd !== null;

    if (wasRunning) {
      const remaining = Math.ceil((storedEnd - Date.now()) / 1000);

      if (remaining > 0) {
        timeLeft = remaining;

        runTimer(storedEnd, false);
        updateDisplay();

        return;
      }

      // O temporizador terminou enquanto a página estava fechada
      if (claimCompletion(storedEnd)) {
        clearRunningState();
        localStorage.removeItem(KEYS.timeLeft);

        if (currentMode === "focus") {
          registerFocusCompletion();
        }
      } else {
        clearRunningState();
      }
    } else {
      const pausedTime = readInt(KEYS.timeLeft);

      if (
        pausedTime !== null &&
        pausedTime > 0 &&
        pausedTime <= getDuration(currentMode)
      ) {
        timeLeft = pausedTime;
      }
    }

    updateDisplay();
  }

  /*      EVENTOS DOS BOTÕES */
  startBtn?.addEventListener("click", () => {
    if (currentMode === "focus" && !savedGoal.trim()) {
      startAfterConfirm = true;
      openModal();
    } else {
      runTimer();
    }
  });

  pauseBtn?.addEventListener("click", pauseTimer);
  resetBtn?.addEventListener("click", resetTimer);

  Object.entries(MODES).forEach(([mode, { button }]) => {
    button?.addEventListener("click", () => {
      switchMode(mode);
    });
  });

  /*      SINCRONIZAÇÃO ENTRE SEPARADORES   */

  window.addEventListener("storage", (event) => {
    if (
      event.key === null ||
      Object.values(KEYS).includes(event.key) ||
      event.key === "pomodoroFocusTime"
    ) {
      clearTimeout(storageTimeout);

      // Agrupa alterações de estado relacionadas
      storageTimeout = setTimeout(() => {
        restoreState();
      }, 50);
    }
  });

  /*    INICIALIZAÇÃO  */
  restoreState();
});
