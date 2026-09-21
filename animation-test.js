const canvas = document.getElementById("journeyCanvas");
const ctx = canvas.getContext("2d");

const statusText = document.getElementById("animationStatus");

const COLORS = {
    blue: "#58a6ff",
    lightBlue: "#8ecaff",
    paleBlue: "#b7ddff",
    purple: "#c184ff",
    pink: "#ff83ad",
    orange: "#f48a4b",
    muted: "#6e7681",
    faint: "rgba(88, 166, 255, 0.16)"
};


/* ==========================================================
   CANVAS SETUP
========================================================== */

let width = 0;
let height = 0;
let dpr = 1;

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    dpr = window.devicePixelRatio || 1;

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* ==========================================================
   HELPERS
========================================================== */

function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
}


function lerp(a, b, t) {
    return a + (b - a) * t;
}


function lerpPoint(a, b, t) {

    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t)
    };

}


function smoothstep(t) {

    t = clamp(t);

    return t * t * (3 - 2 * t);

}


function easeInOutCubic(t) {

    t = clamp(t);

    if (t < 0.5) {
        return 4 * t * t * t;
    }

    return 1 - Math.pow(-2 * t + 2, 3) / 2;

}


function easeOutCubic(t) {

    t = clamp(t);

    return 1 - Math.pow(1 - t, 3);

}


function easeInCubic(t) {

    t = clamp(t);

    return t * t * t;

}


function rotatePoint(point, center, angle) {

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
        x: center.x + dx * cos - dy * sin,
        y: center.y + dx * sin + dy * cos
    };

}


function mapPoints(points, center, scale = 1) {

    return points.map((p) => ({
        x: center.x + p.x * scale,
        y: center.y + p.y * scale
    }));

}


function interpolatePath(a, b, t) {

    const result = [];

    for (let i = 0; i < a.length; i++) {

        result.push(
            lerpPoint(
                a[i],
                b[i],
                t
            )
        );

    }

    return result;

}


function drawPath(
    points,
    {
        color = COLORS.blue,
        width = 3,
        alpha = 1,
        progress = 1
    } = {}
) {

    if (!points || points.length < 2) {
        return;
    }

    progress = clamp(progress);

    const segmentCount = points.length - 1;

    const scaledProgress = progress * segmentCount;

    const completedSegments = Math.floor(scaledProgress);

    const remainder = scaledProgress - completedSegments;

    ctx.save();

    ctx.globalAlpha = alpha;

    ctx.strokeStyle = color;

    ctx.lineWidth = width;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    ctx.moveTo(
        points[0].x,
        points[0].y
    );

    for (
        let i = 0;
        i < completedSegments;
        i++
    ) {

        ctx.lineTo(
            points[i + 1].x,
            points[i + 1].y
        );

    }

    if (
        completedSegments < segmentCount
        && remainder > 0
    ) {

        const p = lerpPoint(
            points[completedSegments],
            points[completedSegments + 1],
            remainder
        );

        ctx.lineTo(
            p.x,
            p.y
        );

    }

    ctx.stroke();

    ctx.restore();

}


function drawSeed(
    x,
    y,
    radius,
    alpha = 1
) {

    ctx.save();

    ctx.globalAlpha = alpha;

    const glow = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius * 2.6
    );

    glow.addColorStop(
        0,
        "rgba(244, 138, 75, 0.55)"
    );

    glow.addColorStop(
        1,
        "rgba(244, 138, 75, 0)"
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius * 2.6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle = COLORS.orange;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
        "rgba(244, 138, 75, 0.45)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius + 7,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();

}


/* ==========================================================
   ROOT GEOMETRY

   Every path has exactly 8 points.

   Later, those same paths interpolate into brain sulci.
========================================================== */

