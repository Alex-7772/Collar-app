
// 👉 Alternar visibilidad de la barra lateral
const toggleSidebar = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const cerrarSidebar = document.getElementById("cerrar-sidebar");

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.add("active");
});

cerrarSidebar.addEventListener("click", () => {
  sidebar.classList.remove("active");
});

// 👉 Cambiar entre pantallas
function mostrarPantalla(id) {
  const pantallas = document.querySelectorAll(".pantalla");
  pantallas.forEach(p => p.classList.remove("active"));
  const pantallaActiva = document.getElementById(id);
  if (pantallaActiva) pantallaActiva.classList.add("active");
}

// 👉 Alternar resumen emocional
function alternarResumen() {
  const bloque = document.getElementById("bloque-resumen");
  const recomendaciones = document.getElementById("recomendaciones");
  const boton = document.querySelector(".boton-resumen");

  const visible = bloque.classList.contains("visible");

  bloque.classList.toggle("visible");
  recomendaciones.classList.toggle("visible");

  boton.textContent = visible
    ? "Mostrar resumen emocional"
    : "Ocultar resumen emocional";
}



// 👉 Aplicar intervalo personalizado
function aplicarIntervaloPersonalizado() {
  const valor = document.getElementById("intervalo-personalizado").value;
  const unidad = document.getElementById("unidad-intervalo").value;
  const mensaje = document.getElementById("mensaje-intervalo");

  if (valor && unidad) {
    const intervaloMs = parseInt(valor) * parseInt(unidad);
    document.getElementById("estado-intervalo").textContent = `${valor} ${unidad === "1000" ? "segundos" : unidad === "60000" ? "minutos" : "horas"}`;
    mensaje.style.display = "block";
    setTimeout(() => mensaje.style.display = "none", 3000);
  }
}

// 👉 Alternar registro (pausar/reanudar)
function alternarRegistro() {
  const boton = document.getElementById("boton-pausa");
  const pausado = boton.textContent.includes("⏸️");
  boton.textContent = pausado ? "▶️ Reanudar registro" : "⏸️ Pausar registro";
}

// 👉 Aplicar frecuencia personalizada (historial)
function aplicarFrecuenciaPersonalizada() {
  const valor = document.getElementById("frecuencia-personalizada").value;
  const unidad = document.getElementById("unidad-frecuencia").value;
  const mensaje = document.getElementById("mensaje-frecuencia");

  if (valor && unidad) {
    mensaje.style.display = "block";
    setTimeout(() => mensaje.style.display = "none", 3000);
  }
}

// 👉 Guardar perfil del animal
document.getElementById("guardar-perfil").addEventListener("click", () => {
  const nombre = document.getElementById("nombre-animal").value;
  const peso = document.getElementById("peso-animal").value;
  const nacimiento = document.getElementById("nacimiento-animal").value;
  const mensaje = document.getElementById("mensaje-perfil");

  // Simulación de cálculo de edad
  if (nacimiento) {
    const edadSpan = document.getElementById("edad-animal");
    const nacimientoDate = new Date(nacimiento);
    const hoy = new Date();
    const edadAnios = hoy.getFullYear() - nacimientoDate.getFullYear();
    edadSpan.textContent = `${edadAnios} años`;
  }

  mensaje.style.display = "block";
  setTimeout(() => mensaje.style.display = "none", 3000);
});
function inicializarMapa() {
  const mapaElemento = document.getElementById("mapa-real");

  const ubicacionInicial = { lat: 22.0109, lng: -99.0061 }; // Ciudad Valles, SLP

  const mapa = new google.maps.Map(mapaElemento, {
    center: ubicacionInicial,
    zoom: 15,
    mapId: "DEMO_MAP_ID", // opcional: puedes usar estilos personalizados
  });

  const marcador = new google.maps.Marker({
    position: ubicacionInicial,
    map: mapa,
    title: "Ubicación del animal",
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    },
  });
}
const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const maxPuntos = 7;

// Generador progresivo con ruido controlado
const valoresActuales = {};
let frecuenciaSimulacion = 3000; // valor inicial por defecto
let intervalosGraficas = {};     // para controlar cada gráfica por ID
function generarValorSuave(id, min, max, paso = 0.5) {
  if (!(id in valoresActuales)) {
    valoresActuales[id] = (min + max) / 2;
  }

  let actual = valoresActuales[id];
  const variacion = (Math.random() - 0.5) * paso * 2;
  actual += variacion;

  if (actual < min) actual = min + Math.random() * paso;
  if (actual > max) actual = max - Math.random() * paso;

  valoresActuales[id] = parseFloat(actual.toFixed(1));
  return valoresActuales[id];
}

