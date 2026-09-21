const canvas = document.getElementById("journeyCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("animationStatus");

const COLORS = {
    bgGuide: "rgba(88, 166, 255, 0.05)",
    blue: "#58a6ff",
    lightBlue: "#8ecaff",
    paleBlue: "#b7ddff",
    purple: "#c184ff",
    pink: "#ff83ad",
    orange: "#f48a4b",
    seedGlow: "rgba(244, 138, 75, 0.45)"
};

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

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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

function easeInOutCubic(t) {
    t = clamp(t);
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
    t = clamp(t);
    return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t) {
    t = clamp(t);
    return t * t * t;
}

function smoothstep(t) {
    t = clamp(t);
    return t * t * (3 - 2 * t);
}

function rotatePoint(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos
    };
}

function transformPoints(points, center, scale, angle = 0) {
    return points.map((p) => {
        const r = rotatePoint(p, angle);
        return {
            x: center.x + r.x * scale,
            y: center.y + r.y * scale
        };
    });
}

function pathPointAt(points, t) {
    t = clamp(t);

    if (points.length === 1) {
        return points[0];
    }

    const segmentCount = points.length - 1;
    const total = t * segmentCount;
    let index = Math.floor(total);

    if (index >= segmentCount) {
        index = segmentCount - 1;
        return points[segmentCount];
    }

    const frac = total - index;

    return lerpPoint(points[index], points[index + 1], frac);
}

function drawTrimmedPath(
    points,
    {
        start = 0,
        end = 1,
        color = COLORS.paleBlue,
        width = 3,
        alpha = 1
    } = {}
) {
    start = clamp(start);
    end = clamp(end);

    if (!points || points.length < 2 || end <= start) {
        return;
    }

    const steps = Math.max(20, (points.length - 1) * 16);
    const dt = (end - start) / steps;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    const first = pathPointAt(points, start);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i <= steps; i++) {
        const t = i === steps ? end : start + dt * i;
        const p = pathPointAt(points, t);
        ctx.lineTo(p.x, p.y);
    }

    ctx.stroke();
    ctx.restore();
}

