
"use strict";

/* ==========================================
   MEDICARDIO
   MAPA CONCEPTUAL INTERACTIVO
   Archivo: script.js
========================================== */


/* ==========================================
   1. CONFIGURACIÓN DE LOS TEMAS
========================================== */

const topics = [
    {
        id: "ciclo",
        title: "Ciclo cardíaco",
        color: "#C83E50",

        description:
            "Secuencia de contracción y relajación " +
            "que permite el llenado y la eyección " +
            "de sangre del corazón.",

        relation:
            "El sistema cardionector coordina las " +
            "contracciones que generan cambios de " +
            "presión y regulan el movimiento valvular.",

        

concepts: [
    {
        title: "Diástole auricular",
        link: "permite",
        detail: "Relajación de las aurículas y recepción de sangre procedente de las venas cavas y pulmonares."
    },
    {
        title: "Sístole auricular",
        link: "completa",
        detail: "Contracción auricular posterior a la onda P. Aporta aproximadamente el 15-25 % final del llenado ventricular."
    },
    {
        title: "Diástole ventricular",
        link: "permite",
        detail: "Relajación ventricular, caída de presión y llenado de los ventrículos."
    },
    {
        title: "Sístole ventricular",
        link: "produce",
        detail: "Contracción isovolumétrica y eyección de sangre hacia la aorta y el tronco pulmonar."
    }
],

    },

    {
        id: "valvulas",
        title: "Válvulas cardíacas",
        color: "#347EAA",

        description:
            "Estructuras que garantizan el flujo " +
            "sanguíneo unidireccional mediante " +
            "su apertura y cierre pasivos.",

        relation:
            "Las diferencias de presión producidas " +
            "durante el ciclo cardíaco determinan " +
            "la apertura y el cierre de las válvulas.",

        concepts: [
            {
                title: "Válvula tricúspide",
                link: "comunica",
                detail: "Aurícula derecha y ventrículo derecho."
            },
            {
                title: "Válvula mitral",
                link: "comunica",
                detail: "Aurícula izquierda y ventrículo izquierdo."
            },
            {
                title: "Válvula pulmonar",
                link: "permite",
                detail: "La eyección hacia el tronco pulmonar."
            },
            {
                title: "Válvula aórtica",
                link: "permite",
                detail: "La eyección hacia la aorta."
            }
        ]
    },

    {
        id: "cardionector",
        title: "Sistema cardionector",
        color: "#C49A51",

        description:
            "Conjunto de células cardíacas " +
            "especializadas que generan y conducen " +
            "impulsos eléctricos.",

        relation:
            "La actividad eléctrica desencadena " +
            "la contracción del miocardio y coordina " +
            "las fases del ciclo cardíaco.",

        concepts: [
            {
                title: "Nodo sinoauricular",
                link: "genera",
                detail: "El impulso eléctrico inicial."
            },
            {
                title: "Nodo auriculoventricular",
                link: "retrasa",
                detail: "La conducción hacia los ventrículos."
            },
            {
                title: "Haz de His y ramas",
                link: "conducen",
                detail: "El impulso por el sistema ventricular."
            },
            {
                title: "Fibras de Purkinje",
                link: "distribuyen",
                detail: "Rápidamente el impulso al miocardio ventricular."
            }
        ]
    }
];


/* ==========================================
   2. ELEMENTOS DEL HTML
========================================== */

const wheel = document.getElementById("wheel");
const sectorsLayer = document.getElementById("wheel-sectors");
const labelsLayer = document.getElementById("wheel-labels");

const topicTitle = document.getElementById("topic-title");
const topicDescription =
    document.getElementById("topic-description");

const relationText =
    document.getElementById("functional-relation");

const mapStage = document.getElementById("map-stage");
const connections = document.getElementById("connections");
const conceptsContainer =
    document.getElementById("concept-nodes");


/* ==========================================
   3. GEOMETRÍA DEL SEMICÍRCULO
========================================== */

// Centro situado sobre el borde izquierdo.
// Solo se muestra la mitad derecha del círculo.

const CENTER_X = 0;
const CENTER_Y = 450;

const OUTER_RADIUS = 450;

// El semicírculo se extiende desde
// -90° hasta +90°.