const ROOT_LINES = [

    [
        {x: 0, y: -150},
        {x: 1, y: -110},
        {x: -1, y: -65},
        {x: 2, y: -20},
        {x: 0, y: 30},
        {x: 4, y: 82},
        {x: -2, y: 132},
        {x: 0, y: 175}
    ],

    [
        {x: 0, y: -105},
        {x: -10, y: -82},
        {x: -25, y: -54},
        {x: -45, y: -26},
        {x: -68, y: 0},
        {x: -90, y: 22},
        {x: -106, y: 46},
        {x: -118, y: 68}
    ],

    [
        {x: 0, y: -88},
        {x: 12, y: -66},
        {x: 28, y: -42},
        {x: 48, y: -16},
        {x: 69, y: 12},
        {x: 88, y: 36},
        {x: 104, y: 58},
        {x: 116, y: 78}
    ],

    [
        {x: -2, y: -64},
        {x: -15, y: -42},
        {x: -36, y: -16},
        {x: -58, y: 12},
        {x: -79, y: 40},
        {x: -94, y: 70},
        {x: -103, y: 98},
        {x: -110, y: 126}
    ],

    [
        {x: 2, y: -52},
        {x: 18, y: -31},
        {x: 37, y: -6},
        {x: 59, y: 20},
        {x: 77, y: 48},
        {x: 91, y: 77},
        {x: 101, y: 104},
        {x: 108, y: 130}
    ],

    [
        {x: -1, y: -25},
        {x: -16, y: -6},
        {x: -30, y: 16},
        {x: -42, y: 44},
        {x: -52, y: 72},
        {x: -59, y: 103},
        {x: -64, y: 131},
        {x: -67, y: 154}
    ],

    [
        {x: 1, y: -19},
        {x: 16, y: 0},
        {x: 31, y: 22},
        {x: 44, y: 48},
        {x: 55, y: 78},
        {x: 63, y: 106},
        {x: 68, y: 135},
        {x: 72, y: 157}
    ],

    [
        {x: -5, y: 5},
        {x: -19, y: 25},
        {x: -33, y: 48},
        {x: -44, y: 74},
        {x: -51, y: 99},
        {x: -56, y: 123},
        {x: -60, y: 145},
        {x: -63, y: 166}
    ],

    [
        {x: 5, y: 11},
        {x: 21, y: 31},
        {x: 35, y: 53},
        {x: 45, y: 76},
        {x: 52, y: 101},
        {x: 57, y: 126},
        {x: 61, y: 147},
        {x: 64, y: 167}
    ],

    [
        {x: -2, y: 39},
        {x: -11, y: 58},
        {x: -20, y: 78},
        {x: -28, y: 99},
        {x: -35, y: 120},
        {x: -41, y: 140},
        {x: -45, y: 158},
        {x: -48, y: 176}
    ],

    [
        {x: 3, y: 43},
        {x: 12, y: 62},
        {x: 22, y: 82},
        {x: 30, y: 103},
        {x: 37, y: 123},
        {x: 42, y: 143},
        {x: 46, y: 160},
        {x: 49, y: 177}
    ],

    [
        {x: -3, y: 69},
        {x: -10, y: 84},
        {x: -17, y: 101},
        {x: -22, y: 119},
        {x: -27, y: 136},
        {x: -31, y: 151},
        {x: -34, y: 166},
        {x: -36, y: 181}
    ],

    [
        {x: 3, y: 71},
        {x: 10, y: 87},
        {x: 17, y: 104},
        {x: 23, y: 121},
        {x: 28, y: 138},
        {x: 32, y: 154},
        {x: 35, y: 168},
        {x: 37, y: 182}
    ],

    [
        {x: -4, y: -96},
        {x: -23, y: -78},
        {x: -43, y: -60},
        {x: -63, y: -38},
        {x: -79, y: -14},
        {x: -92, y: 12},
        {x: -102, y: 36},
        {x: -109, y: 58}
    ],

    [
        {x: 4, y: -94},
        {x: 24, y: -76},
        {x: 45, y: -57},
        {x: 64, y: -35},
        {x: 81, y: -10},
        {x: 94, y: 16},
        {x: 104, y: 40},
        {x: 112, y: 61}
    ],

    [
        {x: -6, y: -43},
        {x: -27, y: -28},
        {x: -49, y: -8},
        {x: -68, y: 15},
        {x: -84, y: 38},
        {x: -95, y: 61},
        {x: -102, y: 83},
        {x: -106, y: 102}
    ],

    [
        {x: 6, y: -41},
        {x: 28, y: -26},
        {x: 49, y: -6},
        {x: 69, y: 17},
        {x: 84, y: 40},
        {x: 95, y: 63},
        {x: 102, y: 84},
        {x: 107, y: 104}
    ],

    [
        {x: -4, y: -3},
        {x: -25, y: 10},
        {x: -44, y: 26},
        {x: -62, y: 45},
        {x: -76, y: 65},
        {x: -87, y: 85},
        {x: -94, y: 104},
        {x: -99, y: 121}
    ],

    [
        {x: 4, y: -1},
        {x: 25, y: 12},
        {x: 45, y: 28},
        {x: 63, y: 47},
        {x: 78, y: 67},
        {x: 89, y: 87},
        {x: 96, y: 106},
        {x: 101, y: 123}
    ],

    [
        {x: 0, y: 18},
        {x: -1, y: 42},
        {x: 2, y: 68},
        {x: -2, y: 94},
        {x: 2, y: 119},
        {x: -1, y: 142},
        {x: 1, y: 163},
        {x: 0, y: 183}
    ]

];