function crearGraficaTiempoReal(idCanvas, label, color, rango) {
  const ctx = document.getElementById(idCanvas).getContext("2d");
  const datos = {
    labels: [],
    datasets: [{
      label: label,
      data: [],
      borderColor: color,
      backgroundColor: "transparent",
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: color
    }]
  };

  const grafica = new Chart(ctx, {
    type: "line",
    data: datos,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        x: { title: { display: true, text: "Tiempo" } },
        y: { title: { display: true, text: label } }
      }
    }
  });

  // Guarda función de actualización
  function actualizar() {
    const nuevoValor = generarValorSuave(idCanvas, rango.min, rango.max);
    const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    datos.labels.push(hora);
    datos.datasets[0].data.push(nuevoValor);

    if (datos.labels.length > maxPuntos) {
      datos.labels.shift();
      datos.datasets[0].data.shift();
    }

    grafica.update();
  }

  // Inicia intervalo y guarda referencia
  intervalosGraficas[idCanvas] = setInterval(actualizar, frecuenciaSimulacion);
}
// Inicializar todas las gráficas
crearGraficaTiempoReal("grafica-temperatura", "Temperatura corporal (°C)", "#F5A623", { min: 22, max: 55.5 });
crearGraficaTiempoReal("grafica-ritmo", "Ritmo cardíaco (bpm)", "#7ED321", { min: 60, max: 130 });
crearGraficaTiempoReal("grafica-energia", "Nivel de energía (%)", "#00C853", { min: 0, max: 100 });
crearGraficaTiempoReal("grafica-estres", "Nivel de estrés (%)", "#FFA726", { min: 0, max: 100 });
crearGraficaTiempoReal("grafica-sueño", "Nivel de sueño (%)", "#42A5F5", { min: 0, max: 10 });
crearGraficaTiempoReal("grafica-bienestar", "Bienestar emocional (%)", "#F8E71C", { min: 0, max: 100 });
crearGraficaTiempoReal("grafica-emocional-tiempo", "Evolución emocional en tiempo real (%)", "#9c27b0", { min: 0, max: 100 });

function aplicarFrecuenciaPersonalizada() {
  const valor = parseInt(document.getElementById("frecuencia-personalizada").value);
  const unidad = parseInt(document.getElementById("unidad-frecuencia").value);

  if (isNaN(valor) || valor < 1) {
    alert("Ingresa una frecuencia válida.");
    return;
  }

  frecuenciaSimulacion = valor * unidad;

  // Reinicia todos los intervalos
  for (const id in intervalosGraficas) {
    clearInterval(intervalosGraficas[id]);
    const canvas = document.getElementById(id);
    if (canvas) {
      const label = canvas.getAttribute("data-label");
      const color = canvas.getAttribute("data-color");
      const rango = JSON.parse(canvas.getAttribute("data-rango"));
      intervalosGraficas[id] = setInterval(() => {
        const nuevoValor = generarValorSuave(id, rango.min, rango.max);
        const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

        const chart = Chart.getChart(id);
        chart.data.labels.push(hora);
        chart.data.datasets[0].data.push(nuevoValor);

        if (chart.data.labels.length > maxPuntos) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
        }

        chart.update();
      }, frecuenciaSimulacion);
    }
  }

  // Muestra confirmación
  const mensaje = document.getElementById("mensaje-frecuencia");
  mensaje.style.display = "block";
  setTimeout(() => mensaje.style.display = "none", 3000);
}

const valoresCirculares = {
  temperatura: 35.2,
  ritmo: 75,
  energia: 82,
  estres: 45,
  sueno: 60,
  emocional: 90,
  actividad: 80
};

const rangosCirculares = {
  temperatura: { min: 30.8, max: 40.5, unidad: "°C" },
  ritmo: { min: 0, max: 140, unidad: "bpm" },
  energia: { min: 0, max: 100, unidad: "%" },
  estres: { min: 0, max: 100, unidad: "%" },
  sueno: { min: 0, max: 100, unidad: "%" },
  emocional: { min: 0, max: 100, unidad: "%" },
  actividad: { min: 0, max: 100, unidad: "%" }
};

function actualizarGraficasCirculares() {
  for (const id in valoresCirculares) {
    const rango = rangosCirculares[id];
    let actual = valoresCirculares[id];
    const variacion = (Math.random() - 0.5) * 2;
    actual += variacion;

    if (actual < rango.min) actual = rango.min + Math.random();
    if (actual > rango.max) actual = rango.max - Math.random();

    actual = parseFloat(actual.toFixed(1));
    valoresCirculares[id] = actual;

    const porcentaje = Math.round(((actual - rango.min) / (rango.max - rango.min)) * 100);
    const dash = `${porcentaje}, 100`;

    const circulo = document.querySelector(`.progress.${id}`);
    const texto = document.getElementById(`texto-${id}`);
    const valor = document.getElementById(`valor-${id}`);

    if (circulo) {
      circulo.setAttribute("stroke-dasharray", dash);
      circulo.setAttribute("stroke", obtenerColor(id, actual));
    }

    if (texto) {
      texto.textContent = id === "emocional"
        ? `${porcentaje}%`
        : obtenerEtiquetaPorPorcentaje(porcentaje);
      texto.classList.add("actualizando");
      setTimeout(() => texto.classList.remove("actualizando"), 300);
    }

    if (valor) {
      valor.textContent = `${actual}${rango.unidad}`;
    }
  }
}

function obtenerEtiquetaPorPorcentaje(porcentaje) {
  if (porcentaje < 33) return "Baja";
  if (porcentaje < 66) return "Moderada";
  return "Alta";
}

function obtenerColor(id, valor) {
  if (id === "estres") {
    return valor > 65 ? "#f44336" : valor > 45 ? "#ff9800" : "#4caf50";
  }
  if (id === "energia" || id === "emocional" || id === "actividad") {
    return valor > 80 ? "#00e676" : valor > 60 ? "#ffeb3b" : "#ff5722";
  }
  if (id === "sueno") {
    return valor > 70 ? "#2196f3" : valor > 55 ? "#03a9f4" : "#9e9e9e";
  }
  if (id === "temperatura") {
    return valor > 38.3 ? "#e91e63" : valor > 38 ? "#ff9800" : "#4caf50";
  }
  if (id === "ritmo") {
    return valor > 78 ? "#f44336" : valor > 72 ? "#ff9800" : "#4caf50";
  }
  return "#9c27b0";
}