const START_ANGLE = -90;
const TOTAL_ANGLE = 180;

// El primer tema aparece seleccionado.
let activeTopic = 0;

// Amplitud relativa de cada sector.
let sectorWeights = [2.6, 0.45, 0.45];

// Control de la animación.
let wheelAnimation = null;

// Control de animaciones del mapa.
let mapAnimation = 0;

// Elementos SVG de los sectores.
const sectorElements = [];
const labelElements = [];

const SVG_NS = "http://www.w3.org/2000/svg";


/* ==========================================
   4. FUNCIONES GEOMÉTRICAS
========================================== */

function polar(radius, angle) {

    const radians = angle * Math.PI / 180;

    return {
        x: CENTER_X + radius * Math.cos(radians),
        y: CENTER_Y + radius * Math.sin(radians)
    };
}


// Construye un sector circular sólido.
// Todos comparten el mismo centro y radio.

function createSectorPath(startAngle, endAngle) {

    const start = polar(OUTER_RADIUS, startAngle);
    const end = polar(OUTER_RADIUS, endAngle);

    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;

    return [
        `M ${CENTER_X} ${CENTER_Y}`,
        `L ${start.x} ${start.y}`,
        `A ${OUTER_RADIUS} ${OUTER_RADIUS}`,
        `0 ${largeArc} 1 ${end.x} ${end.y}`,
        "Z"
    ].join(" ");
}


/* ==========================================
   5. CREACIÓN DE LOS SECTORES
========================================== */

function createWheel() {

    sectorsLayer.innerHTML = "";
    labelsLayer.innerHTML = "";

    sectorElements.length = 0;
    labelElements.length = 0;

    topics.forEach((topic, index) => {

        const path = document.createElementNS(
            SVG_NS, "path"
        );

        path.classList.add("wheel-sector");

        path.setAttribute("fill", topic.color);
        path.setAttribute("data-topic", topic.id);

        path.style.cursor = "pointer";

        path.addEventListener("click", () => {
            selectTopic(index);
        });

        sectorsLayer.appendChild(path);
        sectorElements.push(path);


        // Etiqueta del sector.

        const label = document.createElementNS(
            SVG_NS, "text"
        );

        label.classList.add("wheel-label");
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "middle");
        label.setAttribute("fill", "#FFFFFF");

        label.style.pointerEvents = "none";

        const words = topic.title.split(" ");
        const midpoint = Math.ceil(words.length / 2);

        const lines = [
            words.slice(0, midpoint).join(" "),
            words.slice(midpoint).join(" ")
        ].filter(Boolean);

        lines.forEach((line, lineIndex) => {

            const tspan = document.createElementNS(
                SVG_NS, "tspan"
            );

            tspan.textContent = line;
            tspan.setAttribute("dy",
                lineIndex === 0 ? "0" : "19"
            );

            label.appendChild(tspan);
        });

        labelsLayer.appendChild(label);
        labelElements.push(label);
    });

    renderWheel();
}


/* ==========================================
   6. DIBUJAR EL ACORDEÓN RADIAL
========================================== */

function renderWheel() {

    const totalWeight = sectorWeights.reduce(
        (sum, weight) => sum + weight, 0
    );

    let currentAngle = START_ANGLE;

    topics.forEach((topic, index) => {

        const angleSize =
            TOTAL_ANGLE *
            (sectorWeights[index] / totalWeight);

        const startAngle = currentAngle;
        const endAngle = startAngle + angleSize;

        currentAngle = endAngle;

        const path = sectorElements[index];
        const label = labelElements[index];

        path.setAttribute(
            "d",
            createSectorPath(startAngle, endAngle)
        );

        const selected = index === activeTopic;

        path.classList.toggle(
            "active", selected
        );

        // Posición del texto sobre el arco.
        const middleAngle =
            (startAngle + endAngle) / 2;

        const textPosition = polar(
            OUTER_RADIUS * 0.64,
            middleAngle
        );

        label.setAttribute("x", textPosition.x);
        label.setAttribute("y", textPosition.y);

        label.querySelectorAll("tspan").forEach(
            (tspan, lineIndex) => {

                tspan.setAttribute(
                    "x", textPosition.x
                );

                if (lineIndex === 0) {
                    tspan.setAttribute(
                        "dy", "-6"
                    );
                }
            }
        );

        label.classList.toggle(
            "active", selected
        );
    });
}