/* ==========================================================
   BRAIN GEOMETRY

   These are lateral-brain curves.

   They are initially rotated +90 degrees, so while the
   root grows they remain disguised as a vertical structure.

   Then the entire geometry rotates -90 degrees.
========================================================== */

const BRAIN_LINES = [

    [
        {x: -128, y: 4},
        {x: -118, y: -34},
        {x: -91, y: -65},
        {x: -53, y: -82},
        {x: -8, y: -89},
        {x: 38, y: -82},
        {x: 82, y: -60},
        {x: 116, y: -26}
    ],

    [
        {x: -116, y: -18},
        {x: -91, y: -46},
        {x: -56, y: -61},
        {x: -18, y: -62},
        {x: 18, y: -49},
        {x: 43, y: -29},
        {x: 59, y: -8},
        {x: 66, y: 14}
    ],

    [
        {x: -97, y: -48},
        {x: -69, y: -32},
        {x: -43, y: -11},
        {x: -19, y: 11},
        {x: 4, y: 24},
        {x: 31, y: 23},
        {x: 55, y: 10},
        {x: 72, y: -8}
    ],

    [
        {x: -120, y: 4},
        {x: -92, y: -3},
        {x: -63, y: 5},
        {x: -41, y: 25},
        {x: -18, y: 39},
        {x: 10, y: 39},
        {x: 37, y: 27},
        {x: 61, y: 9}
    ],

    [
        {x: -108, y: 31},
        {x: -82, y: 15},
        {x: -53, y: 14},
        {x: -26, y: 29},
        {x: -7, y: 50},
        {x: 18, y: 59},
        {x: 45, y: 53},
        {x: 69, y: 35}
    ],

    [
        {x: -87, y: 57},
        {x: -61, y: 37},
        {x: -35, y: 34},
        {x: -9, y: 50},
        {x: 12, y: 69},
        {x: 39, y: 72},
        {x: 65, y: 61},
        {x: 83, y: 43}
    ],

    [
        {x: -55, y: 76},
        {x: -30, y: 59},
        {x: -4, y: 58},
        {x: 19, y: 73},
        {x: 42, y: 78},
        {x: 64, y: 70},
        {x: 83, y: 54},
        {x: 96, y: 34}
    ],

    [
        {x: -119, y: -21},
        {x: -104, y: 5},
        {x: -97, y: 31},
        {x: -92, y: 54},
        {x: -75, y: 71},
        {x: -55, y: 81},
        {x: -33, y: 86},
        {x: -8, y: 87}
    ],

    [
        {x: -79, y: -64},
        {x: -79, y: -40},
        {x: -69, y: -20},
        {x: -51, y: -9},
        {x: -34, y: -7},
        {x: -19, y: -15},
        {x: -8, y: -32},
        {x: -6, y: -50}
    ],

    [
        {x: -50, y: -77},
        {x: -31, y: -55},
        {x: -10, y: -44},
        {x: 12, y: -44},
        {x: 31, y: -54},
        {x: 46, y: -68},
        {x: 61, y: -71},
        {x: 76, y: -60}
    ],

    [
        {x: 9, y: -80},
        {x: 7, y: -57},
        {x: 13, y: -38},
        {x: 29, y: -23},
        {x: 47, y: -18},
        {x: 64, y: -22},
        {x: 76, y: -35},
        {x: 78, y: -51}
    ],

    [
        {x: 49, y: -70},
        {x: 62, y: -52},
        {x: 67, y: -31},
        {x: 65, y: -12},
        {x: 56, y: 4},
        {x: 42, y: 15},
        {x: 30, y: 29},
        {x: 29, y: 44}
    ],

    [
        {x: 80, y: -58},
        {x: 95, y: -39},
        {x: 102, y: -17},
        {x: 100, y: 8},
        {x: 90, y: 30},
        {x: 76, y: 48},
        {x: 64, y: 62},
        {x: 58, y: 75}
    ],

    [
        {x: -97, y: 13},
        {x: -72, y: -7},
        {x: -43, y: -9},
        {x: -19, y: 3},
        {x: 0, y: 15},
        {x: 24, y: 13},
        {x: 45, y: 1},
        {x: 59, y: -17}
    ],

    [
        {x: -80, y: 44},
        {x: -59, y: 26},
        {x: -34, y: 22},
        {x: -12, y: 30},
        {x: 7, y: 43},
        {x: 30, y: 44},
        {x: 49, y: 32},
        {x: 59, y: 15}
    ],

    [
        {x: -62, y: -51},
        {x: -49, y: -32},
        {x: -48, y: -12},
        {x: -57, y: 4},
        {x: -66, y: 17},
        {x: -66, y: 34},
        {x: -56, y: 48},
        {x: -42, y: 56}
    ],

    [
        {x: -24, y: -61},
        {x: -13, y: -42},
        {x: -13, y: -23},
        {x: -22, y: -6},
        {x: -29, y: 8},
        {x: -26, y: 23},
        {x: -15, y: 35},
        {x: 0, y: 41}
    ],

    [
        {x: 19, y: -58},
        {x: 30, y: -41},
        {x: 31, y: -22},
        {x: 24, y: -6},
        {x: 18, y: 9},
        {x: 22, y: 24},
        {x: 34, y: 35},
        {x: 49, y: 39}
    ],

    [
        {x: -90, y: 67},
        {x: -69, y: 82},
        {x: -42, y: 90},
        {x: -13, y: 92},
        {x: 17, y: 89},
        {x: 45, y: 81},
        {x: 72, y: 67},
        {x: 95, y: 47}
    ],

    [
        {x: -128, y: 4},
        {x: -125, y: 31},
        {x: -111, y: 56},
        {x: -88, y: 76},
        {x: -58, y: 88},
        {x: -23, y: 94},
        {x: 12, y: 93},
        {x: 45, y: 85}
    ]

];