function drawSeed(x, y, radius, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
    glow.addColorStop(0, "rgba(244, 138, 75, 0.42)");
    glow.addColorStop(1, "rgba(244, 138, 75, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.orange;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(244, 138, 75, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

function drawBackgroundGuides() {
    const center = { x: width / 2, y: height / 2 };

    ctx.save();
    ctx.strokeStyle = COLORS.bgGuide;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(center.x, 60);
    ctx.lineTo(center.x, height - 60);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, center.y);
    ctx.lineTo(width - 60, center.y);
    ctx.stroke();

    ctx.restore();
}

/* ==========================================================
   BRAIN LINES
   These are the REAL shapes.
   During the root phase, we simply rotate them downward.
   No morphing.
========================================================== */

const BRAIN_OUTLINE = [
    { x: -145, y: 0 },
    { x: -137, y: -30 },
    { x: -120, y: -58 },
    { x: -95, y: -82 },
    { x: -63, y: -96 },
    { x: -22, y: -101 },
    { x: 20, y: -98 },
    { x: 60, y: -86 },
    { x: 95, y: -64 },
    { x: 121, y: -33 },
    { x: 136, y: 4 },
    { x: 132, y: 38 },
    { x: 116, y: 68 },
    { x: 92, y: 90 },
    { x: 59, y: 103 },
    { x: 20, y: 108 },
    { x: -22, y: 105 },
    { x: -60, y: 93 },
    { x: -92, y: 70 },
    { x: -118, y: 40 },
    { x: -138, y: 8 }
];

const BRAIN_LINES = [
    {
        pts: BRAIN_OUTLINE,
        color: COLORS.orange,
        width: 4.8,
        delay: 0.0,
        outline: true
    },

    {
        pts: [
            { x: -128, y: -10 },
            { x: -108, y: -34 },
            { x: -82, y: -52 },
            { x: -50, y: -55 },
            { x: -18, y: -47 },
            { x: 8, y: -31 },
            { x: 28, y: -8 },
            { x: 36, y: 16 }
        ],
        color: COLORS.paleBlue,
        width: 3.4,
        delay: 0.06
    },

    {
        pts: [
            { x: -114, y: 22 },
            { x: -90, y: 0 },
            { x: -58, y: -4 },
            { x: -28, y: 5 },
            { x: -6, y: 22 },
            { x: 20, y: 32 },
            { x: 47, y: 30 },
            { x: 68, y: 16 }
        ],
        color: COLORS.lightBlue,
        width: 3.2,
        delay: 0.10
    },

    {
        pts: [
            { x: -100, y: 50 },
            { x: -73, y: 30 },
            { x: -42, y: 26 },
            { x: -14, y: 37 },
            { x: 7, y: 55 },
            { x: 34, y: 64 },
            { x: 62, y: 61 },
            { x: 84, y: 46 }
        ],
        color: COLORS.paleBlue,
        width: 3.2,
        delay: 0.15
    },

    {
        pts: [
            { x: -72, y: -72 },
            { x: -49, y: -53 },
            { x: -31, y: -27 },
            { x: -29, y: -1 },
            { x: -40, y: 20 },
            { x: -50, y: 42 },
            { x: -49, y: 63 },
            { x: -35, y: 79 }
        ],
        color: COLORS.lightBlue,
        width: 3.0,
        delay: 0.20
    },

    {
        pts: [
            { x: -38, y: -82 },
            { x: -17, y: -62 },
            { x: -4, y: -36 },
            { x: -2, y: -11 },
            { x: -12, y: 12 },
            { x: -16, y: 36 },
            { x: -8, y: 59 },
            { x: 10, y: 76 }
        ],
        color: COLORS.purple,
        width: 3.0,
        delay: 0.25
    },

    {
        pts: [
            { x: 0, y: -84 },
            { x: 12, y: -58 },
            { x: 16, y: -30 },
            { x: 10, y: -5 },
            { x: 8, y: 20 },
            { x: 19, y: 43 },
            { x: 39, y: 57 },
            { x: 60, y: 59 }
        ],
        color: COLORS.paleBlue,
        width: 3.0,
        delay: 0.30
    },

    {
        pts: [
            { x: 42, y: -74 },
            { x: 59, y: -52 },
            { x: 64, y: -26 },
            { x: 60, y: 0 },
            { x: 47, y: 22 },
            { x: 43, y: 46 },
            { x: 54, y: 67 },
            { x: 76, y: 76 }
        ],
        color: COLORS.lightBlue,
        width: 3.0,
        delay: 0.34
    },

    {
        pts: [
            { x: 76, y: -58 },
            { x: 96, y: -38 },
            { x: 104, y: -11 },
            { x: 102, y: 16 },
            { x: 88, y: 39 },
            { x: 69, y: 58 },
            { x: 55, y: 74 },
            { x: 52, y: 90 }
        ],
        color: COLORS.purple,
        width: 3.0,
        delay: 0.39
    },

    {
        pts: [
            { x: -112, y: 4 },
            { x: -84, y: -4 },
            { x: -55, y: 6 },
            { x: -30, y: 26 },
            { x: -7, y: 42 },
            { x: 18, y: 47 },
            { x: 42, y: 40 },
            { x: 61, y: 25 }
        ],
        color: COLORS.blue,
        width: 2.8,
        delay: 0.45
    },

    {
        pts: [
            { x: -85, y: 68 },
            { x: -58, y: 82 },
            { x: -26, y: 89 },
            { x: 8, y: 91 },
            { x: 40, y: 86 },
            { x: 70, y: 74 },
            { x: 94, y: 56 },
            { x: 112, y: 36 }
        ],
        color: COLORS.blue,
        width: 2.8,
        delay: 0.50
    }
];

/* ==========================================================
   ECG / HEART
========================================================== */

const BASELINE = [
    { x: -165, y: 0 },
    { x: -120, y: 0 },
    { x: -80, y: 0 },
    { x: -40, y: 0 },
    { x: 0, y: 0 },
    { x: 55, y: 0 },
    { x: 110, y: 0 },
    { x: 165, y: 0 }
];

const ECG_PATH = [
    { x: -165, y: 0 },
    { x: -120, y: 0 },
    { x: -80, y: 0 },
    { x: -40, y: 0 },
    { x: -28, y: -22 },
    { x: -12, y: 46 },
    { x: 2, y: -68 },
    { x: 18, y: 56 },
    { x: 40, y: 0 },
    { x: 66, y: 0 },
    { x: 92, y: 0 }
];

function heartPoints(center, size = 40) {
    const points = [];
    const samples = 90;

    for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * Math.PI * 2;

        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(
            13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t)
        );

        points.push({
            x: center.x + x * (size / 18),
            y: center.y + y * (size / 18)
        });
    }

    return points;
}