const recomendacionesPorNivel = {
  temperatura: {
    baja: ["Abrígalo ligeramente si hay viento", "Evita corrientes de aire"],
    moderada: ["Mantén hidratación constante", "Ambiente ventilado y tranquilo"],
    alta: ["Aplica compresas frías", "Consulta al veterinario si persiste"]
  },
  ritmo: {
    baja: ["Estimula con juegos suaves", "Verifica si está somnoliento"],
    moderada: ["Buen momento para paseo corto", "Observa si mantiene ritmo"],
    alta: ["Evita actividad intensa", "Permite descanso inmediato"]
  },
  energia: {
    baja: ["Ofrece alimento energético", "Evita sobreestimulación"],
    moderada: ["Ideal para entrenamiento", "Juega con moderación"],
    alta: ["Permite actividad física", "Evita sobrecarga emocional"]
  },
  estres: {
    baja: ["Ambiente relajado", "Refuerza rutinas positivas"],
    moderada: ["Evita ruidos fuertes", "Ofrece espacio seguro"],
    alta: ["Reduce estímulos externos", "Consulta si persiste"]
  },
  sueno: {
    baja: ["Asegura zona de descanso", "Evita interrupciones"],
    moderada: ["Mantén horarios regulares", "Ambiente oscuro y tranquilo"],
    alta: ["Evita sobreestimulación", "Permite siestas prolongadas"]
  },
  emocional: {
    baja: ["Refuerza vínculos afectivos", "Evita correcciones bruscas"],
    moderada: ["Interactúa con cariño", "Observa señales de ánimo"],
    alta: ["Celebra su estado", "Refuerza con estímulos positivos"]
  },
  actividad: {
    baja: ["Motívalo con juguetes", "Evita sedentarismo prolongado"],
    moderada: ["Ideal para paseo", "Observa su disposición"],
    alta: ["Evita sobreesfuerzo", "Permite pausas frecuentes"]
  }
};

function actualizarRecomendaciones() {
  const lista = document.getElementById("lista-recomendaciones");
  if (!lista) return;

  lista.innerHTML = ""; // Limpiar recomendaciones anteriores

  for (const id in valoresCirculares) {
    const rango = rangosCirculares[id];
    const valor = valoresCirculares[id];
    const porcentaje = Math.round(((valor - rango.min) / (rango.max - rango.min)) * 100);

    let nivel = "moderada";
    if (porcentaje < 33) nivel = "baja";
    else if (porcentaje > 66) nivel = "alta";

    const recomendaciones = recomendacionesPorNivel[id]?.[nivel];
    if (recomendaciones && recomendaciones.length > 0) {
      const grupo = document.createElement("li");
      grupo.innerHTML = `<strong>${formatearNombre(id)} (${capitalizar(nivel)})</strong><ul>${recomendaciones.map(r => `<li>${r}</li>`).join("")}</ul>`;
      lista.appendChild(grupo);
    }
  }
}

