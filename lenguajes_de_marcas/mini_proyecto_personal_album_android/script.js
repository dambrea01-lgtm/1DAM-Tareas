const NOMBRE_ALBUM = "ANDR-clase"; // cambia esto en cada álbum
let allCards = [];
let album = {};
let packCards = [];
let currentCardIndex = 0;
let grouped = {};
let groupNames = [];
let currentGroupIndex = 0;
const cardsPerPage = 20;
const newCards = new Set();
let sobresDisponibles = 1;
let ruletaEnCurso = false;
let currentPage = 0;
let sobresPremiumDisponibles = 0;
let objetivos = {
  trigger: null, // palabra a buscar en triggers
  text: null, // frase exacta a buscar en text
};
let sobresAbiertosDesdeUltimoObjetivo = 0;
let timeoutMostrarSiguiente = null;

// sonido
// Sonidos adicionales
const abrirAlbumSound = new Audio("sound/abrir_album.mp3");
abrirAlbumSound.volume = 0.7;
const cerrarAlbumSound = new Audio("sound/cerrar_album.mp3");
cerrarAlbumSound.volume = 0.7;

const avisoSound = new Audio("sound/aviso.mp3");
avisoSound.volume = 0.7;

const pasarPaginaSound = new Audio("sound/pasar_pagina.mp3");
pasarPaginaSound.volume = 0.7;

const ruletaSpinSound = new Audio("sound/ruleta_giro.mp3");
ruletaSpinSound.volume = 0.7;

const ruletaEndSound = new Audio("sound/ruleta_fin.mp3");
ruletaEndSound.volume = 0.8;

const openPackSound = new Audio("sound/abrir%20sobre.mp3"); // si mantienes el espacio, usa %20; mejor renombrar archivo a abrir_sobre.mp3
openPackSound.volume = 0.7;

openPackSound.addEventListener("canplaythrough", () => {
  console.log("openPackSound: cargado y listo");
});
openPackSound.addEventListener("error", (e) => {
  console.error("openPackSound: error cargando audio", e);
});
// 🔊 Sonido al ampliar carta
const enlargeCardSound = new Audio("sound/ampliar_carta.mp3");
enlargeCardSound.volume = 0.8;
// 🔊 Sonidos de acierto y fallo
const correctSound = new Audio("sound/acierto.mp3");
correctSound.volume = 0.8;
const wrongSound = new Audio("sound/fallo.mp3");
wrongSound.volume = 0.8;
// 🔊 Reproducir iniciar trivial
const iniciarTrivialSound = new Audio("sound/iniciar_trivial.mp3");
iniciarTrivialSound.volume = 0.8;
// Música de fondo normal
const backgroundMusic = new Audio("sound/musica_fondo.mp3");
backgroundMusic.volume = 0.3;
backgroundMusic.loop = true; // Esto hará que se repita automáticamente

// Música de trivia
const triviaMusic = new Audio("sound/musica_trivia.mp3");
triviaMusic.volume = 0.6; // más fuerte
triviaMusic.loop = true; // se repite mientras dura la trivia

//sonido de exito al acertar la tercera pregunta
const successSound = new Audio("sound/exito.mp3"); // coloca tu archivo de sonido
successSound.volume = 0.8;

// Música de fondo inicial solo al primer clic del usuario
let firstInteraction = false;

function initBackgroundMusicOnInteraction() {
  if (firstInteraction) return;
  firstInteraction = true;
  if (musicEnabled && !triviaEnCurso) {
    playBackgroundMusic();
  }
  // Quitamos el listener, ya no es necesario
  window.removeEventListener("click", initBackgroundMusicOnInteraction);
}

// Escuchar cualquier clic en la página para iniciar la música
window.addEventListener("click", initBackgroundMusicOnInteraction, {
  once: true,
});

// -----------------------------
// CONTROL DE MÚSICA GLOBAL
// -----------------------------

// Estado global de música
let musicEnabled = localStorage.getItem("musicEnabled") !== "false";
let triviaEnCurso = false;

// Botón de control
const musicToggleBtn = document.getElementById("musicToggleBtn");
musicToggleBtn.textContent = musicEnabled ? "🔊" : "🔇";