/* ==========================================================
   ECG GEOMETRY
========================================================== */

const ECG_PATH = [

    {x: -150, y: 0},
    {x: -105, y: 0},
    {x: -65, y: 0},
    {x: -36, y: 0},
    {x: -22, y: -26},
    {x: -10, y: 38},
    {x: 6, y: -60},
    {x: 24, y: 46}

];


const ECG_FINAL = [

    {x: 24, y: 46},
    {x: 43, y: 0},
    {x: 65, y: 0},
    {x: 88, y: 0},
    {x: 111, y: 0},
    {x: 134, y: 0},
    {x: 154, y: 0},
    {x: 170, y: 0}

];


/* ==========================================================
   HEART CURVE
========================================================== */

function heartPoints(center, size = 52) {

    const points = [];

    const samples = 100;

    for (
        let i = 0;
        i <= samples;
        i++
    ) {

        const t =
            (i / samples)
            * Math.PI
            * 2;

        const x =
            16
            * Math.pow(
                Math.sin(t),
                3
            );

        const y =
            -(
                13 * Math.cos(t)
                - 5 * Math.cos(2 * t)
                - 2 * Math.cos(3 * t)
                - Math.cos(4 * t)
            );

        points.push({

            x:
                center.x
                + x
                * (size / 18),

            y:
                center.y
                + y
                * (size / 18)

        });

    }

    return points;

}


/* ==========================================================
   TIMELINE
========================================================== */

/*

0.00 – 0.28
Seed + root growth

0.28 – 0.41
Branches finish settling into hidden brain geometry
(still vertical)

0.41 – 0.52
Whole structure rotates 90°

0.52 – 0.59
Brain hold

0.59 – 0.75
Brain collapses back → front

0.75 – 0.82
Last three curves converge into ECG

0.82 – 0.91
ECG + heart pulse

0.91 – 1.00
Everything collapses into original seed

*/

const LOOP_DURATION = 20000;

let startTime = performance.now();


