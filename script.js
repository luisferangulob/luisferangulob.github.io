const canvas = document.getElementById("journeyCanvas");
const ctx = canvas.getContext("2d");

const DPR = () => window.devicePixelRatio || 1;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = DPR();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const COLORS = {
    root: "#8ec6ff",
    rootSoft: "#4f9eff",
    seed: "#d8834d",
    heart: "#ff8dad",
    text: "rgba(210, 222, 242, 0.78)",
    faint: "rgba(142, 198, 255, 0.18)",
    outline: "#a6d3ff"
};

function point(x, y) {
    return { x, y };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpPoint(a, b, t) {
    return point(lerp(a.x, b.x, t), lerp(a.y, b.y, t));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function easeInOut(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

function drawText(text, x, y) {
    ctx.save();
    ctx.fillStyle = COLORS.text;
    ctx.font = '500 13px "SFMono-Regular", Consolas, monospace';
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
    ctx.restore();
}

function drawCircle(x, y, r, fill, stroke, lineWidth = 2) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
    ctx.restore();
}

function drawPolyline(points, options = {}) {
    if (!points || points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = options.stroke || COLORS.root;
    ctx.lineWidth = options.lineWidth || 3;
    ctx.lineCap = options.lineCap || "round";
    ctx.lineJoin = options.lineJoin || "round";
    ctx.globalAlpha = options.alpha ?? 1;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
}

function partialPolyline(points, progress) {
    if (!points || points.length < 2) return [];
    const p = clamp(progress, 0, 1);
    if (p <= 0) return [points[0]];
    if (p >= 1) return points.slice();

    const segments = points.length - 1;
    const scaled = p * segments;
    const fullSegments = Math.floor(scaled);
    const remainder = scaled - fullSegments;

    const result = [points[0]];

    for (let i = 0; i < fullSegments; i++) {
        result.push(points[i + 1]);
    }

    if (fullSegments < segments) {
        const a = points[fullSegments];
        const b = points[fullSegments + 1];
        result.push(lerpPoint(a, b, remainder));
    }

    return result;
}

function interpolateCurve(curveA, curveB, t) {
    const out = [];
    const length = Math.min(curveA.length, curveB.length);
    for (let i = 0; i < length; i++) {
        out.push(lerpPoint(curveA[i], curveB[i], t));
    }
    return out;
}

function transformPoints(points, origin) {
    return points.map((pt) => point(origin.x + pt.x, origin.y + pt.y));
}

function collapseCurve(points, anchorX, collapseAmount, verticalTightness = 0.28) {
    return points.map((pt) =>
        point(
            lerp(pt.x, anchorX, collapseAmount),
            lerp(pt.y, pt.y * verticalTightness, collapseAmount)
        )
    );
}

function drawBrainOutline(origin, alpha = 1, collapse = 0) {
    const raw = [
        point(-140, 10),
        point(-130, -26),
        point(-104, -54),
        point(-68, -74),
        point(-24, -86),
        point(22, -88),
        point(62, -82),
        point(96, -66),
        point(122, -40),
        point(136, -6),
        point(136, 26),
        point(118, 54),
        point(88, 78),
        point(40, 92),
        point(-10, 92),
        point(-56, 82),
        point(-94, 60),
        point(-122, 34),
        point(-140, 10)
    ];

    const frontAnchor = 118;
    const collapsed = raw.map((pt) =>
        point(
            lerp(pt.x, frontAnchor, collapse),
            lerp(pt.y, 0, collapse * 0.75)
        )
    );

    const pts = transformPoints(collapsed, origin);

    ctx.save();
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 5;
    ctx.globalAlpha = alpha;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
}

function buildECGPath(origin) {
    const pts = [
        point(-190, 0),
        point(-110, 0),
        point(-56, 0),
        point(-28, 0),
        point(-10, -38),
        point(4, 44),
        point(22, -72),
        point(40, 56),
        point(60, 0),
        point(98, 0)
    ];

    return transformPoints(pts, origin);
}

function drawHeart(origin, progress = 1, alpha = 1) {
    const size = 54;
    const t = clamp(progress, 0, 1);

    ctx.save();
    ctx.strokeStyle = COLORS.heart;
    ctx.lineWidth = 5;
    ctx.globalAlpha = alpha;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    const segments = 80;
    let started = false;

    for (let i = 0; i <= segments * t; i++) {
        const u = (i / segments) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(u), 3);
        const y =
            -(13 * Math.cos(u) -
            5 * Math.cos(2 * u) -
            2 * Math.cos(3 * u) -
            Math.cos(4 * u));

        const px = origin.x + (x * size) / 18;
        const py = origin.y + (y * size) / 18;

        if (!started) {
            ctx.moveTo(px, py);
            started = true;
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.stroke();
    ctx.restore();
}

const ROOT_CURVES = [
    [
        point(0, -170),
        point(0, -126),
        point(0, -82),
        point(0, -38),
        point(0, 18),
        point(-2, 74),
        point(-6, 130)
    ],
    [
        point(0, -56),
        point(-18, -20),
        point(-44, 18),
        point(-70, 48),
        point(-94, 74)
    ],
    [
        point(0, -8),
        point(-16, 14),
        point(-40, 40),
        point(-66, 70),
        point(-92, 102)
    ],
    [
        point(0, 34),
        point(-12, 56),
        point(-32, 88),
        point(-54, 116),
        point(-72, 142)
    ],
    [
        point(0, -52),
        point(18, -18),
        point(44, 16),
        point(70, 46),
        point(92, 74)
    ],
    [
        point(0, -4),
        point(16, 22),
        point(40, 50),
        point(66, 82),
        point(94, 106)
    ],
    [
        point(0, 38),
        point(12, 60),
        point(34, 88),
        point(56, 116),
        point(72, 140)
    ]
];

const BRAIN_CURVES = [
    [
        point(-108, 28),
        point(-78, -14),
        point(-32, -42),
        point(18, -48),
        point(58, -26),
        point(82, 8)
    ],
    [
        point(-116, 8),
        point(-82, -10),
        point(-34, -20),
        point(16, -14),
        point(56, 4)
    ],
    [
        point(-100, 44),
        point(-70, 22),
        point(-24, 8),
        point(28, 2),
        point(76, 12)
    ],
    [
        point(-72, 70),
        point(-36, 44),
        point(8, 28),
        point(54, 20),
        point(88, 24)
    ],
    [
        point(-98, -26),
        point(-64, -52),
        point(-18, -64),
        point(30, -56),
        point(62, -30)
    ],
    [
        point(-54, -12),
        point(-26, 12),
        point(8, 30),
        point(46, 44),
        point(74, 48)
    ],
    [
        point(-46, -44),
        point(-14, -26),
        point(24, -8),
        point(60, 8),
        point(90, 20)
    ]
];

const LOOP_SECONDS = 18;
let startTime = performance.now();

function drawFrame() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    const now = performance.now();
    const elapsed = ((now - startTime) / 1000) % LOOP_SECONDS;
    const phase = elapsed / LOOP_SECONDS;

    const origin = point(width * 0.5, height * 0.5);
    const seedTop = point(origin.x, origin.y - 170);

    // faint center guides
    ctx.save();
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(origin.x - 180, origin.y);
    ctx.lineTo(origin.x + 180, origin.y);
    ctx.moveTo(origin.x, origin.y - 170);
    ctx.lineTo(origin.x, origin.y + 170);
    ctx.stroke();
    ctx.restore();

    if (phase < 0.30) {
        // ROOT GROWTH
        const local = easeInOut(phase / 0.30);

        drawCircle(seedTop.x, seedTop.y, 14, COLORS.seed, "rgba(216,131,77,0.35)", 2);
        drawCircle(seedTop.x, seedTop.y, 20, null, "rgba(166,211,255,0.20)", 2);

        ROOT_CURVES.forEach((curve, index) => {
            const delay = index === 0 ? 0 : 0.14 + index * 0.07;
            const curveProgress = clamp((local - delay) / (1 - delay), 0, 1);
            const partial = partialPolyline(transformPoints(curve, origin), curveProgress);
            drawPolyline(partial, {
                stroke: index === 0 ? COLORS.seed : COLORS.root,
                lineWidth: index === 0 ? 5 : 3
            });
        });

        drawText("SEED GROWS INTO A ROOT SYSTEM", width / 2, height - 42);
    } else if (phase < 0.56) {
        // MORPH / ROTATE TO BRAIN
        const local = easeInOut((phase - 0.30) / 0.26);

        drawBrainOutline(origin, local, 0);

        const movingSeed = lerpPoint(point(0, -170), point(-144, 12), local);
        drawCircle(origin.x + movingSeed.x, origin.y + movingSeed.y, 14, COLORS.seed, "rgba(216,131,77,0.35)", 2);

        for (let i = 0; i < ROOT_CURVES.length; i++) {
            const morphed = interpolateCurve(ROOT_CURVES[i], BRAIN_CURVES[i], local);
            drawPolyline(transformPoints(morphed, origin), {
                stroke: i === 0 ? COLORS.root : "#5aa3ff",
                lineWidth: 3
            });
        }

        drawText("ROOTS ROTATE INTO A BRAIN", width / 2, height - 42);
    } else if (phase < 0.75) {
        // COLLAPSE BRAIN FROM BACK TO FRONT
        const local = easeInOut((phase - 0.56) / 0.19);

        const outlineAlpha = 1 - local * 0.7;
        drawBrainOutline(origin, outlineAlpha, local * 0.5);

        drawCircle(origin.x - 144, origin.y + 12, 10, COLORS.seed, "rgba(216,131,77,0.35)", 2);

        for (let i = 0; i < BRAIN_CURVES.length; i++) {
            const base = transformPoints(BRAIN_CURVES[i], origin);
            const backToFrontDelay = i * 0.10;
            const collapse = clamp((local - backToFrontDelay) / (1 - backToFrontDelay), 0, 1);
            const collapsed = collapseCurve(base, origin.x + 82, collapse, 0.12);
            const alpha = 1 - collapse * 0.35;
            drawPolyline(collapsed, {
                stroke: COLORS.root,
                lineWidth: 3,
                alpha
            });
        }

        drawText("BRAIN STRUCTURE COLLAPSES FORWARD INTO SIGNAL", width / 2, height - 42);
    } else if (phase < 0.92) {
        // ECG + HEART
        const local = easeInOut((phase - 0.75) / 0.17);
        const ecgOrigin = point(origin.x - 12, origin.y + 12);
        const ecgPath = buildECGPath(ecgOrigin);

        const lineReveal = clamp(local / 0.7, 0, 1);
        const ecgPartial = partialPolyline(ecgPath, lineReveal);
        drawPolyline(ecgPartial, {
            stroke: COLORS.root,
            lineWidth: 5
        });

        if (local > 0.45) {
            const heartReveal = clamp((local - 0.45) / 0.55, 0, 1);
            drawHeart(point(ecgOrigin.x + 132, ecgOrigin.y), heartReveal, 1);
        }

        drawText("BRAIN SIGNALS BECOME CLINICAL CARE", width / 2, height - 42);
    } else {
        // COLLAPSE ECG/HEART INTO ONE POINT, RETURN TO SEED
        const local = easeInOut((phase - 0.92) / 0.08);
        const ecgOrigin = point(origin.x - 12, origin.y + 12);
        const ecgPath = buildECGPath(ecgOrigin);
        const target = point(origin.x, origin.y - 170);

        const collapsePolyline = ecgPath.map((pt) => lerpPoint(pt, target, local));
        drawPolyline(collapsePolyline, {
            stroke: COLORS.root,
            lineWidth: 5,
            alpha: 1 - local * 0.25
        });

        // collapse heart outline into target
        const heartCenter = point(ecgOrigin.x + 132, ecgOrigin.y);
        const heartPoints = [];
        for (let i = 0; i <= 70; i++) {
            const u = (i / 70) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(u), 3);
            const y =
                -(13 * Math.cos(u) -
                5 * Math.cos(2 * u) -
                2 * Math.cos(3 * u) -
                Math.cos(4 * u));

            heartPoints.push(
                point(
                    heartCenter.x + (x * 54) / 18,
                    heartCenter.y + (y * 54) / 18
                )
            );
        }

        const collapsedHeart = heartPoints.map((pt) => lerpPoint(pt, target, local));
        drawPolyline(collapsedHeart, {
            stroke: COLORS.heart,
            lineWidth: 4,
            alpha: 1 - local * 0.35
        });

        const seedRadius = lerp(8, 14, local);
        drawCircle(target.x, target.y, seedRadius, COLORS.seed, "rgba(216,131,77,0.35)", 2);

        drawText("MEDICINE RETURNS TO A SEED OF NEW GROWTH", width / 2, height - 42);
    }

    requestAnimationFrame(drawFrame);
}

requestAnimationFrame(drawFrame);
