let intervaloRegistro = 5000;
let temporizadorRegistro;
let registroActivo = true;
let marcador;

function mostrarPantalla(id) {
  document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("active"));
  const activa = document.getElementById(id);
  if (activa) {
    activa.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function inicializarMapa() {
  const ubicacion = { lat: 22.0107, lng: -99.0061 };
  const mapa = new google.maps.Map(document.getElementById("mapa-real"), {
    zoom: 15,
    center: ubicacion,
    mapTypeId: "roadmap",
  });

  marcador = new google.maps.Marker({
    position: ubicacion,
    map: mapa,
    title: "Ubicación de tu mascota",
    icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  });

  new google.maps.Circle({
    strokeColor: "#4CAF50",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#4CAF50",
    fillOpacity: 0.2,
    map: mapa,
    center: ubicacion,
    radius: 100,
  });

  if (localStorage.getItem("modoPerdido") === "true") activarModoPerdidoVisual();

  simularMovimiento();
  temporizadorRegistro = setInterval(registrarUbicacionSimulada, intervaloRegistro);
}

function alternarModoPerdido(boton) {
  const mapa = document.getElementById("mapa-real");
  const pantalla = document.querySelector("#ubicacion .pantalla-contenido");
  const modoActivo = mapa.classList.contains("modo-perdido");

  if (!modoActivo) {
    activarModoPerdidoVisual();
    boton.textContent = "Cancelar modo perdido ❌";
    localStorage.setItem("modoPerdido", "true");
  } else {
    mapa.classList.remove("modo-perdido");
    pantalla.querySelector(".alerta-visual")?.remove();
    marcador?.setIcon("https://maps.google.com/mapfiles/ms/icons/red-dot.png");
    boton.textContent = "Activar modo perdido 🆘";
    localStorage.setItem("modoPerdido", "false");
  }
}

function activarModoPerdidoVisual() {
  const mapa = document.getElementById("mapa-real");
  const pantalla = document.querySelector("#ubicacion .pantalla-contenido");
  mapa.classList.add("modo-perdido");

  if (!pantalla.querySelector(".alerta-visual")) {
    const alerta = document.createElement("div");
    alerta.className = "alerta-visual";
    alerta.textContent = "¡Modo perdido activado! Tu mascota está siendo localizada.";
    pantalla.appendChild(alerta);
  }

  marcador?.setIcon("https://maps.google.com/mapfiles/ms/icons/yellow-dot.png");
}

function simularMovimiento() {
  const centro = { lat: 22.0107, lng: -99.0061 };
  const radioZona = 100;

  setInterval(() => {
    const desplazamiento = {
      lat: (Math.random() - 0.5) * 0.001,
      lng: (Math.random() - 0.5) * 0.001,
    };
    const nuevaPosicion = {
      lat: centro.lat + desplazamiento.lat,
      lng: centro.lng + desplazamiento.lng,
    };

    marcador?.setPosition(nuevaPosicion);
    const distancia = calcularDistancia(centro, nuevaPosicion);

    const estadoZona = document.getElementById("estado-zona");
    if (estadoZona) {
      estadoZona.textContent = distancia > radioZona ? "Fuera de zona segura 🚨" : "Dentro de zona segura ✅";
      estadoZona.className = distancia > radioZona ? "estado-zona-alerta" : "estado-zona-ok";
    }

    if (distancia > radioZona) {
      activarModoPerdidoVisual();
      document.querySelector(".boton-alerta").textContent = "Cancelar modo perdido ❌";
      localStorage.setItem("modoPerdido", "true");
    }
  }, 3000);
}

function calcularDistancia(p1, p2) {
  const R = 6371000;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(p1.lat * Math.PI / 180) *
            Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function registrarUbicacionSimulada() {
  const centro = { lat: 22.0107, lng: -99.0061 };
  const posicion = marcador?.getPosition();
  if (!posicion) return;

  const distancia = calcularDistancia(centro, {
    lat: posicion.lat(),
    lng: posicion.lng(),
  });

  const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("estado-ultima-hora").textContent = hora;

  const historial = document.querySelector(".historial-ubicacion");
  if (historial) {
    const nuevaEntrada = document.createElement("li");
    nuevaEntrada.textContent = `${hora} - Posición registrada (${distancia.toFixed(0)} m)`;
    historial.prepend(nuevaEntrada);
  }
}

function actualizarIntervalo(ms) {
  intervaloRegistro = ms;
  clearInterval(temporizadorRegistro);
  temporizadorRegistro = setInterval(registrarUbicacionSimulada, intervaloRegistro);
  mostrarIntervaloEnEstado();
}

function cambiarIntervaloDesdeUI() {
  const nuevoValor = parseInt(document.getElementById("intervalo-registro").value);
  actualizarIntervalo(nuevoValor);
  localStorage.setItem("intervaloRegistro", nuevoValor);
  mostrarMensaje(`✅ Intervalo actualizado a ${nuevoValor / 1000} segundos`);
}

function aplicarIntervaloPersonalizado() {
  const cantidad = parseInt(document.getElementById("intervalo-personalizado").value);
  const unidad = parseInt(document.getElementById("unidad-intervalo").value);
  if (isNaN(cantidad) || cantidad <= 0) return;

  const nuevoIntervalo = cantidad * unidad;
  if (nuevoIntervalo < 1000 || nuevoIntervalo > 86400000) {
    alert("El intervalo debe estar entre 1 segundo y 24 horas.");
    return;
  }

  actualizarIntervalo(nuevoIntervalo);
  localStorage.setItem("intervaloRegistro", nuevoIntervalo);

  const unidadTexto = unidad === 1000 ? "segundos" : unidad === 60000 ? "minutos" : "horas";
  mostrarMensaje(`✅ Intervalo actualizado a ${cantidad} ${unidadTexto}`);
}

function mostrarIntervaloEnEstado() {
  const span = document.getElementById("estado-intervalo");
  if (span) span.textContent = `Cada ${intervaloRegistro / 1000} segundos`;
}

function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensaje-intervalo");
  if (mensaje) {
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    setTimeout(() => mensaje.style.display = "none", 3000);
  }
}

function alternarRegistro() {
  const boton = document.getElementById("boton-pausa");
  registroActivo = !registroActivo;

  if (registroActivo) {
    temporizadorRegistro = setInterval(registrarUbicacionSimulada, intervaloRegistro);
    boton.textContent = "⏸️ Pausar registro";
    boton.classList.remove("pausado");
  } else {
    clearInterval(temporizadorRegistro);
    boton.textContent = "▶️ Reanudar registro";
    boton.classList.add("pausado");
  }
}
// Inicialización de gráficas
const graficas = {
  temperatura: crearGrafica("grafica-temperatura", "Temperatura (°C)", "#F5A623"),
  ritmo: crearGrafica("grafica-ritmo", "Ritmo cardíaco (bpm)", "#7ED321"),
  energia: crearGrafica("grafica-energia", "Energía (%)", "#00C853"),
  estres: crearGrafica("grafica-estres", "Estrés (%)", "#FFA726"),
  sueño: crearGrafica("grafica-sueño", "Sueño (%)", "#42A5F5"),
  bienestar: crearGrafica("grafica-bienestar", "Bienestar (%)", "#c700ceff"),
};

// Función para crear una gráfica con diseño detallado
function crearGrafica(idCanvas, etiqueta, color) {
  const ctx = document.getElementById(idCanvas).getContext("2d");

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: etiqueta,
        data: [],
        borderColor: color,
        backgroundColor: color + "33", // color semitransparente fijo
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: color,
        pointBorderWidth: 2,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      animation: {
        duration: 500,
        easing: "easeOutQuart",
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Hora",
            color: "#ccc",
            font: { size: 12 },
          },
          ticks: { color: "#aaa" },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Valor",
            color: "#ccc",
            font: { size: 12 },
          },
          ticks: { color: "#aaa" },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            },
          },
        },
        legend: {
          labels: {
            color: "#fff",
            font: { size: 12 },
          },
        },
      },
    },
  });
}

