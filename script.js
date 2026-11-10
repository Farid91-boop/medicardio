
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
                title: "Diástole ventricular",
                link: "permite",
                detail: "Relajación y llenado ventricular."
            },
            {
                title: "Sístole auricular",
                link: "completa",
                detail: "El llenado de los ventrículos."
            },
            {
                title: "Sístole ventricular",
                link: "produce",
                detail: "Contracción y eyección sanguínea."
            }
        ]
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

function renderTopic() {

    const topic = topics[activeTopic];

    topicTitle.textContent = topic.title;

    topicDescription.textContent =
        topic.description;

    relationText.textContent =
        topic.relation;

    document.documentElement.style.setProperty(
        "--active-color", topic.color
    );

    renderConcepts(topic);
}


/* ==========================================
   10. CREAR CONCEPTOS DEL MAPA
========================================== */

function renderConcepts(topic) {

    mapAnimation++;

    const currentAnimation = mapAnimation;

    conceptsContainer.innerHTML = "";

    // Crear los recuadros conceptuales.

    topic.concepts.forEach((concept, index) => {

        const node = document.createElement("article");

        node.className = "concept-node";

        if (topic.id === "cardionector") {
            node.classList.add("electrical-node");
        }

        const link = document.createElement("span");
        link.className = "concept-link";
        link.textContent = concept.link;

        const title = document.createElement("h3");
        title.textContent = concept.title;

        const detail = document.createElement("p");
        detail.textContent = concept.detail;

        node.appendChild(link);
        node.appendChild(title);
        node.appendChild(detail);

        node.style.setProperty(
            "--node-index", index
        );

        conceptsContainer.appendChild(node);
    });

    // Esperar a que el navegador calcule
    // las posiciones de los conceptos.

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

    createWheel();
    renderTopic();
}

initializeMediCardio();