function formatearNombre(id) {
  const nombres = {
    temperatura: "Temperatura corporal",
    ritmo: "Ritmo cardíaco",
    energia: "Nivel de energía",
    estres: "Nivel de estrés",
    sueno: "Nivel de sueño",
    emocional: "Estado emocional",
    actividad: "Nivel de actividad"
  };
  return nombres[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
const zonasSimuladas = [
  "Zona tranquila",
  "Zona ruidosa",
  "Zona con tráfico",
  "Zona verde",
  "Zona industrial",
  "Zona residencial",
  "Zona comercial"
];

function actualizarUbicacionSimulada() {
  const intervalo = document.getElementById("estado-intervalo");
  const ultimaHora = document.getElementById("estado-ultima-hora");
  const zona = document.getElementById("estado-zona");

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const zonaAleatoria = zonasSimuladas[Math.floor(Math.random() * zonasSimuladas.length)];

  if (intervalo) intervalo.textContent = "Cada 10 segundos";
  if (ultimaHora) ultimaHora.textContent = hora;
  if (zona) zona.textContent = zonaAleatoria;
}

// ⏱️ Iniciar simulación
setInterval(actualizarUbicacionSimulada, 10000);
function actualizarResumenAmbiental() {
  const clima = document.getElementById("clima-actual")?.value;
  const ubicacion = document.getElementById("ubicacion-animal")?.value;
  const temperatura = document.getElementById("temperatura-corporal")?.value;

  if (clima) document.getElementById("resumen-clima").textContent = capitalizar(clima);
  if (ubicacion) document.getElementById("resumen-ubicacion").textContent = capitalizar(ubicacion);
  if (temperatura) document.getElementById("resumen-temperatura").textContent = `${temperatura} °C`;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
document.getElementById("clima-actual").addEventListener("change", actualizarResumenAmbiental);
document.getElementById("ubicacion-animal").addEventListener("change", actualizarResumenAmbiental);
document.getElementById("temperatura-corporal").addEventListener("input", actualizarResumenAmbiental);

const evaluacionesEmocionales = {
  baja: "Sensitivo",
  moderada: "Estable",
  alta: "Eufórico"
};

const recomendacionesEmocionales = {
  baja: "Refuerza vínculos afectivos y evita correcciones bruscas.",
  moderada: "Interactúa con cariño y observa señales de ánimo.",
  alta: "Celebra su estado y refuerza con estímulos positivos."
};

let historialEmocional = [];

function actualizarEstadoEmocionalGeneral() {
  const valor = valoresCirculares["emocional"];
  const rango = rangosCirculares["emocional"];
  const porcentaje = Math.round(((valor - rango.min) / (rango.max - rango.min)) * 100);

  let nivel = "Inestable";
  let emoji = "😐";

  if (porcentaje >= 85) {
    nivel = "Excelente";
    emoji = "😄";
  } else if (porcentaje >= 70) {
    nivel = "Bueno";
    emoji = "🙂";
  } else if (porcentaje >= 50) {
    nivel = "Moderado";
    emoji = "😐";
  } else {
    nivel = "Inestable";
    emoji = "😟";
  }

  const resumen = document.getElementById("resumen-emocional");
  if (resumen) {
    resumen.textContent = `${emoji} ${porcentaje}% – ${nivel}`;
  }
}
function actualizarResumenEmocional() {
  const valor = valoresCirculares["emocional"];
  const rango = rangosCirculares["emocional"];
  const porcentaje = Math.round(((valor - rango.min) / (rango.max - rango.min)) * 100);

  let nivel = "moderada";
  if (porcentaje < 33) nivel = "baja";
  else if (porcentaje > 70) nivel = "alta";

  const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const emoji = nivel === "alta" ? "😄" : nivel === "moderada" ? "😐" : "😟";

  // Actualizar historial
  historialEmocional.push(porcentaje);
  if (historialEmocional.length > 10) historialEmocional.shift();

  const promedio = Math.round(historialEmocional.reduce((a, b) => a + b, 0) / historialEmocional.length);
  const tendencia = porcentaje > promedio ? "En ascenso" : porcentaje < promedio ? "En descenso" : "Estable";

  // Actualizar DOM
  document.getElementById("ultima-lectura").textContent = `Última lectura: ${emoji} ${porcentaje}% – ${hora}`;
  document.getElementById("promedio-emocional").textContent = `Promedio emocional: ${promedio}%`;
  document.getElementById("tendencia-emocional").textContent = `Tendencia emocional: ${tendencia}`;
  document.getElementById("nivel-emocional").textContent = `Nivel actual: ${capitalizar(nivel)}`;
  document.getElementById("evaluacion-emocional").textContent = `Evaluación: ${evaluacionesEmocionales[nivel]}`;
  document.getElementById("recomendacion-emocional").textContent = `Recomendación: ${recomendacionesEmocionales[nivel]}`;
}
function actualizarAlertas() {
  const lista = document.getElementById("lista-alertas");
  if (!lista) return;
  lista.innerHTML = "";

  for (const id in valoresCirculares) {
    const valor = valoresCirculares[id];
    const rango = rangosCirculares[id];
    const porcentaje = Math.round(((valor - rango.min) / (rango.max - rango.min)) * 100);

    let nivel = null;
    let color = "";
    let icono = "";

    if (porcentaje < 5 || porcentaje > 95) {
      nivel = "crítica";
      color = "#ff1744"; // rojo intenso
      icono = "🚨";
    } else if (porcentaje < 20 || porcentaje > 80) {
      nivel = "alta";
      color = "#40f585ff"; // verde
      icono = "❤️";
    }

    if (nivel) {
      const item = document.createElement("li");
      item.textContent = `${icono} ${formatearNombre(id)} ${nivel} (${porcentaje}%)`;
      item.style.color = color;
      item.style.fontWeight = "bold";
      lista.appendChild(item);
    }
  }

  // Zona ambiental desfavorable
  const zona = document.getElementById("resumen-zona")?.textContent?.toLowerCase();
  if (zona && (zona.includes("ruidosa") || zona.includes("tráfico") || zona.includes("industrial"))) {
    const item = document.createElement("li");
    item.textContent = `📍 Zona ambiental desfavorable: ${capitalizar(zona)}`;
    item.style.color = "#ff9100";
    item.style.fontWeight = "bold";
    lista.appendChild(item);
  }
}
function toggleConfiguracion() {
  const panel = document.getElementById("configuracion-contenido");
  if (!panel) return;
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}
function toggleConfiguracionAvanzada() {
  const panel = document.getElementById("configuracion-avanzada-contenido");
  if (!panel) return;
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function alternarRutinas() {
  const bloque = document.getElementById("contenido-rutinas");
  if (!bloque) return;
  bloque.style.display = bloque.style.display === "none" ? "block" : "none";
}

function actualizarRutinas() {
  const emocional = valoresCirculares?.emocional ?? 50;
  const ambiental = valoresCirculares?.ambiental ?? 22;

  const nivelEmocional = emocional < 33 ? "baja" : emocional > 66 ? "alta" : "moderada";
  const nivelAmbiental = ambiental < 18 ? "frío" : ambiental > 28 ? "caluroso" : "templado";

  // Recomendación contextual combinada
  const recomendaciones = {
    baja: {
      frío: "Ambiente cálido y compañía tranquila. Evita actividades físicas.",
      templado: "Rutinas suaves con apoyo emocional. Evita sobrecarga.",
      caluroso: "Ambiente fresco y silencioso. Prioriza descanso y compañía."
    },
    moderada: {
      frío: "Rutinas estables con pausas. Añade estimulación suave.",
      templado: "Mantén ritmo equilibrado. Alterna actividad y descanso.",
      caluroso: "Evita calor excesivo. Rutinas ligeras y monitoreo emocional."
    },
    alta: {
      frío: "Aprovecha energía con juegos activos. Cuida temperatura.",
      templado: "Rutinas dinámicas y estimulantes. Refuerza vínculos.",
      caluroso: "Evita sobrecalentamiento. Estimulación cognitiva en interiores."
    }
  };

  const recomendacion = document.getElementById("recomendacion-rutina");
  if (recomendacion) {
    recomendacion.textContent = recomendaciones[nivelEmocional][nivelAmbiental];
  }

  // Rutinas por momento del día
  const rutinas = {
    mañana: [
      nivelAmbiental === "caluroso" ? "Ambiente fresco y ventilado" : "Revisión de temperatura y humedad",
      nivelEmocional === "baja" ? "Desayuno supervisado con compañía" : "Desayuno energético",
      nivelEmocional === "alta" && nivelAmbiental !== "caluroso"
        ? "Paseo activo al aire libre"
        : "Actividad física suave en interiores"
    ],
    tarde: [
      nivelEmocional === "baja" ? "Sesión de compañía tranquila" : "Juego interactivo o estimulación cognitiva",
      nivelAmbiental === "caluroso" ? "Descanso en zona fresca" : "Pausa supervisada",
      "Revisión de signos emocionales"
    ],
    noche: [
      "Música relajante y luz tenue",
      "Preparación para descanso",
      "Evaluación emocional final"
    ]
  };

  // Actualizar cada grupo visual
  const grupos = document.querySelectorAll("#contenido-rutinas .grupo-rutina");
  const momentos = ["mañana", "tarde", "noche"];

  grupos.forEach((grupo, i) => {
    const ul = grupo.querySelector("ul");
    if (!ul) return;
    ul.innerHTML = "";
    rutinas[momentos[i]].forEach(tarea => {
      const li = document.createElement("li");
      li.innerHTML = `<input type="checkbox"> ${tarea}`;
      ul.appendChild(li);
    });
  });
}
// 🧠 Historial de notas
const historialNotas = [];

// 📝 Guardar nota
function guardarNota() {
  const textarea = document.getElementById("notas-cuidador");
  const lista = document.getElementById("lista-notas");
  const texto = textarea.value.trim();

  if (texto === "") return;

  const nota = {
    id: Date.now(),
    texto,
    fecha: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    etiquetas: detectarEtiquetas(texto),
    prioridad: detectarPrioridad(texto),
    vinculo: detectarVinculo(texto)
  };

  historialNotas.unshift(nota);
  mostrarNota(nota, lista);
  textarea.value = "";
}

// 🧠 Mostrar nota en la lista
function mostrarNota(nota, lista) {
  const li = document.createElement("li");
  li.setAttribute("data-id", nota.id);

  li.innerHTML = `
    <strong>${nota.fecha} ${nota.hora}</strong><br>
    ${nota.texto}
    ${nota.etiquetas.length ? `<br><em>Etiquetas:</em> ${nota.etiquetas.join(", ")}` : ""}
    ${nota.vinculo ? `<br><em>Relacionado con:</em> ${nota.vinculo}` : ""}
    <br><button onclick="eliminarNota(${nota.id})" class="boton-eliminar-nota">🗑️ Eliminar</button>
  `;

  if (nota.prioridad === "alta") {
    li.style.borderColor = "#ff6b6b";
    li.style.backgroundColor = "#3c2f2f";
  }

  lista.prepend(li);
}

// 🗑️ Eliminar nota
function eliminarNota(id) {
  const index = historialNotas.findIndex(n => n.id === id);
  if (index !== -1) historialNotas.splice(index, 1);

  const li = document.querySelector(`#lista-notas li[data-id="${id}"]`);
  if (li) li.remove();
}

// 🧠 Detectar etiquetas
function detectarEtiquetas(texto) {
  const etiquetas = [];
  const lower = texto.toLowerCase();

  if (lower.includes("rutina")) etiquetas.push("#rutina");
  if (lower.includes("emocional")) etiquetas.push("#emocional");
  if (lower.includes("ambiente") || lower.includes("temperatura")) etiquetas.push("#ambiente");
  if (lower.includes("configuración")) etiquetas.push("#configuración");
  if (lower.includes("pendiente") || lower.includes("urgente")) etiquetas.push("#urgente");

  return etiquetas;
}

// 🧠 Detectar prioridad
function detectarPrioridad(texto) {
  const lower = texto.toLowerCase();
  return lower.includes("urgente") || lower.includes("revisar") || lower.includes("pendiente")
    ? "alta"
    : "normal";
}

// 🧠 Detectar vínculo contextual
function detectarVinculo(texto) {
  const lower = texto.toLowerCase();
  if (lower.includes("rutina")) return "Rutinas y tareas";
  if (lower.includes("emocional")) return "Indicadores emocionales";
  if (lower.includes("configuración")) return "Configuración";
  if (lower.includes("ambiental") || lower.includes("temperatura")) return "Indicadores ambientales";
  return null;
}

// 📄 Generar informe emocional
document.getElementById("generar-informe").addEventListener("click", () => {
  const emocional = valoresCirculares?.emocional ?? 50;
  const ambiental = valoresCirculares?.ambiental ?? 22;

  let diagnostico = "";

  if (emocional < 33) {
    diagnostico += "Estado emocional bajo. Se recomienda evitar sobreestimulación y reforzar compañía tranquila.";
  } else if (emocional > 66) {
    diagnostico += "Estado emocional alto. Se recomienda reforzar actividades positivas y monitoreo emocional.";
  } else {
    diagnostico += "Estado emocional moderado. Mantener rutinas estables y observar cambios sutiles.";
  }

  diagnostico += ` Temperatura ambiental: ${ambiental}°C.`;

  document.getElementById("diagnostico-emocional").textContent = diagnostico;
});

// 📤 Exportar historial como archivo .txt
document.getElementById("exportar-historial").addEventListener("click", () => {
  if (!historialNotas.length) {
    alert("No hay notas registradas.");
    return;
  }

  const contenido = historialNotas.map(nota => {
    const etiquetas = nota.etiquetas.length ? `Etiquetas: ${nota.etiquetas.join(", ")}` : "";
    const vinculo = nota.vinculo ? `Relacionado con: ${nota.vinculo}` : "";
    return `• ${nota.fecha} ${nota.hora}\n${nota.texto}\n${etiquetas}\n${vinculo}\n`;
  }).join("\n");

  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "historial_notas.txt";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
});

// 🔄 Resetear datos del sistema
document.getElementById("resetear-datos").addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres resetear todos los datos? Esta acción no se puede deshacer.")) return;

  // Resetear notas
  historialNotas.length = 0;
  document.getElementById("lista-notas").innerHTML = "";

  // Resetear diagnóstico
  document.getElementById("diagnostico-emocional").textContent = "";

  // Resetear rutinas
  const grupos = document.querySelectorAll("#contenido-rutinas .lista-rutinas");
  grupos.forEach(ul => ul.innerHTML = "");

  alert("Todos los datos han sido reseteados.");
});
let mapa;
let marcador;
let historialUbicaciones = [];
let modoPerdido = false;
let modoEdicion = false;
let puntosZona = [];
let polilineaTemporal = null;
let zonas = {};

function inicializarMapa() {
  const posicionInicial = { lat: 21.9876, lng: -99.0123 };

  mapa = new google.maps.Map(document.getElementById("mapa-real"), {
    center: posicionInicial,
    zoom: 16,
    mapId: "MAPA_PERSONALIZADO"
  });

  marcador = new google.maps.Marker({
    position: posicionInicial,
    map: mapa,
    title: "Ubicación actual",
    icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
  });

  habilitarClickEnMapa();
  registrarUbicacion(posicionInicial);
  actualizarListaZonas();
}

// 🖱️ Trazado libre
function habilitarClickEnMapa() {
  mapa.addListener("click", (e) => {
    if (!modoEdicion) return;

    puntosZona.push(e.latLng);

    if (polilineaTemporal) polilineaTemporal.setMap(null);

    polilineaTemporal = new google.maps.Polyline({
      path: puntosZona,
      map: mapa,
      strokeColor: "#FF9800",
      strokeOpacity: 0.8,
      strokeWeight: 2
    });
  });
}

function activarModoEdicion() {
  modoEdicion = true;
  puntosZona = [];

  if (polilineaTemporal) {
    polilineaTemporal.setMap(null);
    polilineaTemporal = null;
  }

  mostrarMensajeEstado("Haz clic en el mapa para trazar los puntos de la zona. Luego presiona 'Finalizar zona'.");
  actualizarListaZonas();
}
function finalizarZona() {
  if (puntosZona.length < 3) {
    mostrarMensajeEstado("Debes trazar al menos 3 puntos para formar una zona cerrada.");
    return;
  }

  const tipo = document.getElementById("tipo-zona").value;
  const color = obtenerColorZona(tipo);

  if (zonas[tipo]) zonas[tipo].setMap(null);

  const poligono = new google.maps.Polygon({
    paths: puntosZona,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.2,
    map: mapa
  });

  zonas[tipo] = poligono;
  puntosZona = [];
  modoEdicion = false;

  if (polilineaTemporal) {
    polilineaTemporal.setMap(null);
    polilineaTemporal = null;
  }

  mostrarMensajeEstado(`Zona "${formatearNombreZona(tipo)}" creada correctamente.`);
  actualizarListaZonas();
}

function eliminarZona(nombre) {
  if (zonas[nombre]) {
    zonas[nombre].setMap(null);
    delete zonas[nombre];
    actualizarListaZonas();
  }
}

function actualizarListaZonas() {
  const contenedor = document.getElementById("lista-zonas");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  Object.keys(zonas).forEach(nombre => {
    const div = document.createElement("div");
    div.className = "zona-item";
    div.innerHTML = `
      <span>${formatearNombreZona(nombre)}</span>
      <button onclick="eliminarZona('${nombre}')">🗑️</button>
    `;
    contenedor.appendChild(div);
  });
}

function obtenerColorZona(tipo) {
  switch (tipo) {
    case "casa": return "#2196F3";
    case "parque": return "#4CAF50";
    case "descanso": return "#9C27B0";
    case "higiene": return "#03A9F4";
    case "comedor": return "#FF9800";
    default: return "#999999";
  }
}

function formatearNombreZona(nombre) {
  switch (nombre) {
    case "casa": return "Casa 🏡";
    case "parque": return "Parque 🌳";
    case "descanso": return "Zona de descanso 💤";
    case "higiene": return "Área de higiene 🧼";
    case "comedor": return "Comedor 🍽️";
    default: return nombre;
  }
}

function clasificarZonaGeografica(pos) {
  const punto = new google.maps.LatLng(pos.lat, pos.lng);

  for (const [nombre, zona] of Object.entries(zonas)) {
    if (zona instanceof google.maps.Polygon) {
      if (google.maps.geometry.poly.containsLocation(punto, zona)) {
        return formatearNombreZona(nombre);
      }
    }
  }

  return null;
}

setInterval(() => {
  if (modoPerdido || !marcador) return;

  const actual = marcador.getPosition();
  const nuevaLat = actual.lat() + (Math.random() - 0.5) * 0.0002;
  const nuevaLng = actual.lng() + (Math.random() - 0.5) * 0.0002;
  const nuevaPosicion = { lat: nuevaLat, lng: nuevaLng };

  marcador.setPosition(nuevaPosicion);
  mapa.panTo(nuevaPosicion);
  registrarUbicacion(nuevaPosicion);
}, 3000);

function registrarUbicacion(pos) {
  const timestamp = new Date().toLocaleTimeString();
  const zona = clasificarZonaGeografica(pos);
  const entrada = {
    lat: pos.lat.toFixed(5),
    lng: pos.lng.toFixed(5),
    hora: timestamp,
    zona: zona || "Zona general"
  };

  historialUbicaciones.unshift(entrada);
  actualizarHistorialVisual();
  actualizarDireccion(pos);
}

function actualizarDireccion(pos) {
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ location: pos }, (results, status) => {
    if (status === "OK" && results[0]) {
      const direccion = results[0].formatted_address;
      const zona = clasificarZonaGeografica(pos) || "Zona general";

      document.getElementById("direccion-actual").textContent = direccion;
      document.getElementById("estado-zona").textContent = `${zona} ✅`;
    }
  });
}