/* ==========================================
   7. ANIMACIÓN DEL ACORDEÓN
========================================== */

function animateWheel() {

    if (wheelAnimation !== null) {
        cancelAnimationFrame(wheelAnimation);
    }

    const initialWeights = [...sectorWeights];

    const targetWeights = topics.map(
        (_, index) =>
            index === activeTopic ? 2.6 : 0.45
    );

    const duration = 950;
    const startTime = performance.now();

    function animate(now) {

        const progress = Math.min(
            1,
            (now - startTime) / duration
        );

        // Movimiento suave.
        const eased =
            progress < 0.5
                ? 4 * progress ** 3
                : 1 - ((-2 * progress + 2) ** 3) / 2;

        sectorWeights = initialWeights.map(
            (weight, index) => {

                return weight +
                    (targetWeights[index] - weight) *
                    eased;
            }
        );

        renderWheel();

        if (progress < 1) {
            wheelAnimation =
                requestAnimationFrame(animate);
        } else {
            wheelAnimation = null;
        }
    }

    wheelAnimation =
        requestAnimationFrame(animate);
}


/* ==========================================
   8. SELECCIONAR UN TEMA
========================================== */

function selectTopic(index) {

    if (index < 0 || index >= topics.length) {
        return;
    }

    activeTopic = index;

    animateWheel();
    renderTopic();
}


/* ==========================================
   9. MOSTRAR CONTENIDO DEL TEMA
========================================== */


const subtopics = {

    // CICLO CARDÍACO

   
"Diástole auricular": [
    "Relajación auricular: las aurículas reciben sangre",
    "Retorno venoso: venas cavas y pulmonares",
    "Presión auricular: aumenta con el llenado",
    "Relación ventricular: ocurre durante gran parte del ciclo"
],

"Sístole auricular": [
    "Onda P: despolarización auricular",
    "Contracción auricular: impulsa sangre hacia los ventrículos",
    "Válvulas AV abiertas: mitral y tricúspide",
    "Llenado activo: aporta aproximadamente 15-25 %",
    "VTD: volumen telediastólico aproximado de 130 mL"
],

"Diástole ventricular": [
    "Relajación isovolumétrica: las cuatro válvulas cerradas",
    "S2: cierre de las válvulas aórtica y pulmonar",
    "Caída de presión: disminuye la presión ventricular",
    "Llenado rápido: apertura de válvulas AV",
    "Diástasis: llenado ventricular lento",
    "Llenado activo: contribución de la sístole auricular"
],

"Sístole ventricular": [
    "Complejo QRS: despolarización ventricular",
    "Contracción isovolumétrica: aumenta la presión sin cambiar el volumen",
    "S1: cierre de las válvulas mitral y tricúspide",
    "Eyección: apertura de las válvulas semilunares",
    "Volumen sistólico: aproximadamente 70 mL",
    "VTS: volumen telesistólico aproximado de 60 mL"
],


    // VÁLVULAS CARDÍACAS


"Válvula tricúspide": [
    "Ubicación: entre aurícula derecha y ventrículo derecho",
    "Apertura: presión auricular derecha mayor que ventricular",
    "Cierre: inicio de la sístole ventricular",
    "Función: evita el reflujo hacia la aurícula derecha",
    "Ruido S1: contribuye al primer ruido cardíaco"
],

"Válvula mitral": [
    "Ubicación: entre aurícula izquierda y ventrículo izquierdo",
    "Apertura: presión auricular izquierda mayor que ventricular",
    "Cierre: inicio de la sístole ventricular",
    "Función: evita el reflujo hacia la aurícula izquierda",
    "Ruido S1: contribuye al primer ruido cardíaco"
],

"Válvula pulmonar": [
    "Ubicación: entre ventrículo derecho y tronco pulmonar",
    "Apertura: presión ventricular derecha mayor que pulmonar",
    "Cierre: inicio de la relajación isovolumétrica",
    "Función: evita el retorno sanguíneo al ventrículo derecho",
    "Ruido S2: contribuye al segundo ruido cardíaco"
],

"Válvula aórtica": [
    "Ubicación: entre ventrículo izquierdo y aorta",
    "Apertura: presión ventricular izquierda mayor que aórtica",
    "Cierre: inicio de la relajación isovolumétrica",
    "Función: evita el retorno sanguíneo al ventrículo izquierdo",
    "Ruido S2: contribuye al segundo ruido cardíaco"
],


    // SISTEMA CARDIONECTOR

"Nodo sinoauricular": [
    "Ubicación: aurícula derecha, cerca de la vena cava superior",
    "Función: marcapasos fisiológico del corazón",
    "Automatismo: genera impulsos eléctricos espontáneos",
    "Despolarización auricular: inicia la activación eléctrica de las aurículas",
    "Onda P: representa la despolarización auricular"
],

"Nodo auriculoventricular": [
    "Ubicación: región inferior del tabique interauricular",
    "Función: recibe y retrasa la conducción del impulso",
    "Retraso AV: favorece el llenado ventricular antes de la sístole",
    "Intervalo PR: comprende la conducción auriculoventricular",
    "Conexión: transmite el impulso hacia el haz de His"
],

"Haz de His y ramas": [
    "Haz de His: conduce el impulso desde la unión AV",
    "Esqueleto fibroso: el haz atraviesa el aislamiento eléctrico normal",
    "Rama derecha: conduce el impulso hacia el ventrículo derecho",
    "Rama izquierda: conduce el impulso hacia el ventrículo izquierdo",
    "Activación ventricular: distribuye el impulso hacia las fibras de Purkinje"
],

"Fibras de Purkinje": [
    "Ubicación: red subendocárdica de los ventrículos",
    "Conducción rápida: distribuye el impulso por el miocardio ventricular",
    "Sincronización: favorece una contracción ventricular coordinada",
    "Complejo QRS: representa la despolarización ventricular",
    "Eyección: la activación eléctrica precede a la contracción mecánica"
],

};