// Funciones que respetan musicEnabled y triviaEnCurso
function playBackgroundMusic() {
  if (!musicEnabled || triviaEnCurso) return; // nunca suena durante trivia
  backgroundMusic.currentTime = backgroundMusic.currentTime || 0;
  backgroundMusic.play().catch((err) => console.warn(err));
}

function playTriviaMusic() {
  if (!musicEnabled) return;
  triviaMusic.currentTime = triviaMusic.currentTime || 0;
  triviaMusic.play().catch((err) => console.warn(err));
}

// Llamar al terminar la trivia
function stopTriviaMusic() {
  triviaMusic.pause();
  triviaEnCurso = false; // indicamos que la trivia terminó
  if (musicEnabled) {
    playBackgroundMusic(); // Solo al salir de trivia
  }
}

// Botón para activar/desactivar música
musicToggleBtn.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  localStorage.setItem("musicEnabled", musicEnabled);

  if (!musicEnabled) {
    // Pausar ambas músicas
    backgroundMusic.pause();
    triviaMusic.pause();
    musicToggleBtn.textContent = "🔇";
  } else {
    musicToggleBtn.textContent = "🔊";
    // Reproducir la música correcta según el estado
    if (triviaEnCurso) {
      // Estamos en trivial → música de trivia
      playTriviaMusic();
    } else {
      // No estamos en trivial → música de fondo
      backgroundMusic.currentTime = 0;
      backgroundMusic
        .play()
        .catch((err) =>
          console.warn("No se pudo reproducir música de fondo:", err)
        );
    }
  }
});

// Cargar cartas
async function loadCards() {
  const res = await fetch("cards.json");
  allCards = await res.json();

  allCards.forEach((card) => (album[card.id] = false));

  grouped = {};
  allCards.forEach((card) => {
    if (!grouped[card.group]) grouped[card.group] = [];
    grouped[card.group].push(card);
  });

  groupNames = Object.keys(grouped).sort();
  currentGroupIndex = 0;
  currentPage = 0; // Reiniciar paginado cuando cargas
  renderAlbum();
  actualizarContadorSobres();
}

function getRandomCard() {
  const rarityProbabilities = {
    comun: 0.25,
    "poco comun": 0.18,
    rara: 0.13,
    "super rara": 0.11,
    "ultra rara": 0.08,
    legendaria: 0.06,
    epica: 0.05,
    secreta: 0.04,
    alternativa: 0.035,
    premium: 0.03,
    especial: 0.025,
    "dorada oscura": 0.02,
    prismatica: 0.015,
    mistica: 0.012,
    infernal: 0.01,
    explosiva: 0.008,
    caotica: 0.007,
    arcana: 0.007,
    magnifico: 0.007,
    aureo: 0.005,
  };

  const rarities = Object.entries(rarityProbabilities);
  let selectedRarity = null;

  while (!selectedRarity) {
    for (const [rarity, probability] of rarities) {
      if (Math.random() <= probability) {
        selectedRarity = rarity;
        break;
      }
    }
  }

  const cardsInRarity = allCards.filter((c) => c.rarity === selectedRarity);
  return cardsInRarity[Math.floor(Math.random() * cardsInRarity.length)];
}