function actualizarHistorialVisual() {
  const lista = document.querySelector(".historial-ubicacion");
  lista.innerHTML = "";

  historialUbicaciones.slice(0, 5).forEach(entrada => {
    const li = document.createElement("li");
    li.textContent = `🕒 ${entrada.hora} → (${entrada.lat}, ${entrada.lng} - ${entrada.zona})`;
    lista.appendChild(li);
  });
}
function mostrarMensajeEstado(texto, duracion = 4000) {
  const contenedor = document.getElementById("mensaje-estado");
  if (!contenedor) return;

  contenedor.textContent = texto;
  contenedor.classList.add("visible");

  setTimeout(() => {
    contenedor.classList.remove("visible");
    contenedor.textContent = "";
  }, duracion);
}
function activarModoPerdido() {
  modoPerdido = true;

  const mapa = document.getElementById("mapa-real");
  const mensaje = document.getElementById("mensaje-perdido");

  if (mapa) mapa.classList.add("mapa-perdido");
  if (mensaje) {
    mensaje.textContent = "🔍 Detectando a tu mascota...";
    mensaje.classList.add("visible");
  }
}
function desactivarModoPerdido() {
  modoPerdido = false;

  const mapa = document.getElementById("mapa-real");
  const mensaje = document.getElementById("mensaje-perdido");

  if (mapa) mapa.classList.remove("mapa-perdido");
  if (mensaje) {
    mensaje.textContent = "";
    mensaje.classList.remove("visible");
  }
}
// 👉 Alternar modo perdido
function alternarModoPerdido(boton) {
  const estado = boton.textContent.includes("Activar");

  boton.textContent = estado
    ? "Desactivar modo perdido ❌"
    : "Activar modo perdido 🆘";
  boton.style.backgroundColor = estado ? "#9c27b0" : "#f44336";

  const mapa = document.getElementById("mapa-real");
  if (mapa) mapa.classList.toggle("mapa-perdido", estado);

  const mensaje = document.getElementById("mensaje-perdido");
  if (mensaje) {
    if (estado) {
      mensaje.textContent = "🔍 Detectando a tu mascota...";
      mensaje.classList.add("visible");
    } else {
      mensaje.textContent = "";
      mensaje.classList.remove("visible");
    }
  }

  modoPerdido = estado;
}