const hemodinamica = {
    "Volumen sistólico": {
        concepto: "Cantidad de sangre expulsada por un ventrículo en cada latido.",
        formula: "VS = VTD - VTS",
        ejemplo: "130 mL - 60 mL = 70 mL"
    },

    "Gasto cardíaco": {
        concepto: "Volumen de sangre impulsado por cada ventrículo en un minuto.",
        formula: "GC = FC × VS",
        ejemplo: "75 × 70 = 5250 mL/min = 5.25 L/min"
    },

    "Precarga": {
        concepto: "Grado de estiramiento del miocardio al final de la diástole.",
        relacion: "Depende del llenado ventricular y del retorno venoso."
    },

    "Contractilidad": {
        concepto: "Capacidad del miocardio para generar fuerza a una precarga determinada.",
        relacion: "Aumenta con la estimulación simpática y la disponibilidad de calcio."
    },

    "Poscarga": {
        concepto: "Carga que el ventrículo debe vencer para eyectar sangre.",
        relacion: "Su aumento puede reducir el volumen sistólico."
    },

    "Ley de Frank-Starling": {
        concepto: "Dentro de límites fisiológicos, un mayor llenado ventricular produce una contracción más intensa.",
        relacion: "Relaciona la precarga con el volumen sistólico."
    }
};


function mostrarCorazon(nombre) {
    const visor = document.getElementById("heartViewer");
    const etiqueta = document.getElementById("heartLabel");
    const objeto = document.getElementById("corazonReal");

    if (!visor || !etiqueta || !objeto) return;

    const regiones = {
        "Diástole auricular": ["right_atrium", "left_atrium"],
        "Sístole auricular": ["right_atrium", "left_atrium"],
        "Diástole ventricular": ["right_ventricle", "left_ventricle"],
        "Sístole ventricular": ["right_ventricle", "left_ventricle"]
    };

    const seleccion = regiones[nombre];

    visor.hidden = !seleccion;
    if (!seleccion) return;

    etiqueta.textContent = nombre;

    function iluminar() {
        const svg = objeto.contentDocument;
        if (!svg) return;

        const todas = [
            "right_atrium", "left_atrium",
            "right_ventricle", "left_ventricle"
        ];

        todas.forEach(id => {
            const parte = svg.getElementById(id);
            if (!parte) return;

            parte.style.removeProperty("filter");
            parte.style.removeProperty("stroke");
            parte.style.removeProperty("stroke-width");

            if (seleccion.includes(id)) {
                parte.style.filter =
                    "brightness(1.5) drop-shadow(0 0 8px #ff334f)";
                parte.style.stroke = "#ff4058";
                parte.style.strokeWidth = "3px";
            }
        });
    }

    if (objeto.contentDocument?.documentElement) {
        iluminar();
    }

    objeto.addEventListener("load", iluminar, { once: true });
}