// Variables de control
let intervaloHistorial = 5000;
let temporizadorHistorial;

// Iniciar simulación
function iniciarSimulacionHistorial() {
  if (temporizadorHistorial) clearInterval(temporizadorHistorial);
  temporizadorHistorial = setInterval(actualizarGraficasSimuladas, intervaloHistorial);
}

// Actualizar gráficas con datos simulados
function actualizarGraficasSimuladas() {
  const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const nuevosDatos = {
    temperatura: (37 + Math.random() * 1.5).toFixed(1),
    ritmo: Math.floor(70 + Math.random() * 10),
    energia: Math.floor(60 + Math.random() * 30),
    estres: Math.floor(30 + Math.random() * 40),
    sueño: Math.floor(50 + Math.random() * 30),
    bienestar: Math.floor(60 + Math.random() * 20),
  };

  Object.keys(graficas).forEach((clave) => {
    const grafica = graficas[clave];
    grafica.data.labels.push(hora);
    grafica.data.datasets[0].data.push(nuevosDatos[clave]);

    if (grafica.data.labels.length > 10) {
      grafica.data.labels.shift();
      grafica.data.datasets[0].data.shift();
    }

    grafica.update();
  });
}

// Cambiar frecuencia desde selector
function cambiarFrecuenciaHistorial() {
  const nuevoValor = parseInt(document.getElementById("frecuencia-historial").value);
  intervaloHistorial = nuevoValor;
  iniciarSimulacionHistorial();
  mostrarMensajeFrecuencia(`✅ Frecuencia actualizada a ${nuevoValor / 1000} segundos`);
}

// Aplicar frecuencia personalizada
function aplicarFrecuenciaPersonalizada() {
  const cantidad = parseInt(document.getElementById("frecuencia-personalizada").value);
  const unidad = parseInt(document.getElementById("unidad-frecuencia").value);
  if (isNaN(cantidad) || cantidad <= 0) return;

  const nuevaFrecuencia = cantidad * unidad;
  if (nuevaFrecuencia < 1000 || nuevaFrecuencia > 86400000) {
    alert("La frecuencia debe estar entre 1 segundo y 24 horas.");
    return;
  }

  intervaloHistorial = nuevaFrecuencia;
  iniciarSimulacionHistorial();

  const unidadTexto = unidad === 1000 ? "segundos" : unidad === 60000 ? "minutos" : "horas";
  mostrarMensajeFrecuencia(`✅ Frecuencia actualizada a ${cantidad} ${unidadTexto}`);
}

// Mostrar mensaje de confirmación
function mostrarMensajeFrecuencia(texto) {
  const mensaje = document.getElementById("mensaje-frecuencia");
  if (mensaje) {
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    setTimeout(() => mensaje.style.display = "none", 3000);
  }
}