function openPack(tipo = "normal") {
  // Normaliza por si se llamó como event handler (openPack recibe el event)
  if (typeof tipo !== "string") tipo = "normal";

  if (tipo === "normal") {
    sobresAbiertosDesdeUltimoObjetivo++;
    if (sobresAbiertosDesdeUltimoObjetivo >= 10) {
      generarNuevoObjetivo();
    }
  }

  if (tipo === "premium") {
    if (sobresPremiumDisponibles <= 0) {
      avisoSound.currentTime = 0;
      avisoSound
        .play()
        .catch((err) => console.warn("No se pudo reproducir aviso.mp3:", err));
      alert("❌ No tienes sobres premium disponibles");
      return;
    }
  } else {
    if (sobresDisponibles <= 0) {
      avisoSound.currentTime = 0;
      avisoSound
        .play()
        .catch((err) => console.warn("No se pudo reproducir aviso.mp3:", err));
      alert("❌ No tienes sobres normales disponibles");
      return;
    }
  }

  if (packCards.length > 0 && currentCardIndex < packCards.length) {
    avisoSound.currentTime = 0;
    avisoSound
      .play()
      .catch((err) => console.warn("No se pudo reproducir aviso.mp3:", err));
    alert("Aún tienes cartas por abrir del sobre actual.");
    return;
  }

  if (tipo === "premium") {
    sobresPremiumDisponibles--;
  } else {
    sobresDisponibles--;
  }
  actualizarContadorSobres();

  packCards = [];
  currentCardIndex = 0;
  const packContainer = document.getElementById("pack");
  packContainer.innerHTML = "";

  // 🔊 Reproducir sonido solo para sobre NORMAL
  if (tipo === "normal") {
    openPackSound.currentTime = 0;
    openPackSound.play().catch((err) => {
      console.warn("No se pudo reproducir openPackSound:", err);
    });
  }

  for (let i = 0; i < 5; i++) {
    const card = tipo === "premium" ? getPremiumCard() : getRandomCard();
    packCards.push(card);
  }

  showNextCard();
}

function showNextCard() {
  const packContainer = document.getElementById("pack");

  if (currentCardIndex >= packCards.length) {
    const finishMsg = document.createElement("p");
    finishMsg.textContent = "¡Has abierto todas las cartas del sobre!";
    packContainer.appendChild(finishMsg);
    return;
  }

  // 🔊 Sonido al abrir nueva carta
  openPackSound.currentTime = 0;
  openPackSound.play().catch((err) => {
    console.warn("No se pudo reproducir el sonido al abrir carta:", err);
  });

  const card = packCards[currentCardIndex];
  const cardDiv = document.createElement("div");
  cardDiv.className = "card";

  const img = document.createElement("img");
  img.src = card.image;
  img.alt = card.name;

  const nameDiv = document.createElement("div");
  nameDiv.className = "card-name";
  nameDiv.textContent = card.name;

  cardDiv.appendChild(img);
  cardDiv.appendChild(nameDiv);
  cardDiv.addEventListener("click", () => toggleModal(card));

  if (!album[card.id]) {
    album[card.id] = true;
    newCards.add(card.id);
    cardDiv.classList.add("new-card");
  }

  packContainer.appendChild(cardDiv);
  currentCardIndex++;

  const oldBtn = document.getElementById("nextCardBtn");
  if (oldBtn) oldBtn.remove();

  if (currentCardIndex < packCards.length) {
    const nextBtn = document.createElement("button");
    nextBtn.id = "nextCardBtn";
    nextBtn.textContent = "Abrir siguiente carta";
    nextBtn.addEventListener("click", showNextCard);
    packContainer.appendChild(nextBtn);
  } else {
    const finishMsg = document.createElement("p");
    finishMsg.textContent = "¡Sobre completado!";
    packContainer.appendChild(finishMsg);
  }

  renderAlbum();
}