let watchId = null;
let marcadorActual = null;

// Inicia el seguimiento de ubicación
function iniciarSeguimientoUbicacion() {
  if (!navigator.geolocation) {
    mostrarMensajeEstado("La geolocalización no está disponible en este navegador.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const posicion = { lat, lng };

      // Actualiza dirección
      const direccion = await obtenerDireccionDesdeCoords(lat, lng);
      document.getElementById("direccion-actual").textContent = direccion;

      // Verifica zona
      const estado = verificarZonaActual(posicion);
      document.getElementById("estado-zona").textContent = estado;

      // (Opcional) actualiza marcador en el mapa
      actualizarMarcador(posicion);
    },
    (err) => {
      mostrarMensajeEstado("Error al obtener ubicación: " + err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  );
}

// Geocodificación inversa con Google Maps
async function obtenerDireccionDesdeCoords(lat, lng) {
  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        resolve("Dirección no disponible");
      }
    });
  });
}

// Verifica si la posición está dentro de alguna zona
function verificarZonaActual(posicion) {
  for (const tipo in zonas) {
    const poligono = zonas[tipo];
    if (
      google.maps.geometry.poly.containsLocation(
        new google.maps.LatLng(posicion),
        poligono
      )
    ) {
      return formatearNombreZona(tipo); // Ej: "Zona de descanso"
    }
  }
  return "Fuera de zona";
}