// Activar simulación al cargar
iniciarSimulacionHistorial();

// Actualizar indicadores fisiológicos y resumen emocional

function actualizarIndicadoresEstado() {
  const datos = {
    temperatura: (36.5 + Math.random() * 2.5).toFixed(1),
    ritmo: Math.floor(60 + Math.random() * 50),
    energia: Math.floor(Math.random() * 100),
    estres: Math.floor(Math.random() * 100),
    sueno: Math.floor(Math.random() * 100),
    emocional: Math.floor(Math.random() * 100),
    actividad: Math.floor(Math.random() * 100)
  };

  const evaluarNivel = (valor) => {
    if (valor < 40) return "bajo";
    if (valor < 70) return "moderado";
    return "alto";
  };

  const aplicarEstadoVisual = (valor, unidad, textoId, valorId, progresoClass) => {
    const nivel = evaluarNivel(valor);
    const texto = document.getElementById(textoId);
    const valorTexto = document.getElementById(valorId);
    const progreso = document.querySelector(`.progress.${progresoClass}`);

    texto.textContent = `${nivel.charAt(0).toUpperCase() + nivel.slice(1)} – ${Math.round(valor)}%`;
    valorTexto.textContent = unidad === "°C" ? `${(valor / 2).toFixed(1)} °C` : `${Math.round(valor)}${unidad}`;
    progreso.setAttribute("stroke-dasharray", `${Math.round(valor)}, 100`);

    progreso.classList.remove("bajo", "moderado", "alto", "alerta");
    progreso.classList.add(nivel);
    if (nivel === "bajo" || nivel === "alto") progreso.classList.add("alerta");

    actualizarIcono(progresoClass, nivel);
  };

  const actualizarIcono = (clase, nivel) => {
    const icono = document.querySelector(`.card.${clase} .icon`);
    if (!icono) return;

    const iconos = {
      temperatura: ["❄️", "🌡️", "🔥"],
      ritmo: ["💓", "❤️", "❤️‍🔥"],
      energia: ["🔋", "🔌", "⚡"],
      estres: ["😌", "😟", "😣"],
      sueno: ["😴", "💤", "🛌"],
      emocional: ["😕", "🙂", "😊"],
      actividad: ["⛔", "🚶", "🏃"]
    };

    const index = nivel === "bajo" ? 0 : nivel === "moderado" ? 1 : 2;
    icono.textContent = iconos[clase][index];
    icono.classList.add("cambio");
    setTimeout(() => icono.classList.remove("cambio"), 400);
  };

  aplicarEstadoVisual(datos.temperatura * 2, "°C", "texto-temperatura", "valor-temperatura", "temperatura");
  aplicarEstadoVisual(datos.ritmo, " bpm", "texto-ritmo", "valor-ritmo", "ritmo");
  aplicarEstadoVisual(datos.energia, "%", "texto-energia", "valor-energia", "energia");
  aplicarEstadoVisual(datos.estres, "%", "texto-estres", "valor-estres", "estres");
  aplicarEstadoVisual(datos.sueno, "%", "texto-sueno", "valor-sueno", "sueno");

  document.getElementById("texto-emocional").textContent = `${datos.emocional}%`;
  document.getElementById("valor-emocional").textContent = "Contento";
  document.querySelector(".progress.emocional").setAttribute("stroke-dasharray", `${datos.emocional}, 100`);
  actualizarIcono("emocional", evaluarNivel(datos.emocional));

  const actividadNivel = evaluarNivel(datos.actividad);
  document.getElementById("texto-actividad").textContent = actividadNivel;
  document.getElementById("valor-actividad").textContent = actividadNivel;
  document.querySelector(".progress.actividad").setAttribute("stroke-dasharray", `${datos.actividad}, 100`);
  actualizarIcono("actividad", actividadNivel);


  // 🧠 Resumen emocional global
  const estadoGlobal = Math.round(
    (datos.energia + (100 - datos.estres) + datos.sueno + datos.emocional + datos.actividad) / 5
  );

  let emoji = "😐";
  let estadoTexto = "Inestable";

  if (estadoGlobal < 40) {
    emoji = "😟";
    estadoTexto = "Crítico";
  } else if (estadoGlobal < 60) {
    emoji = "😐";
    estadoTexto = "Inestable";
  } else if (estadoGlobal < 80) {
    emoji = "🙂";
    estadoTexto = "Estable";
  } else {
    emoji = "😄";
    estadoTexto = "Óptimo";
  }

  const resumen = document.getElementById("resumen-emocional");
  if (resumen) {
    resumen.textContent = `${emoji} ${estadoGlobal}% – ${estadoTexto}`;
  }

  const dashboard = document.querySelector(".dashboard");
  if (dashboard) {
    dashboard.classList.remove("estable", "inestable", "critico");
    dashboard.classList.add(estadoTexto.toLowerCase());
  }

  const recomendaciones = [];

  if (datos.energia < 40) {
    recomendaciones.push("Aumenta la actividad física con paseos cortos o juegos suaves.");
  }
  if (datos.estres > 70) {
    recomendaciones.push("Proporciona un espacio tranquilo y seguro para reducir el estrés.");
  }
  if (datos.sueno < 50) {
    recomendaciones.push("Revisa el entorno de descanso: evita ruidos, luz intensa o interrupciones.");
  }
  if (datos.emocional < 50) {
    recomendaciones.push("Dedica tiempo a la interacción afectiva: caricias, juegos o compañía.");
  }
  if (datos.actividad < 40 && datos.energia > 60) {
    recomendaciones.push("Incorpora sesiones de juego o entrenamiento para canalizar su energía.");
  }
  if (recomendaciones.length === 0) {
    recomendaciones.push("El estado general es estable. Mantén la rutina y monitorea regularmente.");
  }

  const bloqueRecomendaciones = document.getElementById("recomendaciones");
  const lista = document.getElementById("lista-recomendaciones");

  if (bloqueRecomendaciones && lista) {
    lista.innerHTML = "";
    recomendaciones.forEach((rec) => {
      const li = document.createElement("li");
      li.textContent = rec;
      lista.appendChild(li);
    });
    bloqueRecomendaciones.classList.remove("oculto");
  }
}
// ⏱️ Ejecutar cada 5 segundos
setInterval(actualizarIndicadoresEstado, 5000);

