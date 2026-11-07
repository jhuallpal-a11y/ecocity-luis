
// ========================================
// SOPA DE LETRAS ECOLÓGICA - ECOCITY
// ========================================

// PALABRAS QUE DEBE ENCONTRAR EL JUGADOR
const palabras = [
    "RECICLAJE",
    "PLANETA",
    "AGUA",
    "ENERGIA",
    "RESIDUOS",
    "NATURALEZA",
    "BOSQUE",
    "TIERRA",
    "LIMPIEZA",
    "ECOLOGIA"
];

// CONFIGURACIÓN DEL TABLERO
const tamaño = 12;
const direcciones = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [-1, -1], [1, -1], [-1, 1]
];

let tablero = [];
let posiciones = {};
let encontradas = [];
let seleccion = [];
let arrastrando = false;
let puntos = 0;
let segundos = 180;
let intervalo = null;
let iniciado = false;
let terminado = false;

// ELEMENTOS HTML
const elementoTablero = document.getElementById("tablero");
const listaPalabras = document.getElementById("lista-palabras");
const elementoPuntos = document.getElementById("puntos");
const elementoTiempo = document.getElementById("tiempo");
const elementoProgreso = document.getElementById("progreso");
const mensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");
const botonIniciar = document.getElementById("boton-iniciar");
const botonReiniciar = document.getElementById("boton-reiniciar");
const pantallaBienvenida = document.getElementById("pantalla-bienvenida");
const botonComenzar = document.getElementById("boton-comenzar");
const presentacion = document.getElementById("presentacion");
const panelJuego = document.getElementById("panel-juego");
// ========================================
// CREAR TABLERO VACÍO
// ========================================

function crearTablero() {
    tablero = Array.from(
        { length: tamaño },
        () => Array(tamaño).fill("")
    );

    posiciones = {};

    // Colocar las palabras
    palabras.forEach(palabra => {

        let colocada = false;
        let intentos = 0;

        while (!colocada && intentos < 1000) {

            intentos++;

            const direccion =
                direcciones[Math.floor(Math.random() * direcciones.length)];

            const [filaDir, colDir] = direccion;

            const fila = Math.floor(Math.random() * tamaño);
            const columna = Math.floor(Math.random() * tamaño);

            const ultimaFila = fila + (palabra.length - 1) * filaDir;
            const ultimaColumna = columna + (palabra.length - 1) * colDir;

            // Verificar que la palabra entre en el tablero
            if (
                ultimaFila < 0 || ultimaFila >= tamaño ||
                ultimaColumna < 0 || ultimaColumna >= tamaño
            ) {
                continue;
            }

            // Verificar que no choque con otras palabras
            let espacioLibre = true;

            for (let i = 0; i < palabra.length; i++) {
                const f = fila + i * filaDir;
                const c = columna + i * colDir;

                if (tablero[f][c] !== "" && tablero[f][c] !== palabra[i]) {
                    espacioLibre = false;
                    break;
                }
            }

            if (!espacioLibre) continue;

            // Colocar las letras
            const celdas = [];

            for (let i = 0; i < palabra.length; i++) {

                const f = fila + i * filaDir;
                const c = columna + i * colDir;

                tablero[f][c] = palabra[i];

                celdas.push(`${f}-${c}`);
            }

            posiciones[palabra] = celdas;
            colocada = true;
        }

        if (!colocada) {
            throw new Error("No se pudo colocar la palabra: " + palabra);
        }
    });

    // Rellenar espacios vacíos con letras aleatorias
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let f = 0; f < tamaño; f++) {
        for (let c = 0; c < tamaño; c++) {

            if (tablero[f][c] === "") {
                tablero[f][c] =
                    letras[Math.floor(Math.random() * letras.length)];
            }
        }
    }
}

// ========================================
// MOSTRAR TABLERO EN LA PÁGINA
// ========================================