// *** Aquí está la función renderAlbum actualizada ***
function renderAlbum() {
  const albumContainer = document.getElementById("album");
  albumContainer.innerHTML = "";

  if (groupNames.length === 0) {
    albumContainer.textContent = "No hay cartas para mostrar.";
    return;
  }

  const groupName = groupNames[currentGroupIndex];
  const cardsInGroup = grouped[groupName];

  const totalPages = Math.ceil(cardsInGroup.length / cardsPerPage);

  // Limitar currentPage para que no sea fuera de rango
  if (currentPage >= totalPages) currentPage = totalPages - 1;
  if (currentPage < 0) currentPage = 0;

  const start = currentPage * cardsPerPage;
  const end = start + cardsPerPage;
  const cardsToShow = cardsInGroup.slice(start, end);

  const groupCardWrapper = document.createElement("div");
  groupCardWrapper.className = "group-card-wrapper";

  // Barra de navegación con botones y nombre del grupo
  const navDiv = document.createElement("div");
  navDiv.className = "pagination";
  navDiv.style.marginBottom = "1rem"; // Espacio abajo para separar de las cartas
  navDiv.style.display = "flex";
  navDiv.style.alignItems = "center";
  navDiv.style.justifyContent = "center";
  navDiv.style.gap = "1.5rem";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "⬅️";
  prevBtn.disabled = currentGroupIndex === 0;
  prevBtn.style.cursor = prevBtn.disabled ? "not-allowed" : "pointer";
  prevBtn.addEventListener("click", () => {
    if (currentGroupIndex > 0) {
      currentGroupIndex--;
      currentPage = 0;
      renderAlbum();

      pasarPaginaSound.currentTime = 0;
      pasarPaginaSound
        .play()
        .catch((err) =>
          console.warn("No se pudo reproducir pasar_pagina.mp3:", err)
        );
    }
  });

  const groupTitle = document.createElement("span");
  groupTitle.textContent = groupName.toUpperCase();
  groupTitle.style.fontWeight = "bold";
  groupTitle.style.fontSize = "1.2rem";

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "➡️";
  nextBtn.disabled = currentGroupIndex >= groupNames.length - 1;
  nextBtn.style.cursor = nextBtn.disabled ? "not-allowed" : "pointer";
  nextBtn.addEventListener("click", () => {
    if (currentGroupIndex < groupNames.length - 1) {
      currentGroupIndex++;
      currentPage = 0;
      renderAlbum();

      pasarPaginaSound.currentTime = 0;
      pasarPaginaSound
        .play()
        .catch((err) =>
          console.warn("No se pudo reproducir pasar_pagina.mp3:", err)
        );
    }
  });

  navDiv.appendChild(prevBtn);
  navDiv.appendChild(groupTitle);
  navDiv.appendChild(nextBtn);

  groupCardWrapper.appendChild(navDiv);

  // Contenedor de cartas
  const groupCardsContainer = document.createElement("div");
  groupCardsContainer.className = "group-card-grid";

  cardsToShow.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";

    if (album[card.id]) {
      const img = document.createElement("img");
      img.src = card.image;
      img.alt = card.name;
      cardDiv.appendChild(img);
      const objetivoBtn = document.createElement("button");
      objetivoBtn.textContent = "🎯 Usar";
      objetivoBtn.style.marginTop = "5px";
      objetivoBtn.addEventListener("click", () =>
        intentarCumplirObjetivo(card)
      );
      cardDiv.appendChild(objetivoBtn);

      cardDiv.addEventListener("click", () => toggleModal(card));
    } else {
      cardDiv.classList.add("placeholder");
      cardDiv.textContent = `❌ ${card.name}\n😢 No la tienes`;
    }

    groupCardsContainer.appendChild(cardDiv);
  });

  groupCardWrapper.appendChild(groupCardsContainer);

  albumContainer.appendChild(groupCardWrapper);
}

// *** Fin renderAlbum actualizado ***

function toggleModal(card) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImage");
  modalImg.src = card.image;
  modal.classList.remove("hidden");
  // 🔊 Reproducir sonido al ampliar carta
  enlargeCardSound.currentTime = 0;
  enlargeCardSound.play().catch((err) => {
    console.warn("No se pudo reproducir el sonido de ampliar carta:", err);
  });
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// TRIVIA
let preguntas = [];
let preguntaActual = 0;
let aciertosConsecutivos = 0;

async function cargarPreguntas() {
  const res = await fetch("preguntas.json");
  preguntas = await res.json();
}

function iniciarTrivia() {
  triviaEnCurso = true;

  if (musicEnabled) {
    backgroundMusic.pause();
    playTriviaMusic();
  } else {
    backgroundMusic.pause();
    triviaMusic.pause();
  }

  iniciarTrivialSound.currentTime = 0;
  iniciarTrivialSound.play().catch((err) => console.warn(err));

  // Cancelar timeout previo si estaba pendiente
  if (timeoutMostrarSiguiente) {
    clearTimeout(timeoutMostrarSiguiente);
    timeoutMostrarSiguiente = null;
  }
  preguntaActual = 0;
  aciertosConsecutivos = 0;
  document.getElementById("triviaContainer").style.display = "flex";
  document.getElementById("triviaMessage").textContent = "";
  mostrarPregunta();
  actualizarMarcador();
}