// Mostrar/ocultar resumen emocional
function alternarResumen() {
  const bloque = document.getElementById("bloque-resumen");
  const boton = document.querySelector(".boton-resumen");

  if (bloque.classList.contains("oculto")) {
    bloque.classList.remove("oculto");
    boton.textContent = "Ocultar resumen emocional";
  } else {
    bloque.classList.add("oculto");
    boton.textContent = "Mostrar resumen emocional";
  }
}
const toggleBtn = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const cerrarBtn = document.getElementById("cerrar-sidebar");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("visible");
});

cerrarBtn.addEventListener("click", () => {
  sidebar.classList.remove("visible");
});
let intervaloSimulacion = null;

const historialInicial = [
  { emoji: "🙂", valor: 72, hora: "13:30" },
  { emoji: "😟", valor: 38, hora: "13:15" },
  { emoji: "😐", valor: 58, hora: "13:00" }
];


// ✅ Añade una nueva lectura emocional al historial
function agregarLecturaEmocional(emoji, valor, hora) {
  const lectura = `${emoji} ${valor}% – ${hora}`;

  // 📋 Agrega al historial visual
  const li = document.createElement("li");
  li.textContent = lectura;
  const historial = document.getElementById("historial-emocional");
  historial.insertBefore(li, historial.firstChild);

  // ✅ Limita el historial visual a 10 entradas
  while (historial.children.length > 10) {
    historial.removeChild(historial.lastChild);
  }

  // 💾 Guarda en localStorage (limitado a 10)
  const historialGuardado = JSON.parse(localStorage.getItem("lecturasEmocionales") || "[]");
  historialGuardado.unshift(lectura); // agrega al inicio
  if (historialGuardado.length > 10) {
    historialGuardado.pop(); // elimina la más antigua
  }
  localStorage.setItem("lecturasEmocionales", JSON.stringify(historialGuardado));

  // 📈 Actualiza gráfica emocional
  if (typeof graficaEmocionalDia !== "undefined" && graficaEmocionalDia) {
    graficaEmocionalDia.data.labels.unshift(hora);
    graficaEmocionalDia.data.datasets[0].data.unshift(valor);

    if (graficaEmocionalDia.data.labels.length > 10) {
      graficaEmocionalDia.data.labels.pop();
      graficaEmocionalDia.data.datasets[0].data.pop();
    }

    graficaEmocionalDia.update();
  }

  // 🔄 Actualiza resumen emocional en la barra lateral
  actualizarResumenEmocional();

  // 🚨 Verifica alertas si tienes esa función
  if (typeof verificarAlertas === "function") {
    verificarAlertas(valor, obtenerPromedioEmocional());
  }
  generarDiagnosticoEmocional();
generarRecomendacionesEmocionales();
generarRutinasEmocionales(); 
}

// ✅ Actualiza el resumen emocional en el mini dashboard lateral
function actualizarResumenEmocional() {
  const items = [...document.querySelectorAll("#historial-emocional li")];
  if (items.length === 0) return;

  const valores = [];
  let ultimaLectura = null;

  for (const item of items) {
    const match = item.textContent.match(/(\d+)%/);
    if (match) {
      valores.push(parseInt(match[1]));
      if (!ultimaLectura) ultimaLectura = item.textContent;
    }
  }

  const promedio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);

  const ultimaLecturaEl = document.getElementById("ultima-lectura");
  const promedioEl = document.getElementById("promedio-emocional");

  if (ultimaLecturaEl) {
    ultimaLecturaEl.textContent = `Última lectura: ${ultimaLectura}`;
  }

  if (promedioEl) {
    promedioEl.textContent = `Promedio emocional: ${promedio}%`;
  }
  const tendenciaEl = document.getElementById("tendencia-emocional");
if (tendenciaEl) {
  tendenciaEl.textContent = `Tendencia emocional: ${calcularTendenciaEmocional()}`;
}
}
// ✅ Simulación automática con intervalo personalizado
function iniciarSimulacionEmocional() {
  if (intervaloSimulacion) clearInterval(intervaloSimulacion);

  const cantidad = parseInt(document.getElementById("intervalo-personalizado").value);
  const unidad = parseInt(document.getElementById("unidad-intervalo").value);
  if (isNaN(cantidad) || isNaN(unidad)) return;

  const intervaloMs = cantidad * unidad;

  intervaloSimulacion = setInterval(() => {
    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const valor = Math.floor(Math.random() * 41) + 60;
    const emoji = valor > 80 ? "😄" : valor > 65 ? "🙂" : valor > 50 ? "😐" : "😟";
    agregarLecturaEmocional(emoji, valor, horaActual);
  }, intervaloMs);
}