/* ==========================================================
   DRAWERS
========================================================== */

function drawBrainFamily(center, scale, angle, growthProgress = 1) {
    for (let i = 0; i < BRAIN_LINES.length; i++) {
        const line = BRAIN_LINES[i];
        const world = transformPoints(line.pts, center, scale, angle);

        const localGrowth = clamp(
            (growthProgress - line.delay) / Math.max(0.001, 1 - line.delay)
        );

        drawTrimmedPath(world, {
            start: 0,
            end: localGrowth,
            color: line.color,
            width: line.width
        });
    }
}

function drawBrainStatic(center, scale, angle = 0) {
    for (const line of BRAIN_LINES) {
        const world = transformPoints(line.pts, center, scale, angle);

        drawTrimmedPath(world, {
            start: 0,
            end: 1,
            color: line.color,
            width: line.width
        });
    }
}

function drawBrainEraseToLine(center, scale, eraseProgress) {
    const lineCount = BRAIN_LINES.length;

    for (let i = 0; i < lineCount; i++) {
        const line = BRAIN_LINES[i];
        const world = transformPoints(line.pts, center, scale, 0);

        const eraseDelay = i * 0.06;
        const local = clamp((eraseProgress - eraseDelay) / 0.40);

        const start = local;
        const alpha = 1 - local;

        drawTrimmedPath(world, {
            start,
            end: 1,
            color: line.color,
            width: line.width,
            alpha
        });
    }

    const baseline = transformPoints(BASELINE, center, scale, 0);
    const lineAppear = easeOutCubic(clamp((eraseProgress - 0.12) / 0.88));

    drawTrimmedPath(baseline, {
        start: 0,
        end: lineAppear,
        color: COLORS.paleBlue,
        width: 4,
        alpha: 0.9
    });
}

function drawECGAndHeart(center, scale, progress) {
    const ecg = transformPoints(ECG_PATH, center, scale, 0);

    const ecgProgress = clamp(progress / 0.55);
    drawTrimmedPath(ecg, {
        start: 0,
        end: ecgProgress,
        color: COLORS.paleBlue,
        width: 4
    });

    const heartCenter = {
        x: center.x + 120 * scale,
        y: center.y - 2 * scale
    };

    const heart = heartPoints(heartCenter, 35 * scale);
    const heartProgress = clamp((progress - 0.42) / 0.40);

    if (heartProgress > 0) {
        drawTrimmedPath(heart, {
            start: 0,
            end: heartProgress,
            color: COLORS.pink,
            width: 3.8
        });

        if (heartProgress >= 1) {
            const beat = (Math.sin(performance.now() * 0.018) + 1) * 0.5;

            ctx.save();
            ctx.shadowColor = COLORS.pink;
            ctx.shadowBlur = 4 + beat * 8;

            drawTrimmedPath(heart, {
                start: 0,
                end: 1,
                color: COLORS.pink,
                width: 3.8,
                alpha: 0.85 + beat * 0.15
            });

            ctx.restore();
        }
    }

    if (progress > 0.65) {
        const tail = transformPoints(
            [
                { x: 92, y: 0 },
                { x: 118, y: 0 },
                { x: 145, y: 0 },
                { x: 165, y: 0 }
            ],
            center,
            scale,
            0
        );

        drawTrimmedPath(tail, {
            start: 0,
            end: clamp((progress - 0.65) / 0.35),
            color: COLORS.paleBlue,
            width: 4
        });
    }
}