function mostrarTablero() {

    elementoTablero.innerHTML = "";

    for (let f = 0; f < tamaño; f++) {
        for (let c = 0; c < tamaño; c++) {

            const boton = document.createElement("button");

            boton.className = "letra";
            boton.textContent = tablero[f][c];
            boton.type = "button";

            boton.dataset.fila = f;
            boton.dataset.columna = c;

            boton.addEventListener("pointerdown", (evento) => {

                if (!iniciado || terminado) return;

                evento.preventDefault();

                arrastrando = true;

                seleccion = [{
                    fila: f,
                    columna: c
                }];

                actualizarSeleccion();
            });

            boton.addEventListener("pointerenter", () => {

                if (!arrastrando || !iniciado || terminado) return;

                actualizarRuta(f, c);
            });

            elementoTablero.appendChild(boton);
        }
    }
}

// ========================================
// MOSTRAR LISTA DE PALABRAS
// ========================================

function mostrarPalabras() {

    listaPalabras.innerHTML = "";

    palabras.forEach(palabra => {

        const li = document.createElement("li");

        li.textContent = palabra;
        li.id = "palabra-" + palabra;

        listaPalabras.appendChild(li);
    });
}

// ========================================
// SELECCIONAR LETRAS
// ========================================

function actualizarRuta(fila, columna) {

    if (seleccion.length === 0) return;

    const inicio = seleccion[0];

    const diferenciaFila = fila - inicio.fila;
    const diferenciaColumna = columna - inicio.columna;

    const distancia = Math.max(
        Math.abs(diferenciaFila),
        Math.abs(diferenciaColumna)
    );

    // Solo permitir líneas rectas y diagonales
    if (
        diferenciaFila !== 0 &&
        diferenciaColumna !== 0 &&
        Math.abs(diferenciaFila) !== Math.abs(diferenciaColumna)
    ) {
        return;
    }

    const pasoFila = Math.sign(diferenciaFila);
    const pasoColumna = Math.sign(diferenciaColumna);

    seleccion = [];

    for (let i = 0; i <= distancia; i++) {

        seleccion.push({
            fila: inicio.fila + i * pasoFila,
            columna: inicio.columna + i * pasoColumna
        });
    }

    actualizarSeleccion();
}

// Pintar las letras seleccionadas
function actualizarSeleccion() {

    document.querySelectorAll(".letra").forEach(celda => {

        celda.classList.remove("seleccionada");

        const fila = Number(celda.dataset.fila);
        const columna = Number(celda.dataset.columna);

        const estaSeleccionada = seleccion.some(posicion =>
            posicion.fila === fila &&
            posicion.columna === columna
        );

        if (estaSeleccionada) {
            celda.classList.add("seleccionada");
        }
    });
}

// ========================================
// COMPROBAR PALABRA ENCONTRADA
// ========================================


function comprobarPalabra() {

    if (seleccion.length === 0) return;

    const palabraSeleccionada = seleccion
        .map(posicion => tablero[posicion.fila][posicion.columna])
        .join("");

    const palabraInvertida = palabraSeleccionada
        .split("")
        .reverse()
        .join("");

    const palabraCorrecta = palabras.find(palabra =>
        !encontradas.includes(palabra) &&
        (
            palabra === palabraSeleccionada ||
            palabra === palabraInvertida
        )
    );

    if (palabraCorrecta) {

        encontradas.push(palabraCorrecta);
        puntos += 10;

        const colorClase = "color-" + ((encontradas.length - 1) % 6);

        seleccion.forEach(posicion => {

            const indice =
                posicion.fila * tamaño + posicion.columna;

            const celda = elementoTablero.children[indice];

            celda.classList.remove("seleccionada");
            celda.classList.add("encontrada", colorClase);
        });

        const elemento = document.getElementById(
            "palabra-" + palabraCorrecta
        );

        elemento.classList.add("encontrada", colorClase);
        elemento.textContent = "✓ " + palabraCorrecta;

        mensaje.textContent =
            "¡Excelente! Encontraste " + palabraCorrecta + " 🎉";

        actualizarEstadisticas();

        if (encontradas.length === palabras.length) {
            finalizarJuego(true);
        }

    } else {

        mensaje.textContent = "Sigue intentando. ¡Tú puedes! 🌱";
    }

    seleccion = [];
    actualizarSeleccion();
}