// 🧠 Diagnóstico emocional interpretado
function diagnosticoEmocional(promedio) {
  if (promedio > 80) return "Excelente estado emocional";
  if (promedio > 65) return "Buen estado emocional";
  if (promedio > 50) return "Estado emocional neutro";
  return "Estado emocional bajo";
}

// 🚀 Generar informe emocional
document.getElementById("generar-informe").addEventListener("click", () => {
  const items = [...document.querySelectorAll("#historial-emocional li")];
  if (items.length === 0) return alert("No hay datos para generar informe.");

  let total = 0;
  let max = -Infinity;
  let min = Infinity;

  items.forEach(item => {
    const match = item.textContent.match(/(\d+)%/);
    if (match) {
      const valor = parseInt(match[1]);
      total += valor;
      if (valor > max) max = valor;
      if (valor < min) min = valor;
    }
  });

  const promedio = Math.round(total / items.length);
  const diagnostico = diagnosticoEmocional(promedio);

  document.getElementById("diagnostico-emocional").textContent = `🧠 Diagnóstico: ${diagnostico}`;

  alert(`📊 Informe emocional:
- Lecturas registradas: ${items.length}
- Promedio emocional: ${promedio}%
- Máximo: ${max}%
- Mínimo: ${min}%
- Diagnóstico: ${diagnostico}`);
});

// 📤 Exportar historial como JSON
document.getElementById("exportar-historial").addEventListener("click", () => {
  const items = [...document.querySelectorAll("#historial-emocional li")];
  const datos = items.map(item => item.textContent);
  const json = JSON.stringify(datos, null, 2);

  console.log("📤 Historial exportado:\n", json);
  alert("Historial exportado. Revisa la consola para ver el JSON.");
});

// 🧹 Resetear historial emocional
document.getElementById("resetear-datos").addEventListener("click", () => {
  if (!confirm("¿Seguro que quieres borrar todos los datos emocionales?")) return;

  const historial = document.getElementById("historial-emocional");
  historial.innerHTML = "";
  document.getElementById("diagnostico-emocional").textContent = "";
  actualizarResumenEmocional();
});

// 🐾 Perfil editable: cargar datos
function cargarPerfilAnimal() {
  document.getElementById("nombre-animal").value = localStorage.getItem("nombreAnimal") || "";
  document.getElementById("raza-animal").value = localStorage.getItem("razaAnimal") || "";
  document.getElementById("sexo-animal").value = localStorage.getItem("sexoAnimal") || "";
  document.getElementById("color-animal").value = localStorage.getItem("colorAnimal") || "";
  document.getElementById("peso-animal").value = localStorage.getItem("pesoAnimal") || "";
  document.getElementById("nacimiento-animal").value = localStorage.getItem("nacimientoAnimal") || "";

  calcularEdad();
}

// 📅 Calcular edad desde fecha de nacimiento
function calcularEdad() {
  const fecha = document.getElementById("nacimiento-animal").value;
  const salida = document.getElementById("edad-animal");

  if (!fecha) {
    salida.textContent = "—";
    return;
  }

  const nacimiento = new Date(fecha);
  const hoy = new Date();

  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
    años--;
    meses += 12;
  }

  if (años <= 0 && meses > 0) {
    salida.textContent = `${meses} meses`;
  } else if (años > 0 && meses > 0) {
    salida.textContent = `${años} años y ${meses} meses`;
  } else {
    salida.textContent = `${años} años`;
  }

  // 💡 Actualizar sugerencias personalizadas
  generarRecomendacionAnimal();
}

// 💾 Guardar perfil editable
document.getElementById("guardar-perfil").addEventListener("click", () => {
  localStorage.setItem("nombreAnimal", document.getElementById("nombre-animal").value);
  localStorage.setItem("razaAnimal", document.getElementById("raza-animal").value);
  localStorage.setItem("sexoAnimal", document.getElementById("sexo-animal").value);
  localStorage.setItem("colorAnimal", document.getElementById("color-animal").value);
  localStorage.setItem("pesoAnimal", document.getElementById("peso-animal").value);
  localStorage.setItem("nacimientoAnimal", document.getElementById("nacimiento-animal").value);
  localStorage.setItem("nacimientoAnimal", document.getElementById("nacimiento-animal").value);

  calcularEdad();

  const mensaje = document.getElementById("mensaje-perfil");
  mensaje.style.display = "block";
  setTimeout(() => mensaje.style.display = "none", 2000);
});

function mostrarAlerta(mensaje) {
  const contenedor = document.getElementById("contenedor-alertas");
  contenedor.textContent = mensaje;
  contenedor.classList.remove("alerta-inactiva");
  contenedor.classList.add("alerta-activa");
}