function renderTopic() {

    const topic = topics[activeTopic];
    mostrarImagenValvula("");
    document.getElementById("heartViewer").hidden = true;
    document.body.dataset.topic = topic.id;

    // Actualizar el encabezado.
    topicTitle.textContent = topic.title;
    topicDescription.textContent = topic.description;
    relationText.textContent = topic.relation;

    // Limpiar el mapa anterior.
    conceptsContainer.innerHTML = "";
    connections.innerHTML = "";

    // Primera columna.
    const firstColumn = document.createElement("div");
    firstColumn.className = "map-level-one";

    // Segunda columna.
    const secondColumn = document.createElement("div");
    secondColumn.className = "map-level-two";

    topic.concepts.forEach((concept, index) => {

        const card = document.createElement("button");
        card.type = "button";
        card.className = "map-concept";

        card.style.setProperty(
            "--branch-color",
            topic.color
        );

        card.textContent = concept.title;

card.title = concept.link
    ? `${topic.title} ${concept.link.toLowerCase()} ${concept.title.toLowerCase()}`
    : concept.title;

        card.addEventListener("click", () => {
            mostrarCorazon(concept.title);
            mostrarImagenValvula(concept.title);

            // Desmarcar las otras tarjetas.
            firstColumn.querySelectorAll(".map-concept")
                .forEach(element => {
                    element.classList.remove("selected");
                });

            // Marcar la tarjeta seleccionada.
            card.classList.add("selected");

            // Limpiar la segunda columna.
            secondColumn.innerHTML = "";

           
            // Crear las subramas del concepto seleccionado.
            


            

let items = [...(subtopics[concept.title] || [])];

// Incorporar los conceptos hemodinámicos al ciclo cardíaco.
if (topic.id === "ciclo" && concept.title === "Sístole ventricular") {
    items.push(
        "Gasto cardíaco: volumen de sangre bombeado por minuto",
        "Precarga: estiramiento ventricular antes de la contracción",
        "Contractilidad: capacidad del miocardio para generar fuerza",
        "Poscarga: carga que debe vencer el ventrículo para eyectar sangre",
        "Ley de Frank-Starling: relación entre llenado y fuerza de contracción"
    );
}


items.forEach(text => {
    const subCard = document.createElement("button");
    subCard.type = "button";
    subCard.className = "map-subconcept";

    subCard.style.setProperty(
        "--branch-color",
        topic.color
    );

    const partes = text.split(":");
    const titulo = partes[0].trim();
    const explicacion = partes.slice(1).join(":").trim();

    subCard.textContent = titulo;

    subCard.addEventListener("click", () => {
        mostrarImagenValvula(titulo);
        const anterior = secondColumn.querySelector(".map-detail");
        if (anterior) anterior.remove();

        const detalle = document.createElement("div");
        detalle.className = "map-detail";

        const encabezado = document.createElement("h3");
        encabezado.textContent = titulo;

        const contenido = document.createElement("p");
        
const datos = hemodinamica[titulo];

contenido.textContent = datos
    ? datos.concepto
    : (explicacion || text);

detalle.appendChild(encabezado);
detalle.appendChild(contenido);

if (datos) {
    const extra = document.createElement("p");

    extra.textContent = [
        datos.formula,
        datos.ejemplo,
        datos.relacion
    ].filter(Boolean).join(" | ");

    extra.style.marginTop = "10px";
    detalle.appendChild(extra);
}

        
secondColumn.appendChild(detalle);

const posicionTarjeta = subCard.offsetTop;

detalle.style.top = posicionTarjeta + "px";

    });

    secondColumn.appendChild(subCard);
});


            const heading = document.createElement("h3");
            heading.textContent = concept.title;

            const description = document.createElement("p");
            description.textContent = concept.detail;

            detailCard.appendChild(heading);
            detailCard.appendChild(description);

            secondColumn.appendChild(detailCard);

        });

        firstColumn.appendChild(card);
    });

    conceptsContainer.appendChild(firstColumn);
    conceptsContainer.appendChild(secondColumn);
}