/* ==========================================================
   ROOT → HIDDEN BRAIN MORPH
========================================================== */

function hiddenBrainLine(lineIndex) {

    const line =
        BRAIN_LINES[lineIndex];

    return line.map((p) => ({

        x: -p.y,
        y: p.x

    }));

}


/* ==========================================================
   DRAW ROOT / BRAIN FAMILY
========================================================== */

function drawRootBrainFamily(
    center,
    morph,
    rotation,
    growth = 1,
    collapse = 0
) {

    const scale =
        Math.min(
            width,
            height
        ) / 470;


    for (
        let i = 0;
        i < ROOT_LINES.length;
        i++
    ) {

        const root =
            ROOT_LINES[i];

        const brainVertical =
            hiddenBrainLine(i);


        let localMorph = morph;

        if (i !== 0) {

            const delay =
                Math.min(
                    0.30,
                    i * 0.012
                );

            localMorph =
                clamp(
                    (morph - delay)
                    /
                    (1 - delay)
                );

        }


        let line =
            interpolatePath(
                root,
                brainVertical,
                localMorph
            );


        line =
            mapPoints(
                line,
                center,
                scale
            );


        if (rotation !== 0) {

            line =
                line.map(
                    (p) =>
                        rotatePoint(
                            p,
                            center,
                            rotation
                        )
                );

        }


        let alpha = 1;

        if (collapse > 0) {

            const lateralBrain =
                BRAIN_LINES[i];

            const averageX =
                lateralBrain.reduce(
                    (sum, p) =>
                        sum + p.x,
                    0
                )
                /
                lateralBrain.length;


            const normalizedBackPosition =
                clamp(
                    (
                        averageX + 130
                    )
                    /
                    260
                );


            const lineCollapse =
                clamp(
                    (
                        collapse
                        - normalizedBackPosition
                        * 0.62
                    )
                    /
                    0.38
                );


            const frontAnchor = {

                x:
                    center.x
                    + 122
                    * scale,

                y:
                    center.y

            };


            line =
                line.map(
                    (p) =>
                        lerpPoint(
                            p,
                            frontAnchor,
                            lineCollapse
                        )
                );


            alpha =
                1
                - lineCollapse
                * 0.92;

        }


        const branchDelay =
            i === 0
                ? 0
                : 0.10
                + i * 0.017;


        const branchGrowth =
            clamp(
                (
                    growth
                    - branchDelay
                )
                /
                (
                    1
                    - branchDelay
                )
            );


        let color =
            COLORS.lightBlue;

        let lineWidth =
            2.2;

        if (i === 0) {

            color =
                COLORS.orange;

            lineWidth =
                4.2;

        }

        else if (i % 4 === 0) {

            color =
                COLORS.purple;

        }

        else if (i % 3 === 0) {

            color =
                COLORS.blue;

        }


        drawPath(
            line,
            {
                color,
                width: lineWidth,
                alpha,
                progress:
                    branchGrowth
            }
        );

    }

}


/* ==========================================================
   FINAL THREE CURVES → ECG
========================================================== */

function drawBrainToECG(
    center,
    progress
) {

    const scale =
        Math.min(
            width,
            height
        ) / 470;


    const sourceIndices =
        [11, 12, 18];


    const ecg =
        mapPoints(
            ECG_PATH,
            center,
            scale
        );


    sourceIndices.forEach(
        (index, sourceOffset) => {

            let source =
                mapPoints(
                    BRAIN_LINES[index],
                    center,
                    scale
                );


            const shiftedTarget =
                ecg.map(
                    (p) => ({
                        x: p.x,
                        y:
                            p.y
                            + (
                                sourceOffset - 1
                            )
                            * 5
                            * (1 - progress)
                    })
                );


            const line =
                interpolatePath(
                    source,
                    shiftedTarget,
                    progress
                );


            drawPath(
                line,
                {
                    color:
                        sourceOffset === 1
                            ? COLORS.paleBlue
                            : COLORS.blue,

                    width:
                        sourceOffset === 1
                            ? 4
                            : 2.2,

                    alpha:
                        sourceOffset === 1
                            ? 1
                            : 1 - progress * 0.78
                }
            );

        }
    );

}


/* ==========================================================
   ECG + HEART
========================================================== */