function mostrarPregunta() {
  const total = preguntas.length;
  const indiceAleatorio = Math.floor(Math.random() * total);
  const pregunta = preguntas[indiceAleatorio];
  preguntaActual = indiceAleatorio;

  document.getElementById("triviaQuestion").textContent = pregunta.question;

  const respuestasMezcladas = [...pregunta.answers].sort(
    () => Math.random() - 0.5
  );

  const opciones = document.getElementById("triviaOptions");
  opciones.innerHTML = "";

  respuestasMezcladas.forEach((answer) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.style.display = "block";
    btn.style.margin = "0.5rem auto";
    btn.style.transition = "background-color 0.5s ease";
    btn.classList.add("trivia-option-btn");

    btn.addEventListener("click", () =>
      responder(answer, btn, respuestasMezcladas)
    );
    opciones.appendChild(btn);
  });

  actualizarMarcador();
}

function responder(respuesta, botonSeleccionado, respuestas) {
  const correcta = preguntas[preguntaActual].correctAnswer;

  const botones = document.querySelectorAll(".trivia-option-btn");
  botones.forEach((btn) => (btn.disabled = true)); // Desactiva todas las opciones

  if (respuesta === correcta) {
    aciertosConsecutivos++;
    botonSeleccionado.style.backgroundColor = "#4caf50"; // Verde

    // 🔊 Reproducir sonido de acierto
    correctSound.currentTime = 0;
    correctSound.play().catch((err) => {
      console.warn("No se pudo reproducir el sonido de acierto:", err);
    });
  } else {
    aciertosConsecutivos = 0;
    botonSeleccionado.style.backgroundColor = "#f44336"; // Rojo

    // 🔊 Reproducir sonido de fallo
    wrongSound.currentTime = 0;
    wrongSound.play().catch((err) => {
      console.warn("No se pudo reproducir el sonido de fallo:", err);
    });

    // Marcar la correcta también en verde
    botones.forEach((btn) => {
      if (btn.textContent === correcta) {
        btn.style.backgroundColor = "#4caf50";
      }
    });
  }

  actualizarMarcador();

  // Guardamos el timeout en una variable global
  timeoutMostrarSiguiente = setTimeout(() => {
    if (respuesta !== correcta) {
      document.getElementById("triviaContainer").style.display = "none";
      stopTriviaMusic(); // 🎵 volver a música normal
      return;
    }

    if (aciertosConsecutivos >= 3) {
      // 🔊 Reproducir sonido de éxito al completar 3 aciertos
      successSound.currentTime = 0;
      successSound
        .play()
        .catch((err) =>
          console.warn("No se pudo reproducir el sonido de éxito:", err)
        );

      // Ocultar trivia y pasar a ruleta
      document.getElementById("triviaContainer").style.display = "none";
      stopTriviaMusic(); // 🎵 volver a música normal
      lanzarRuleta();
    } else {
      mostrarPregunta();
    }
  }, 1500);
}

function actualizarMarcador() {
  const cont = document.getElementById("triviaAciertos");
  cont.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const icon = document.createElement("span");
    icon.textContent = i < aciertosConsecutivos ? "🔥" : "🖤";
    icon.style.marginRight = "5px";
    icon.style.fontSize = "1.5rem";
    cont.appendChild(icon);
  }
}