function verificarAlertas(valor, promedio) {
  const UMBRAL_ALERTA = parseInt(localStorage.getItem("umbralEmocional") || "50");

  const lista = document.getElementById("lista-alertas");
  if (!lista) return;

  const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const mensaje = `⚠️ Estado emocional bajo (${valor}%) a las ${hora}`;

  const yaExiste = [...lista.children].some(li => li.dataset.mensaje === mensaje);
  if (!yaExiste && valor < UMBRAL_ALERTA) {
    const alerta = document.createElement("li");
    alerta.classList.add("alerta-activa");
    alerta.dataset.mensaje = mensaje;
    alerta.textContent = mensaje;
    lista.insertBefore(alerta, lista.firstChild);

    setTimeout(() => {
      alerta.classList.add("alerta-oculta");
      setTimeout(() => {
        alerta.remove();
      }, 1000);
    }, 10000);

    const historial = JSON.parse(localStorage.getItem("historialAlertas") || "[]");
    historial.unshift(mensaje);
    if (historial.length > 50) historial.pop();
    localStorage.setItem("historialAlertas", JSON.stringify(historial));

    actualizarHistorialAlertas();
  }
}
function obtenerPromedioEmocional() {
  const items = document.querySelectorAll("#historial-emocional li");
  if (items.length === 0) return 0;

  let total = 0;
  items.forEach(item => {
    const match = item.textContent.match(/(\d+)%/);
    if (match) total += parseInt(match[1]);
  });
  return Math.round(total / items.length);
}
function generarRecomendacionAnimal() {
  const raza = document.getElementById("raza-animal")?.value || "";
  const edadTexto = document.getElementById("edad-animal")?.textContent || "";
  const promedio = obtenerPromedioEmocional();

  let edad = 0;
  if (edadTexto.includes("años")) {
    const match = edadTexto.match(/(\d+)/);
    if (match) edad = parseInt(match[1]);
  }

  let mensaje = "😊 Mantén rutinas estables y refuerza momentos positivos.";

  if (promedio < 50) {
    mensaje = "⚠️ Revisa el entorno del animal. Podría necesitar descanso, compañía o atención médica.";
  } else if (edad > 10) {
    mensaje = "🧘 Recomendamos paseos cortos y descanso frecuente.";
  } else if (raza === "Labrador" && promedio < 65) {
    mensaje = "🎾 Juega con pelota o realiza actividades al aire libre para estimularlo.";
  } else if (raza === "Chihuahua" && promedio > 70) {
    mensaje = "🛋️ Ideal para sesiones tranquilas en casa con refuerzo positivo.";
  }

  const destino = document.getElementById("sugerencia-animal");
  if (destino) destino.textContent = mensaje;
}
let graficaEmocionalDia = null;
let intervaloLectura = null;

// 📈 Inicializa la gráfica emocional en tiempo real
function inicializarGraficaEmocionalTiempoReal() {
  const ctx = document.getElementById("grafica-emocional-dia").getContext("2d");

  graficaEmocionalDia = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Estado emocional (%)",
        data: [],
        borderColor: "#007acc",
        backgroundColor: "rgba(0, 122, 204, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#007acc"
      }]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// 🧩 Agrega una lectura emocional simulada