function drawCollapseToSeed(center, scale, progress) {
    const ecg = transformPoints(ECG_PATH, center, scale, 0);

    drawTrimmedPath(ecg, {
        start: smoothstep(progress * 0.8),
        end: 1,
        color: COLORS.paleBlue,
        width: lerp(4, 2.2, progress),
        alpha: 1 - progress * 0.4
    });

    const heartCenter = {
        x: center.x + 120 * scale,
        y: center.y - 2 * scale
    };
    const heart = heartPoints(heartCenter, 35 * scale);

    drawTrimmedPath(heart, {
        start: 0,
        end: 1 - progress,
        color: COLORS.pink,
        width: lerp(3.8, 1.7, progress),
        alpha: 1 - progress * 0.55
    });

    const seedPoint = {
        x: center.x,
        y: center.y - 145 * scale
    };

    const seedAlpha = clamp((progress - 0.35) / 0.65);
    const radius = lerp(4, 12, easeOutCubic(seedAlpha));

    drawSeed(seedPoint.x, seedPoint.y, radius, seedAlpha);
}

/* ==========================================================
   LOOP
========================================================== */

const LOOP_DURATION = 18000;
let startTime = performance.now();

function animate(now) {
    ctx.clearRect(0, 0, width, height);
    drawBackgroundGuides();

    const t = ((now - startTime) % LOOP_DURATION) / LOOP_DURATION;

    const center = {
        x: width * 0.5,
        y: height * 0.53
    };

    const scale = Math.min(width, height) / 420;

    const seedPoint = {
        x: center.x,
        y: center.y - 145 * scale
    };

    /* ------------------------------------------------------
       0.00 - 0.33
       ROOT GROWS DOWNWARD
       These are already the brain lines, just rotated.
    ------------------------------------------------------ */
    if (t < 0.33) {
        statusText.textContent = "GROWING";

        const p = easeOutCubic(t / 0.33);

        drawSeed(seedPoint.x, seedPoint.y, 12 * scale, 1);
        drawBrainFamily(center, scale, Math.PI / 2, p);
    }

    /* ------------------------------------------------------
       0.33 - 0.43
       HOLD ROOT
    ------------------------------------------------------ */
    else if (t < 0.43) {
        statusText.textContent = "ROOT";

        drawSeed(seedPoint.x, seedPoint.y, 12 * scale, 1);
        drawBrainStatic(center, scale, Math.PI / 2);
    }

    /* ------------------------------------------------------
       0.43 - 0.56
       FLIP TO SIDE
       NO MORPHING. ONLY ROTATION.
    ------------------------------------------------------ */
    else if (t < 0.56) {
        statusText.textContent = "ROTATING";

        const p = easeInOutCubic((t - 0.43) / 0.13);
        const angle = lerp(Math.PI / 2, 0, p);

        drawSeed(seedPoint.x, seedPoint.y, 12 * scale, 1 - p * 0.7);
        drawBrainStatic(center, scale, angle);
    }

    /* ------------------------------------------------------
       0.56 - 0.67
       BRAIN HOLD
    ------------------------------------------------------ */
    else if (t < 0.67) {
        statusText.textContent = "BRAIN";
        drawBrainStatic(center, scale, 0);
    }

    /* ------------------------------------------------------
       0.67 - 0.80
       ERASE BACK -> FRONT INTO A HORIZONTAL LINE
       The lines do not move.
    ------------------------------------------------------ */
    else if (t < 0.80) {
        statusText.textContent = "ERASING";

        const p = easeInOutCubic((t - 0.67) / 0.13);
        drawBrainEraseToLine(center, scale, p);
    }

    /* ------------------------------------------------------
       0.80 - 0.91
       ECG + HEART
    ------------------------------------------------------ */
    else if (t < 0.91) {
        statusText.textContent = "PULSE";

        const p = easeOutCubic((t - 0.80) / 0.11);
        drawECGAndHeart(center, scale, p);
    }

    /* ------------------------------------------------------
       0.91 - 1.00
       RETURN TO SEED
    ------------------------------------------------------ */
    else {
        statusText.textContent = "RENEW";

        const p = easeInOutCubic((t - 0.91) / 0.09);
        drawCollapseToSeed(center, scale, p);
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