// Actualiza marcador en el mapa
function actualizarMarcador(posicion) {
  if (!mapa) return;

  if (!marcadorActual) {
    marcadorActual = new google.maps.Marker({
      position: posicion,
      map: mapa,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#03A9F4",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#fff"
      }
    });
  } else {
    marcadorActual.setPosition(posicion);
  }
}

// Mensaje visual en la interfaz (no alert)
function mostrarMensajeEstado(texto, duracion = 4000) {
  const contenedor = document.getElementById("mensaje-estado");
  if (!contenedor) return;

  contenedor.textContent = texto;
  contenedor.classList.add("visible");

  setTimeout(() => {
    contenedor.classList.remove("visible");
    contenedor.textContent = "";
  }, duracion);
}

// Inicia seguimiento al cargar
window.addEventListener("load", () => {
  iniciarSeguimientoUbicacion();
});


let resumenVisible = false;
let comparacionVisible = false;

document.getElementById("btn-resumen-diario").addEventListener("click", () => {
  resumenVisible = !resumenVisible;
  const resumen = document.getElementById("resultado-resumen");
  resumen.style.display = resumenVisible ? "block" : "none";
  if (resumenVisible) mostrarResumenDiario();
});

document.getElementById("btn-comparar-dias").addEventListener("click", () => {
  comparacionVisible = !comparacionVisible;
  const comparacion = document.getElementById("resultado-comparacion");
  comparacion.style.display = comparacionVisible ? "block" : "none";
  if (comparacionVisible) mostrarComparacionDias();
});