function lanzarRuleta() {
  if (ruletaEnCurso) return;
  ruletaEnCurso = true;

  const premios = [
    { tipo: "normal", cantidad: 1 },
    { tipo: "premium", cantidad: 1 }, // 💎 en lugar del 2
    { tipo: "normal", cantidad: 3 },
    { tipo: "normal", cantidad: 5 },
    { tipo: "normal", cantidad: 7 },
    { tipo: "normal", cantidad: 8 },
    { tipo: "premium", cantidad: 2 }, // 💎💎 en lugar del 10
    { tipo: "normal", cantidad: 12 },
    { tipo: "normal", cantidad: 15 },
    { tipo: "normal", cantidad: 20 },
  ];
  const numSectores = premios.length;

  const container = document.getElementById("rouletteContainer");
  const wheel = document.getElementById("rouletteWheel");
  wheel.innerHTML = ""; // Limpiar cualquier contenido anterior

  premios.forEach((premio, i) => {
    const label = document.createElement("div");
    label.className = "label"; // Usa la clase .label del CSS
    label.style.setProperty("--i", i); // Define el sector al que pertenece

    // Decide el texto a mostrar: número o 💎
    let texto =
      premio.tipo === "premium"
        ? "💎".repeat(premio.cantidad)
        : `${premio.cantidad}`;

    label.textContent = texto;

    // Si es premio premium, lo ponemos en dorado
    if (premio.tipo === "premium") {
      label.style.color = "gold";
    }

    wheel.appendChild(label); // Añadir al círculo de la ruleta
  });

  const spinBtn = document.getElementById("spinButton");

  container.classList.remove("hidden");
  container.style.display = "flex";

  spinBtn.disabled = false;
  spinBtn.textContent = "🎯 Tirar Ruleta";

  // Quitar event listeners antiguos para evitar acumulación
  spinBtn.replaceWith(spinBtn.cloneNode(true));
  const newSpinBtn = document.getElementById("spinButton");

  // Evento para iniciar el giro
  newSpinBtn.addEventListener("click", () => {
    if (ruletaEnCurso === false) return;

    newSpinBtn.disabled = true;
    newSpinBtn.textContent = "🎯 Tirando...";

    // 🔊 Reproducir sonido de giro
    ruletaSpinSound.currentTime = 0;
    ruletaSpinSound
      .play()
      .catch((err) => console.warn("Error reproducir giro:", err));

    wheel.style.transition = "none";
    wheel.style.transform = "rotate(0deg)";

    requestAnimationFrame(() => {
      const indexPremio = Math.floor(Math.random() * premios.length);
      const premio = premios[indexPremio];
      const gradosPorSector = 360 / numSectores;
      const sectorFinal = indexPremio * gradosPorSector + gradosPorSector / 2;
      const rotacionFinal = 360 * 5 - sectorFinal;

      wheel.style.transition = "transform 5s cubic-bezier(0.33, 1, 0.68, 1)";
      wheel.style.transform = `rotate(${rotacionFinal}deg)`;

      setTimeout(() => {
        // 🔊 Detener sonido de giro y reproducir sonido de fin
        ruletaSpinSound.pause();
        ruletaEndSound.currentTime = 0;
        ruletaEndSound
          .play()
          .catch((err) => console.warn("Error reproducir fin:", err));

        // Actualizar sobres
        if (premio.tipo === "premium")
          sobresPremiumDisponibles += premio.cantidad;
        else sobresDisponibles += premio.cantidad;
        actualizarContadorSobres();

        const premioTexto =
          premio.tipo === "premium"
            ? `💎 x${premio.cantidad}`
            : `${premio.cantidad} sobres`;
        newSpinBtn.textContent = `🎉 Ganaste ${premioTexto}! Cerrar`;

        newSpinBtn.disabled = false;

        ruletaEnCurso = false;

        newSpinBtn.onclick = () => {
          container.classList.add("hidden");
          container.style.display = "none";
          newSpinBtn.textContent = "🎯 Tirar Ruleta";
          ruletaEnCurso = false;
        };
      }, 5200); // coincide con duración del giro
    });
  });
}

function actualizarContadorSobres() {
  document.getElementById(
    "openPackBtn"
  ).textContent = `🎁 Abrir Sobre (${sobresDisponibles})`;
  document.getElementById(
    "openPremiumPackBtn"
  ).textContent = `💎 Sobre Premium (${sobresPremiumDisponibles})`;
}

document.getElementById("openPackBtn").addEventListener("click", openPack);
document.getElementById("toggleAlbumBtn").addEventListener("click", () => {
  const sec = document.getElementById("albumSection");
  const abrir = sec.style.display === "none";
  sec.style.display = abrir ? "block" : "none";

  if (abrir) {
    abrirAlbumSound.currentTime = 0;
    abrirAlbumSound
      .play()
      .catch((err) =>
        console.warn("No se pudo reproducir abrir_album.mp3:", err)
      );
  } else {
    cerrarAlbumSound.currentTime = 0;
    cerrarAlbumSound
      .play()
      .catch((err) =>
        console.warn("No se pudo reproducir cerrar_album.mp3:", err)
      );
  }
});
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById("btnTrivia").addEventListener("click", iniciarTrivia);