/* ==========================================
   10. CREAR CONCEPTOS DEL MAPA
========================================== */


function renderConcepts(topic) {

    mapAnimation++;

    const currentAnimation = mapAnimation;

    conceptsContainer.innerHTML = "";

    // Crear las tarjetas conceptuales.

    topic.concepts.forEach((concept, index) => {

        const node = document.createElement("article");
        node.className = "concept-node";

        if (topic.id === "cardionector") {
            node.classList.add("electrical-node");
        }

        // Frase de enlace del mapa conceptual.
        const link = document.createElement("span");
        link.className = "concept-link";
        link.textContent = concept.link;

        // Título del concepto.
        const title = document.createElement("h3");
        title.textContent = concept.title;

        // Resumen visible.
        const summary = document.createElement("p");
        summary.textContent = concept.detail;

        // Botón que abre y cierra la tarjeta.
        const toggle = document.createElement("button");
        toggle.className = "concept-toggle";
        toggle.type = "button";
        toggle.textContent = "Ver explicación +";
        toggle.setAttribute("aria-expanded", "false");

        // Contenido ampliado.
        const expanded = document.createElement("div");
        expanded.className = "concept-expanded";
        expanded.hidden = true;

        const explanation = document.createElement("p");

        explanation.textContent =
            concept.explanation ||
            "Próximamente se incorporará una explicación " +
            "fisiológica más detallada de este concepto.";

        expanded.appendChild(explanation);

        // Interactividad.
        toggle.addEventListener("click", () => {

            const wasOpen = !expanded.hidden;

            // Cerrar las demás tarjetas.
            conceptsContainer
                .querySelectorAll(".concept-expanded")
                .forEach(panel => {
                    panel.hidden = true;
                });

            conceptsContainer
                .querySelectorAll(".concept-toggle")
                .forEach(button => {
                    button.textContent = "Ver explicación +";
                    button.setAttribute(
                        "aria-expanded", "false"
                    );
                });

            conceptsContainer
                .querySelectorAll(".concept-node")
                .forEach(card => {
                    card.classList.remove("expanded");
                });

            // Abrir la tarjeta seleccionada.
            if (!wasOpen) {

                expanded.hidden = false;
                node.classList.add("expanded");

                toggle.textContent = "Ocultar explicación −";
                toggle.setAttribute(
                    "aria-expanded", "true"
                );
            }

            // Ajustar las conexiones al nuevo tamaño.
            requestAnimationFrame(() => {
                drawConnections(topic);
            });
        });

        node.appendChild(link);
        node.appendChild(title);
        node.appendChild(summary);
        node.appendChild(toggle);
        node.appendChild(expanded);

        node.style.setProperty(
            "--node-index", index
        );

        conceptsContainer.appendChild(node);
    });

    // Dibujar las conexiones iniciales.
    requestAnimationFrame(() => {

        if (currentAnimation !== mapAnimation) {
            return;
        }

        drawConnections(topic);
    });
}



/* ==========================================
   11. DIBUJAR RAMIFICACIONES
========================================== */