document.getElementById("btn-exportar-json").addEventListener("click", () => {
  const resumen = document.getElementById("resultado-resumen").textContent;
  const blob = new Blob([JSON.stringify({ resumen })], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resumen.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("btn-exportar-pdf").addEventListener("click", () => {
  alert("📄 Simulación: El resumen se exportaría como PDF aquí.");
});

function mostrarResumenDiario() {
  const resumen = document.getElementById("resultado-resumen");
  resumen.innerHTML = "";
  resumen.style.display = "block";

  const indicadores = [
    { id: "grafica-temperatura", nombre: "Temperatura corporal", unidad: "°C" },
    { id: "grafica-ritmo", nombre: "Ritmo cardíaco", unidad: "bpm" },
    { id: "grafica-energia", nombre: "Energía", unidad: "%" },
    { id: "grafica-estres", nombre: "Estrés", unidad: "%" },
    { id: "grafica-sueño", nombre: "Sueño", unidad: "h" },
    { id: "grafica-bienestar", nombre: "Bienestar emocional", unidad: "%" },
    { id: "grafica-emocional-tiempo", nombre: "Estado emocional", unidad: "%" }
  ];

  const contenedor = document.createElement("div");
  contenedor.className = "contenedor-resumenes";

  indicadores.forEach(({ id, nombre, unidad }) => {
    const chart = Chart.getChart(id);
    if (!chart) return;

    const datos = chart.data.datasets[0].data;
    const promedio = datos.length
      ? (datos.reduce((a, b) => a + b, 0) / datos.length).toFixed(1)
      : "—";

    const tarjeta = document.createElement("div");
    tarjeta.className = "resumen-columna";
    tarjeta.innerHTML = `
      <h3>${nombre}</h3>
      <p><strong>Promedio:</strong> ${promedio} ${unidad}</p>
    `;
    contenedor.appendChild(tarjeta);
  });

  // 🔔 Simulación de alertas del día
  const alertasSimuladas = [
    { fecha: "2025-10-30", mensaje: "⚠️ Estrés elevado" },
    { fecha: "2025-10-31", mensaje: "🚨 Ritmo cardíaco alto" }
  ];

  const hoy = new Date().toISOString().split("T")[0];
  const alertasHoy = alertasSimuladas.filter(a => a.fecha === hoy);

  if (alertasHoy.length) {
    const alertaBox = document.createElement("div");
    alertaBox.className = "resumen-columna";
    alertaBox.innerHTML = `<h3>🔔 Alertas del día</h3><ul>${alertasHoy.map(a => `<li>${a.mensaje}</li>`).join("")}</ul>`;
    contenedor.appendChild(alertaBox);
  }

  resumen.appendChild(contenedor);
}

function mostrarComparacionDias() {
  const comparacion = document.getElementById("resultado-comparacion");
  comparacion.innerHTML = "";
  comparacion.style.display = "block";

  const fecha1 = document.getElementById("fecha-comparacion-1").value;
  const fecha2 = document.getElementById("fecha-comparacion-2").value;

  const chart = Chart.getChart("grafica-energia");
  if (!chart || chart.data.datasets[0].data.length < 2) {
    comparacion.textContent = "No hay suficientes datos para comparar.";
    return;
  }

  const hoy = chart.data.datasets[0].data.at(-1);
  const ayer = chart.data.datasets[0].data.at(-2);
  const diferencia = (hoy - ayer).toFixed(1);

  const tarjeta = document.createElement("div");
  tarjeta.className = "resumen-columna";
  tarjeta.innerHTML = `
    <h3>Comparación de energía</h3>
    <p><strong>Día 1:</strong> ${fecha1 || "ayer"} — ${ayer} %</p>
    <p><strong>Día 2:</strong> ${fecha2 || "hoy"} — ${hoy} %</p>
    <p><strong>Diferencia:</strong> ${diferencia > 0 ? "+" : ""}${diferencia} %</p>
  `;

  comparacion.appendChild(tarjeta);
}
setInterval(() => {
    actualizarGraficasCirculares();
    actualizarRecomendaciones();
    actualizarResumenAmbiental();
    actualizarResumenEmocional();
    actualizarEstadoEmocionalGeneral();
    actualizarAlertas();

  }, 3000);