// Detectar cuando el jugador suelta el mouse o termina el toque
document.addEventListener("pointerup", () => {

    if (!arrastrando) return;

    arrastrando = false;

    if (iniciado && !terminado) {
        comprobarPalabra();
    }
});

// ========================================
// ACTUALIZAR PUNTOS Y PROGRESO
// ========================================

function actualizarEstadisticas() {

    elementoPuntos.textContent = puntos;

    elementoProgreso.textContent =
        encontradas.length + "/" + palabras.length;
}

// ========================================
// CRONÓMETRO
// ========================================

function actualizarTiempo() {

    const minutos = Math.floor(segundos / 60);
    const restantes = segundos % 60;

    elementoTiempo.textContent =
        String(minutos).padStart(2, "0") + ":" +
        String(restantes).padStart(2, "0");
}

function iniciarCronometro() {

    clearInterval(intervalo);

    intervalo = setInterval(() => {

        segundos--;

        actualizarTiempo();

        if (segundos <= 0) {
            finalizarJuego(false);
        }

    }, 1000);
}

// ========================================
// INICIAR JUEGO
// ========================================

function iniciarJuego() {

    if (iniciado || terminado) return;

    iniciado = true;

    botonIniciar.disabled = true;
    botonIniciar.textContent = "¡Juego en curso!";

    mensaje.textContent = "¡Encuentra las 10 palabras! 🌎";

    iniciarCronometro();
}

// ========================================
// FINALIZAR JUEGO
// ========================================

f// ========================================
// FINALIZAR JUEGO
// ========================================

function finalizarJuego(victoria) {

    terminado = true;
    iniciado = false;

    arrastrando = false;
    seleccion = [];

    clearInterval(intervalo);

    botonIniciar.disabled = true;

    if (victoria) {

        resultado.classList.add("victoria");

        resultado.innerHTML = `
            <div class="celebracion">
                <div class="trofeo">🏆</div>
                <h2>¡MISIÓN CUMPLIDA!</h2>
                <p>¡Encontraste las 10 palabras ecológicas!</p>
                <h3>⭐ ${puntos} PUNTOS</h3>
                <p>🌱 ¡Eres un verdadero guardián del planeta!</p>
                <div class="confeti">🎉 🌎 🎊 🌿 🎉</div>
            </div>
        `;

        mensaje.textContent =
            "¡Excelente trabajo! Cuidar el planeta está en tus manos.";

    } else {

        resultado.textContent =
            "⏰ ¡Se acabó el tiempo! Conseguíste " +
            puntos + " puntos y encontraste " +
            encontradas.length + " de 10 palabras.";

        mensaje.textContent =
            "¡No te rindas! Puedes intentarlo nuevamente.";
    }
}

// ========================================
// REINICIAR JUEGO
// ========================================

function reiniciarJuego() {

    clearInterval(intervalo);

    puntos = 0;
    segundos = 180;
    encontradas = [];
    seleccion = [];

    arrastrando = false;
    iniciado = false;
    terminado = false;

    resultado.textContent = "";
    resultado.classList.remove("victoria");

    mensaje.textContent =
        "¡Selecciona las letras para encontrar una palabra!";

    botonIniciar.disabled = false;
    botonIniciar.textContent = "▶ Iniciar juego";

    crearTablero();
    mostrarTablero();
    mostrarPalabras();

    actualizarEstadisticas();
    actualizarTiempo();

    pantallaBienvenida.style.display = "block";
    presentacion.style.display = "none";
    panelJuego.style.display = "none";
}
// ========================================
// BOTONES DEL JUEGO
// ========================================

botonIniciar.addEventListener("click", iniciarJuego);

botonReiniciar.addEventListener("click", reiniciarJuego);

botonComenzar.addEventListener("click", () => {
    pantallaBienvenida.style.display = "none";
    presentacion.style.display = "block";
    panelJuego.style.display = "block";
    iniciarJuego();
});

// PREPARAR EL JUEGO AL ABRIR LA PÁGINA
reiniciarJuego();
