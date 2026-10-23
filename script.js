
/* ===== RETO ECOLÓGICO ===== */

const casillas = document.querySelectorAll(".accion-reto");
// Guardar y recuperar el progreso del reto
const CLAVE_RETO = "ecocity-reto";

function guardarProgreso() {
    const estado = Array.from(casillas).map(function(casilla) {
        return casilla.checked;
    });

    localStorage.setItem(CLAVE_RETO, JSON.stringify(estado));
}

function cargarProgreso() {
    const guardado = localStorage.getItem(CLAVE_RETO);

    if (!guardado) return;

    try {
        const estado = JSON.parse(guardado);

        if (Array.isArray(estado) && estado.length === casillas.length) {
            casillas.forEach(function(casilla, indice) {
                casilla.checked = estado[indice] === true;
            });
        }
    } catch (error) {
        localStorage.removeItem(CLAVE_RETO);
    }
}
const progreso = document.getElementById("progreso");
const porcentajeReto = document.getElementById("porcentaje-reto");
const barraProgreso = document.getElementById("barra-progreso");
const rellenoProgreso = document.getElementById("relleno-progreso");
const mensajeReto = document.getElementById("mensaje-reto");

function actualizarProgreso() {
    let completadas = 0;

    casillas.forEach(function(casilla) {
        if (casilla.checked) {
            completadas++;
        }
    });

    const total = casillas.length;
    const porcentaje = total > 0
        ? Math.round((completadas / total) * 100)
        : 0;

    progreso.textContent =
        `Has completado ${completadas} de ${total} acciones.`;

    porcentajeReto.textContent = porcentaje + "%";
    rellenoProgreso.style.width = porcentaje + "%";

    barraProgreso.setAttribute("aria-valuenow", completadas);

    if (completadas === total && total > 0) {
        mensajeReto.textContent =
            "🎉 ¡Reto completado! Cada acción ayuda a construir una ciudad más verde.";
    } else if (completadas > 0) {
        mensajeReto.textContent =
            "🌱 ¡Vas muy bien! Sigue cumpliendo tus compromisos ecológicos.";
    } else {
        mensajeReto.textContent =
            "¡Empieza con tu primera acción ecológica!";
    }
}

cargarProgreso();

casillas.forEach(function(casilla) {
    casilla.addEventListener("change", function() {
        guardarProgreso();
        actualizarProgreso();
    });
});

actualizarProgreso();


/* ===== MENSAJES DE LAS TARJETAS ===== */

function mostrarAccion(tipo) {
    const mensaje = document.getElementById("mensaje-" + tipo);

    if (!mensaje) {
        return;
    }

    mensaje.hidden = !mensaje.hidden;
}


/* ===== CALCULADORA DE RECICLAJE ===== */


/* ===== REPORTE INTERACTIVO DE RECICLAJE ===== */

const CLAVE_REPORTE = "ecocity-reporte-reciclaje";

let registrosReciclaje = [];

try {
    const datosGuardados = localStorage.getItem(CLAVE_REPORTE);

    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);

        if (Array.isArray(datos)) {
            registrosReciclaje = datos.filter(function(item) {
                return item &&
                    typeof item.material === "string" &&
                    Number.isFinite(item.peso) &&
                    item.peso > 0 &&
                    Number.isFinite(item.precio) &&
                    item.precio >= 0 &&
                    ["plastico", "carton", "papel", "latas"].includes(item.material);
            });
        }
    }
} catch (error) {
    registrosReciclaje = [];
}

function guardarReporte() {
    try {
        localStorage.setItem(
            CLAVE_REPORTE,
            JSON.stringify(registrosReciclaje)
        );
    } catch (error) {
        console.warn("No se pudo guardar el reporte en este navegador.");
    }
}

function agregarAlReporte() {
    const material = document.getElementById("material").value;
    const pesoTexto = document.getElementById("peso").value.trim();
    const precioTexto = document.getElementById("precio").value.trim();

    const peso = Number(pesoTexto);
    const precio = Number(precioTexto);

    if (pesoTexto === "" || !Number.isFinite(peso) || peso <= 0) {
        alert("Ingresa un peso válido mayor que cero.");
        return;
    }

    if (precioTexto === "" || !Number.isFinite(precio) || precio < 0) {
        alert("Ingresa un precio válido igual o mayor que cero.");
        return;
    }

    registrosReciclaje.push({
        material: material,
        peso: peso,
        precio: precio
    });

    guardarReporte();
    actualizarReporte();

    document.getElementById("peso").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("peso").focus();
}

function actualizarReporte() {
    const lista = document.getElementById("lista-reporte");
    const pesoTotalElemento = document.getElementById("peso-total");
    const gananciaElemento = document.getElementById("ganancia-total");
    const cantidadElemento = document.getElementById("cantidad-registros");

    if (!lista || !pesoTotalElemento || !gananciaElemento || !cantidadElemento) {
        return;
    }

    lista.replaceChildren();

    let pesoTotal = 0;
    let gananciaTotal = 0;

    const nombresMateriales = {
        plastico: "Botellas PET",
        carton: "Cartón",
        papel: "Papel",
        latas: "Latas de aluminio"
    };

    if (registrosReciclaje.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 5;
        celda.textContent = "Aún no tienes materiales registrados. ¡Agrega el primero!";
        fila.appendChild(celda);
        lista.appendChild(fila);
    }

    registrosReciclaje.forEach(function(registro, indice) {
        const subtotal = registro.peso * registro.precio;

        pesoTotal += registro.peso;
        gananciaTotal += subtotal;

        const fila = document.createElement("tr");

        const valores = [
            nombresMateriales[registro.material] || registro.material,
            registro.peso.toFixed(2) + " kg",
            "S/ " + registro.precio.toFixed(2),
            "S/ " + subtotal.toFixed(2)
        ];

        valores.forEach(function(valor) {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaAccion = document.createElement("td");
        const botonEliminar = document.createElement("button");

        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "boton-eliminar";
        botonEliminar.setAttribute(
            "aria-label",
            "Eliminar registro de " + valores[0]
        );

        botonEliminar.addEventListener("click", function() {
            registrosReciclaje.splice(indice, 1);
            guardarReporte();
            actualizarReporte();
        });

        celdaAccion.appendChild(botonEliminar);
        fila.appendChild(celdaAccion);
        lista.appendChild(fila);
    });

    pesoTotalElemento.textContent = pesoTotal.toFixed(2) + " kg";
    gananciaElemento.textContent = "S/ " + gananciaTotal.toFixed(2);
    cantidadElemento.textContent = registrosReciclaje.length;
}

function limpiarReporte() {
    if (registrosReciclaje.length === 0) {
        alert("El reporte ya está vacío.");
        return;
    }

    const confirmar = confirm("¿Deseas eliminar todos los materiales del reporte?");

    if (!confirmar) {
        return;
    }

    registrosReciclaje = [];
    guardarReporte();
    actualizarReporte();
}

function imprimirReporte() {
    if (registrosReciclaje.length === 0) {
        alert("Primero agrega al menos un material al reporte.");
        return;
    }

    window.print();
}

/* Mostrar los registros guardados al abrir la página */
actualizarReporte();