function drawECGHeart(
    center,
    progress
) {

    const scale =
        Math.min(
            width,
            height
        ) / 470;


    const ecg =
        mapPoints(
            ECG_PATH,
            center,
            scale
        );


    drawPath(
        ecg,
        {
            color:
                COLORS.paleBlue,

            width: 4
        }
    );


    const continuation =
        mapPoints(
            ECG_FINAL,
            center,
            scale
        );


    const beforeHeart =
        continuation.slice(
            0,
            4
        );


    drawPath(
        beforeHeart,
        {
            color:
                COLORS.paleBlue,

            width: 4,

            progress:
                clamp(
                    progress / 0.3
                )
        }
    );


    if (progress > 0.25) {

        const heartProgress =
            clamp(
                (
                    progress - 0.25
                )
                /
                0.50
            );


        const heartCenter = {

            x:
                center.x
                + 112
                * scale,

            y:
                center.y
                - 3
                * scale

        };


        const heart =
            heartPoints(
                heartCenter,
                37 * scale
            );


        drawPath(
            heart,
            {
                color:
                    COLORS.pink,

                width: 3.8,

                progress:
                    heartProgress
            }
        );


        if (heartProgress > 0.85) {

            const beat =
                (
                    Math.sin(
                        performance.now()
                        * 0.018
                    )
                    + 1
                )
                /
                2;


            const glow =
                5
                + beat * 5;


            ctx.save();

            ctx.shadowColor =
                COLORS.pink;

            ctx.shadowBlur =
                glow;

            drawPath(
                heart,
                {
                    color:
                        COLORS.pink,

                    width: 3.8,

                    alpha:
                        0.88
                        + beat
                        * 0.12
                }
            );

            ctx.restore();

        }

    }


    if (progress > 0.68) {

        const tailProgress =
            clamp(
                (
                    progress - 0.68
                )
                /
                0.32
            );


        const tail = [

            continuation[3],

            continuation[4],

            continuation[5],

            continuation[6],

            continuation[7]

        ];


        drawPath(
            tail,
            {
                color:
                    COLORS.paleBlue,

                width: 4,

                progress:
                    tailProgress
            }
        );

    }

}


/* ==========================================================
   COLLAPSE EVERYTHING INTO SEED
========================================================== */

function drawCollapseToSeed(
    center,
    seedPoint,
    progress
) {

    const scale =
        Math.min(
            width,
            height
        ) / 470;


    const ecg =
        mapPoints(
            ECG_PATH,
            center,
            scale
        );


    const continuation =
        mapPoints(
            ECG_FINAL,
            center,
            scale
        );


    const heartCenter = {

        x:
            center.x
            + 112
            * scale,

        y:
            center.y
            - 3
            * scale

    };


    const heart =
        heartPoints(
            heartCenter,
            37 * scale
        );


    const collapsePath =
        (path) =>
            path.map(
                (p) =>
                    lerpPoint(
                        p,
                        seedPoint,
                        progress
                    )
            );


    drawPath(
        collapsePath(ecg),
        {
            color:
                COLORS.paleBlue,

            width:
                lerp(
                    4,
                    2,
                    progress
                ),

            alpha:
                1
                - progress
                * 0.3
        }
    );


    drawPath(
        collapsePath(continuation),
        {
            color:
                COLORS.paleBlue,

            width:
                lerp(
                    4,
                    2,
                    progress
                ),

            alpha:
                1
                - progress
                * 0.3
        }
    );


    drawPath(
        collapsePath(heart),
        {
            color:
                COLORS.pink,

            width:
                lerp(
                    3.8,
                    1.8,
                    progress
                ),

            alpha:
                1
                - progress
                * 0.25
        }
    );


    const radius =
        lerp(
            3,
            12,
            easeOutCubic(progress)
        );


    drawSeed(
        seedPoint.x,
        seedPoint.y,
        radius,
        progress
    );

}


/* ==========================================================
   BACKGROUND DETAILS
========================================================== */

function drawBackgroundGuides() {

    const center = {
        x: width / 2,
        y: height / 2
    };


    ctx.save();

    ctx.strokeStyle =
        "rgba(88,166,255,0.035)";

    ctx.lineWidth = 1;


    ctx.beginPath();

    ctx.moveTo(
        center.x,
        60
    );

    ctx.lineTo(
        center.x,
        height - 60
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        60,
        center.y
    );

    ctx.lineTo(
        width - 60,
        center.y
    );

    ctx.stroke();


    ctx.restore();

}