function drawConnections(topic) {

    connections.innerHTML = "";

    const stageRect =
        mapStage.getBoundingClientRect();

    const nodes = [
        ...conceptsContainer.querySelectorAll(
            ".concept-node"
        )
    ];

    if (!nodes.length) {
        return;
    }

    const width = mapStage.clientWidth;
    const height = mapStage.clientHeight;

    connections.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );

    connections.setAttribute(
        "preserveAspectRatio", "none"
    );

    // Punto de origen de las ramas.
    const startX = 8;
    const startY = height * 0.48;

    const trunkX = Math.min(
        width * 0.24,
        180
    );

    nodes.forEach((node, index) => {

        const rect = node.getBoundingClientRect();

        const endX =
            rect.left - stageRect.left;

        const endY =
            rect.top - stageRect.top +
            rect.height / 2;

        // Curva orgánica.
        const pathData = [
            `M ${startX} ${startY}`,
            `C ${trunkX} ${startY}`,
            `${trunkX} ${endY}`,
            `${endX} ${endY}`
        ].join(" ");

        const path = document.createElementNS(
            SVG_NS, "path"
        );

        path.setAttribute("d", pathData);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", topic.color);
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linecap", "round");

        path.classList.add("artery-path");

        const length = path.getTotalLength();

        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        path.style.setProperty(
            "--path-length", length
        );

        path.style.setProperty(
            "--branch-delay", `${index * 180}ms`
        );

        connections.appendChild(path);

        // Pulso luminoso para cardionector.

        if (topic.id === "cardionector") {

            const pulse = document.createElementNS(
                SVG_NS, "circle"
            );

            pulse.setAttribute("r", "5");
            pulse.setAttribute("fill", "#F5C96A");

            pulse.classList.add("electric-pulse");

            const motion = document.createElementNS(
                SVG_NS, "animateMotion"
            );

            motion.setAttribute(
                "dur", `${2.2 + index * 0.3}s`
            );

            motion.setAttribute(
                "repeatCount", "indefinite"
            );

            motion.setAttribute(
                "path", pathData
            );

            pulse.appendChild(motion);
            connections.appendChild(pulse);
        }
    });
}


/* ==========================================
   12. ADAPTACIÓN AL TAMAÑO DE PANTALLA
========================================== */

let resizeTimer = null;

window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

        renderWheel();
        drawConnections(topics[activeTopic]);

    }, 120);
});


/* ==========================================
   13. INICIAR MEDICARDIO
========================================== */

function initializeMediCardio() {

    // Crear el semicírculo interactivo.
    createWheel();

    // Mantener el tema inicial.
    renderTopic();

    // Preparar las tres ramas del mapa.
    conceptsContainer.classList.add("three-branch-map");

}
initializeMediCardio();


function mostrarImagenValvula(nombre) {
    const visor = document.getElementById("visorValvula");
    const foto = document.getElementById("fotoValvula");

    if (!visor || !foto) return;

    const imagenes = {
        mitral: "mitral.png",
        tricuspide: "tricuspide.png",
        aortica: "aortica.png",
        pulmonar: "pulmonar.png"
    };

    const nombreNormalizado = nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const valvula = Object.keys(imagenes).find(
        clave => nombreNormalizado.includes(clave)
    );

    if (valvula) {
        foto.src = imagenes[valvula];
        visor.style.display = "block";
    } else {
        visor.style.display = "none";
        foto.removeAttribute("src");
    }
}


/* RAMAS AL PASAR EL CURSOR */
(() => {
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");
    svg.id = "ramasInteractivas";
    document.body.appendChild(svg);

    function conectar(origen, destino) {
        const a = origen.getBoundingClientRect();
        const b = destino.getBoundingClientRect();

        const x1 = a.right;
        const y1 = a.top + a.height / 2;
        const x2 = b.left;
        const y2 = b.top + b.height / 2;
        const curva = Math.max(25, Math.abs(x2 - x1) / 2);

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute(
            "d",
            `M ${x1} ${y1} C ${x1 + curva} ${y1},
             ${x2 - curva} ${y2}, ${x2} ${y2}`
        );
        path.classList.add("visible");
        svg.appendChild(path);
    }

    function limpiar() {
        svg.replaceChildren();
    }

    document.addEventListener("pointerover", (evento) => {
        const elemento = evento.target.closest(
            ".map-concept, .subtopic-card"
        );

        if (!elemento) return;

        limpiar();

        const padre = elemento.parentElement;
        if (!padre) return;

        const hermanos = [...padre.children].filter(
            nodo => nodo !== elemento &&
            nodo.matches(".map-concept, .subtopic-card")
        );

        hermanos.forEach(nodo => conectar(elemento, nodo));
    });

    document.addEventListener("pointerout", (evento) => {
        const elemento = evento.target.closest(
            ".map-concept, .subtopic-card"
        );

        if (elemento && !elemento.contains(evento.relatedTarget)) {
            limpiar();
        }
    });

    window.addEventListener("scroll", limpiar, true);
    window.addEventListener("resize", limpiar);
})();