function agregarLecturaAutomatica() {
  const valor = Math.floor(Math.random() * 61) + 40; // entre 40 y 100
  const emoji = valor >= 75 ? "😊" : valor >= 55 ? "😐" : "😟";
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const fechaTexto = ahora.toLocaleDateString("es-MX", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const lectura = `${emoji} ${valor}% – ${hora} [${fechaTexto}]`;

  // Agrega al historial visual
  const li = document.createElement("li");
  li.textContent = lectura;
  document.getElementById("historial-emocional").appendChild(li);

  // Guarda en localStorage
  const historialGuardado = JSON.parse(localStorage.getItem("lecturasEmocionales") || "[]");
  historialGuardado.push(lectura);
  localStorage.setItem("lecturasEmocionales", JSON.stringify(historialGuardado));

  // Actualiza gráfica
  graficaEmocionalDia.data.labels.push(hora);
  graficaEmocionalDia.data.datasets[0].data.push(valor);
  graficaEmocionalDia.update();
}

// 🔁 Carga lecturas guardadas al iniciar
function cargarLecturasGuardadas() {
  const historial = JSON.parse(localStorage.getItem("lecturasEmocionales") || "[]");
  const lista = document.getElementById("historial-emocional");

  historial.forEach(texto => {
    const li = document.createElement("li");
    li.textContent = texto;
    lista.appendChild(li);

    const match = texto.match(/(\d+)%\s+–\s+(\d{2}:\d{2})/);
    if (match) {
      const valor = parseInt(match[1]);
      const hora = match[2];
      graficaEmocionalDia.data.labels.push(hora);
      graficaEmocionalDia.data.datasets[0].data.push(valor);
    }
  });

  graficaEmocionalDia.update();
}

// ⏱️ Inicia la lectura automática cada X segundos
function iniciarComparativaTiempoReal(frecuenciaMs = 5000) {
  if (intervaloLectura) clearInterval(intervaloLectura);
  intervaloLectura = setInterval(() => {
    agregarLecturaAutomatica();
  }, frecuenciaMs);
}

// 🚀 Inicializa todo al cargar
window.addEventListener("DOMContentLoaded", () => {
  inicializarGraficaEmocionalTiempoReal();
  cargarLecturasGuardadas();
  iniciarComparativaTiempoReal(); // cada 10 segundos
});

const UMBRAL_ALERTA = 50; // puedes hacerlo dinámico más adelante
function verificarAlertas(valor, promedio) {
  const lista = document.getElementById("lista-alertas");
  if (!lista) return;

  const hora = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const mensaje = `⚠️ Estado emocional bajo (${valor}%) a las ${hora}`;

  // Evita duplicados visuales
  const yaExiste = [...lista.children].some(li => li.dataset.mensaje === mensaje);
  if (!yaExiste) {
    const alerta = document.createElement("li");
    alerta.classList.add("alerta-activa");
    alerta.dataset.mensaje = mensaje;
    alerta.textContent = mensaje;
    lista.insertBefore(alerta, lista.firstChild);

    // Oculta automáticamente
    setTimeout(() => {
      alerta.classList.add("alerta-oculta");
      setTimeout(() => {
        alerta.remove();
      }, 1000);
    }, 10000);

    // Guarda en historial persistente
    const historial = JSON.parse(localStorage.getItem("historialAlertas") || "[]");
    historial.unshift(mensaje);
    if (historial.length > 50) historial.pop(); // límite de 50
    localStorage.setItem("historialAlertas", JSON.stringify(historial));

    // Actualiza visualmente el historial
    actualizarHistorialAlertas();
  }
}

function calcularTendenciaEmocional() {
  const items = [...document.querySelectorAll("#historial-emocional li")];
  if (items.length < 2) return "—";

  const valores = items
    .map(item => {
      const match = item.textContent.match(/(\d+)%/);
      return match ? parseInt(match[1]) : null;
    })
    .filter(v => v !== null);

  const recientes = valores.slice(0, 3); // últimas 3 lecturas
  const diferencia = recientes[0] - recientes[recientes.length - 1];

  if (Math.abs(diferencia) < 3) return "Estable →";
  if (diferencia > 0) return "Bajando ↓";
  return "Subiendo ↑";
}
function generarDiagnosticoEmocional() {
  const items = [...document.querySelectorAll("#historial-emocional li")];
  if (items.length === 0) return;

  const match = items[0].textContent.match(/(\d+)%/);
  const valor = match ? parseInt(match[1]) : null;
  const tendencia = calcularTendenciaEmocional();
  const horaActual = new Date().getHours();

  let momento;
  if (horaActual < 12) momento = "mañana";
  else if (horaActual < 18) momento = "tarde";
  else momento = "noche";

  // 🌐 Datos ambientales simulados
  const clima = localStorage.getItem("climaActual") || "soleado";
  const ubicacion = localStorage.getItem("ubicacionAnimal") || "interior";
  const temperatura = parseFloat(localStorage.getItem("temperaturaCorporal") || "38.0");

  let mensaje = "Estado emocional dentro de parámetros normales.";

  if (valor !== null) {
    if (valor < 40 && tendencia === "Bajando ↓") {
      mensaje = `⚠️ El estado emocional está bajando en la ${momento}. Revisa si el animal necesita compañía o descanso.`;
    } else if (valor > 80 && tendencia === "Subiendo ↑") {
      mensaje = `😊 Estado emocional elevado en la ${momento}. Ideal para actividades estimulantes o entrenamiento.`;
    } else if (valor < 50 && tendencia === "Estable →") {
      mensaje = `😐 Estado emocional bajo pero estable en la ${momento}. Observa si hay factores externos que puedan influir.`;
    }
  }

  // 🌐 Ajustes según entorno
  if (valor !== null && valor < 60) {
    if (clima === "caluroso" && temperatura >= 39) {
      mensaje += " Posible estrés por calor. Revisa hidratación.";
    } else if (clima === "lluvioso" && ubicacion === "exterior") {
      mensaje += " Está en exterior bajo lluvia. Considera resguardo.";
    } else if (temperatura < 36) {
      mensaje += " Temperatura corporal baja. Revisa confort térmico.";
    }
  }

  const diagnosticoEl = document.getElementById("mensaje-diagnostico");
  if (diagnosticoEl) {
    diagnosticoEl.textContent = mensaje;
  }
}
function generarRecomendacionesEmocionales() {
  const items = [...document.querySelectorAll("#historial-emocional li")];
  if (items.length === 0) return;

  const match = items[0].textContent.match(/(\d+)%/);
  const valor = match ? parseInt(match[1]) : null;
  const tendencia = calcularTendenciaEmocional();
  const horaActual = new Date().getHours();

  let momento;
  if (horaActual < 12) momento = "mañana";
  else if (horaActual < 18) momento = "tarde";
  else momento = "noche";

  // 🌐 Datos ambientales simulados
  const clima = localStorage.getItem("climaActual") || "soleado";
  const ubicacion = localStorage.getItem("ubicacionAnimal") || "interior";
  const temperatura = parseFloat(localStorage.getItem("temperaturaCorporal") || "38.0");

  const recomendaciones = [];

  if (valor !== null) {
    if (valor < 40 && tendencia === "Bajando ↓") {
      recomendaciones.push("Ofrece compañía tranquila o contacto físico.");
      recomendaciones.push("Evita estímulos intensos o cambios bruscos.");

      if (temperatura < 36) {
        recomendaciones.push("Proporciona abrigo y revisa confort térmico.");
      }
      if (clima === "lluvioso" && ubicacion === "exterior") {
        recomendaciones.push("Resguarda al animal. Evita exposición prolongada a la lluvia.");
      }
    } else if (valor > 80 && tendencia === "Subiendo ↑") {
      recomendaciones.push("Inicia una actividad estimulante o juego interactivo.");
      recomendaciones.push("Aprovecha para reforzar rutinas positivas.");

      if (clima === "caluroso" && temperatura >= 39) {
        recomendaciones.push("Evita actividad física intensa. Revisa hidratación.");
      }
    } else if (valor < 50 && tendencia === "Estable →") {
      recomendaciones.push("Observa el entorno por posibles factores de estrés.");
      recomendaciones.push("Mantén una rutina estable y sin interrupciones.");

      if (ubicacion === "zona de descanso") {
        recomendaciones.push("Asegura que el espacio de descanso sea cómodo y silencioso.");
      }
    } else {
      recomendaciones.push("Continúa monitoreando el estado emocional.");
    }

    // 🕒 Recomendación extra según hora
    if (momento === "noche") {
      recomendaciones.push("Prepara un ambiente relajado para el descanso.");
    } else if (momento === "mañana") {
      recomendaciones.push("Realiza una revisión rápida del entorno y rutina.");
    }
  }

  const lista = document.getElementById("lista-recomendaciones");
  if (lista) {
    lista.innerHTML = "";
    recomendaciones.forEach(rec => {
      const li = document.createElement("li");
      li.textContent = rec;
      lista.appendChild(li);
    });
  }
}
function generarRutinasEmocionales() {
  const items = [...document.querySelectorAll("#historial-emocional li")];
  if (items.length === 0) return;

  const match = items[0].textContent.match(/(\d+)%/);
  const valor = match ? parseInt(match[1]) : null;
  const tendencia = calcularTendenciaEmocional();
  const horaActual = new Date().getHours();

  let momento;
  if (horaActual < 12) momento = "mañana";
  else if (horaActual < 18) momento = "tarde";
  else momento = "noche";

  const rutinas = [];

  if (valor !== null) {
    if (valor < 40 && tendencia === "Bajando ↓") {
      rutinas.push("📌 Supervisar comportamiento durante 15 minutos");
      rutinas.push("📌 Registrar posibles factores de estrés");
    } else if (valor > 80 && tendencia === "Subiendo ↑") {
      rutinas.push("📌 Actividad física ligera (5–10 min)");
      rutinas.push("📌 Reforzar rutina positiva con estímulo");
    } else {
      rutinas.push("📌 Mantener entorno estable y sin interrupciones");
    }

    if (momento === "noche") {
      rutinas.push("📌 Preparar espacio de descanso");
    } else if (momento === "mañana") {
      rutinas.push("📌 Revisar alimentación y entorno");
    }
  }

  const lista = document.getElementById("lista-rutinas");
  if (lista) {
    lista.innerHTML = "";
    rutinas.forEach(rutina => {
      const li = document.createElement("li");
      li.innerHTML = `<label><input type="checkbox"> ${rutina}</label>`;
      lista.appendChild(li);
    });
  }
}
function actualizarHistorialAlertas() {
  const lista = document.getElementById("lista-historial-alertas");
  if (!lista) return;

  const historial = JSON.parse(localStorage.getItem("historialAlertas") || "[]");
  lista.innerHTML = "";

  historial.forEach(mensaje => {
    const li = document.createElement("li");
    li.textContent = mensaje;
    lista.appendChild(li);
  });
}
function exportarHistorialEmocional() {
  const historial = JSON.parse(localStorage.getItem("lecturasEmocionales") || "[]");
  const contenido = historial.join("\n");
  descargarTexto("historial_emocional.txt", contenido);
}

function exportarHistorialAlertas() {
  const alertas = JSON.parse(localStorage.getItem("historialAlertas") || "[]");
  const contenido = alertas.join("\n");
  descargarTexto("historial_alertas.txt", contenido);
}

function descargarTexto(nombreArchivo, contenido) {
  const blob = new Blob([contenido], { type: "text/plain" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
}
function actualizarResumenAmbiental() {
  const clima = localStorage.getItem("climaActual") || "—";
  const ubicacion = localStorage.getItem("ubicacionAnimal") || "—";
  const temperatura = localStorage.getItem("temperaturaCorporal") || "—";

  const lista = document.getElementById("lista-resumen-ambiental");
  if (!lista) return;

  lista.innerHTML = `
    <li>🌤 Clima actual: <strong>${clima}</strong></li>
    <li>📍 Ubicación: <strong>${ubicacion}</strong></li>
    <li>🌡 Temperatura corporal: <strong>${temperatura} °C</strong></li>
  `;
}

window.addEventListener("DOMContentLoaded", () => {
  const climaSelect = document.getElementById("clima-actual");
  const ubicacionSelect = document.getElementById("ubicacion-animal");
  const temperaturaInput = document.getElementById("temperatura-corporal");

  // Cargar valores guardados
  if (climaSelect) {
    climaSelect.value = localStorage.getItem("climaActual") || "Soleado";
    climaSelect.addEventListener("change", () => {
      localStorage.setItem("climaActual", climaSelect.value);
      actualizarResumenAmbiental();
    });
  }

  if (ubicacionSelect) {
    ubicacionSelect.value = localStorage.getItem("ubicacionAnimal") || "Interior";
    ubicacionSelect.addEventListener("change", () => {
      localStorage.setItem("ubicacionAnimal", ubicacionSelect.value);
      actualizarResumenAmbiental();
    });
  }

  if (temperaturaInput) {
    temperaturaInput.value = localStorage.getItem("temperaturaCorporal") || "38.5";
    temperaturaInput.addEventListener("input", () => {
      localStorage.setItem("temperaturaCorporal", temperaturaInput.value);
      actualizarResumenAmbiental();
    });
  }

  // Mostrar resumen al iniciar
  actualizarResumenAmbiental();
});