/* ==========================================================
   MAIN LOOP
========================================================== */

function animate(now) {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawBackgroundGuides();


    const raw =
        (
            (
                now - startTime
            )
            %
            LOOP_DURATION
        )
        /
        LOOP_DURATION;


    const center = {

        x:
            width * 0.5,

        y:
            height * 0.51

    };


    const scale =
        Math.min(
            width,
            height
        )
        /
        470;


    const seedPoint = {

        x:
            center.x,

        y:
            center.y
            - 150
            * scale

    };


    /* ------------------------------------------------------
       PHASE 1
       Seed → growing root
    ------------------------------------------------------ */

    if (raw < 0.28) {

        statusText.textContent =
            "GROWING";


        const t =
            easeOutCubic(
                raw / 0.28
            );


        drawSeed(
            seedPoint.x,
            seedPoint.y,
            11 * scale
        );


        drawRootBrainFamily(
            center,
            0,
            0,
            t,
            0
        );

    }


    /* ------------------------------------------------------
       PHASE 2
       Root branches subtly reorganize into hidden brain
    ------------------------------------------------------ */

    else if (raw < 0.41) {

        statusText.textContent =
            "ORGANIZING";


        const t =
            easeInOutCubic(
                (
                    raw - 0.28
                )
                /
                0.13
            );


        drawSeed(
            seedPoint.x,
            seedPoint.y,
            11 * scale,
            1 - t * 0.45
        );


        drawRootBrainFamily(
            center,
            t,
            0,
            1,
            0
        );

    }


    /* ------------------------------------------------------
       PHASE 3
       One structure rotates 90 degrees
    ------------------------------------------------------ */

    else if (raw < 0.52) {

        statusText.textContent =
            "ROTATING";


        const t =
            easeInOutCubic(
                (
                    raw - 0.41
                )
                /
                0.11
            );


        const rotation =
            -Math.PI
            /
            2
            *
            t;


        const rotatedSeed =
            rotatePoint(
                seedPoint,
                center,
                rotation
            );


        drawSeed(
            rotatedSeed.x,
            rotatedSeed.y,
            11 * scale,
            0.55
            * (1 - t)
        );


        drawRootBrainFamily(
            center,
            1,
            rotation,
            1,
            0
        );

    }


    /* ------------------------------------------------------
       PHASE 4
       Brain visible
    ------------------------------------------------------ */

    else if (raw < 0.59) {

        statusText.textContent =
            "BRAIN";


        drawRootBrainFamily(
            center,
            1,
            -Math.PI / 2,
            1,
            0
        );

    }


    /* ------------------------------------------------------
       PHASE 5
       Brain lines collapse from back → front
    ------------------------------------------------------ */

    else if (raw < 0.75) {

        statusText.textContent =
            "COLLAPSING";


        const t =
            easeInOutCubic(
                (
                    raw - 0.59
                )
                /
                0.16
            );


        drawRootBrainFamily(
            center,
            1,
            -Math.PI / 2,
            1,
            t
        );

    }


    /* ------------------------------------------------------
       PHASE 6
       Final three brain curves → one ECG
    ------------------------------------------------------ */

    else if (raw < 0.82) {

        statusText.textContent =
            "SIGNAL";


        const t =
            easeInOutCubic(
                (
                    raw - 0.75
                )
                /
                0.07
            );


        drawBrainToECG(
            center,
            t
        );

    }


    /* ------------------------------------------------------
       PHASE 7
       ECG → heart pulse
    ------------------------------------------------------ */

    else if (raw < 0.91) {

        statusText.textContent =
            "PULSE";


        const t =
            easeOutCubic(
                (
                    raw - 0.82
                )
                /
                0.09
            );


        drawECGHeart(
            center,
            t
        );

    }


    /* ------------------------------------------------------
       PHASE 8
       ECG + heart collapse into original seed
    ------------------------------------------------------ */

    else {

        statusText.textContent =
            "RENEW";


        const t =
            easeInOutCubic(
                (
                    raw - 0.91
                )
                /
                0.09
            );


        drawCollapseToSeed(
            center,
            seedPoint,
            t
        );

    }


    requestAnimationFrame(
        animate
    );

}


requestAnimationFrame(
    animate
);