window.onload = async () => {
  await cargarPreguntas();
  await loadCards();
  actualizarContadorSobres();

  // generarNuevoObjetivo(); // 🔒 Desactivado temporalmente
  mostrarObjetivos(); // para que muestre el mensaje "en desarrollo"

  document.getElementById("rouletteContainer").classList.add("hidden");
  document.getElementById("rouletteContainer").style.display = "none";

  triviaEnCurso = false;
  if (musicEnabled) {
    playBackgroundMusic(); // música de fondo inicial
  }
};

function guardarProgreso() {
  const progreso = {
    album,
    sobresDisponibles,
    sobresPremiumDisponibles,
  };
  localStorage.setItem(
    `albumProgreso_${NOMBRE_ALBUM}`,
    JSON.stringify(progreso)
  );
  alert(`💾 Progreso guardado para álbum "${NOMBRE_ALBUM}".`);
}

function cargarProgreso() {
  const data = localStorage.getItem(`albumProgreso_${NOMBRE_ALBUM}`);
  if (!data) {
    alert(`⚠️ No hay progreso guardado para el álbum "${NOMBRE_ALBUM}".`);
    return;
  }

  const progreso = JSON.parse(data);
  album = progreso.album || {};
  sobresDisponibles = progreso.sobresDisponibles ?? 1;
  sobresPremiumDisponibles = progreso.sobresPremiumDisponibles ?? 0;
  renderAlbum();
  actualizarContadorSobres();
  alert(`📂 Progreso cargado para álbum "${NOMBRE_ALBUM}".`);
}

// Eventos
document
  .getElementById("saveProgressBtn")
  .addEventListener("click", guardarProgreso);
document
  .getElementById("loadProgressBtn")
  .addEventListener("click", cargarProgreso);

function getPremiumCard() {
  const rarities = [
    "comun",
    "poco comun",
    "rara",
    "super rara",
    "ultra rara",
    "legendaria",
    "epica",
    "secreta",
    "alternativa",
    "premium",
    "especial",
    "dorada oscura",
    "prismatica",
    "mistica",
    "infernal",
    "explosiva",
    "caotica",
    "arcana",
    "magnifico",
    "aureo",
  ];

  const selectedRarity = rarities[Math.floor(Math.random() * rarities.length)];
  const cardsInRarity = allCards.filter((c) => c.rarity === selectedRarity);
  return cardsInRarity[Math.floor(Math.random() * cardsInRarity.length)];
}

document
  .getElementById("openPremiumPackBtn")
  .addEventListener("click", () => openPack("premium"));

function generarNuevoObjetivo() {
  const cartasValidas = allCards.filter((c) => c.triggers?.length && c.text);
  const cartaAleatoria =
    cartasValidas[Math.floor(Math.random() * cartasValidas.length)];

  objetivos.trigger =
    cartaAleatoria.triggers[
      Math.floor(Math.random() * cartaAleatoria.triggers.length)
    ];
  objetivos.text = cartaAleatoria.text;

  sobresAbiertosDesdeUltimoObjetivo = 0;

  mostrarObjetivos();
}

function mostrarObjetivos() {
  const cont = document.getElementById("objetivosActuales");
  cont.innerHTML = `
    🧩 Sistema de objetivos en desarrollo... próximamente disponible.
  `;
}

function intentarCumplirObjetivo(carta) {
  alert(
    "🚧 El sistema de objetivos está en desarrollo. ¡Próximamente disponible!"
  );
  /* DESARROLLANDO OBJETIVOS
  const cumpleTrigger = carta.triggers?.includes(objetivos.trigger);
  const cumpleTexto = carta.text === objetivos.text;

  if (cumpleTrigger || cumpleTexto) {
    alert(`✅ ¡Objetivo cumplido! Ganaste 1 sobre 💎 premium`);
    sobresPremiumDisponibles++;
    actualizarContadorSobres();
    generarNuevoObjetivo();
    renderAlbum();
  } else {
    alert(
      `❌ Esa carta no cumple ningún objetivo. Ha sido eliminada del álbum.`
    );
    album[carta.id] = false;
    renderAlbum();
  }*/
}
