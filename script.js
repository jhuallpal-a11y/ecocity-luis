
const casillas = document.querySelectorAll(
    '#reto input[type="checkbox"]'
);

const progreso = document.getElementById('progreso');

function actualizarProgreso() {
    let completadas = 0;

    casillas.forEach(function(casilla) {
        if (casilla.checked) {
            completadas++;
        }
    });

    progreso.textContent =
        `Has completado ${completadas} de ${casillas.length} acciones.`;

    if (completadas === casillas.length) {
        progreso.textContent +=
            ' ¡Excelente! Estás contribuyendo a una ciudad más verde.';
    }
}

casillas.forEach(function(casilla) {
    casilla.addEventListener('change', actualizarProgreso);
});

actualizarProgreso();
