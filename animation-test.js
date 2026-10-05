(() => {
  const canvas = document.getElementById('conceptCanvas');
  const phaseLabel = document.getElementById('phaseLabel');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const COLORS = {
    axis: 'rgba(90, 150, 255, 0.10)',
    outer: '#ff4da0',
    branchA: '#b4d9ff',
    branchB: '#d78dff',
    branchC: '#7fc4ff',
    seed: '#ff9d52',
    ecg: '#c7e3ff'
  };

  const seed = { x: 0, y: -0.52 };
  const pivot = { x: 0.03, y: 0.02 };


  const paths = [
    {
      name: 'outer-left',
      color: COLORS.outer,
      width: 0.018,
      start: 0.00,
      end: 0.62,
      points: [
        seed,
        { x: -0.03, y: -0.47 },
        { x: -0.08, y: -0.44 },
        { x: -0.11, y: -0.39 },
        { x: -0.17, y: -0.36 },
        { x: -0.23, y: -0.32 },
        { x: -0.28, y: -0.25 },
        { x: -0.25, y: -0.17 },
        { x: -0.31, y: -0.10 },
        { x: -0.35, y: -0.02 },
        { x: -0.31, y: 0.06 },
        { x: -0.35, y: 0.15 },
        { x: -0.29, y: 0.22 },
        { x: -0.32, y: 0.30 },
        { x: -0.26, y: 0.39 },
        { x: -0.18, y: 0.46 },
        { x: -0.10, y: 0.54 },
        { x: -0.01, y: 0.57 }
      ]
    },
    {
      name: 'outer-right',
      color: COLORS.outer,
      width: 0.018,
      start: 0.04,
      end: 0.70,
      points: [
        seed,
        { x: 0.05, y: -0.46 },
        { x: 0.12, y: -0.43 },
        { x: 0.19, y: -0.39 },
        { x: 0.26, y: -0.33 },
        { x: 0.35, y: -0.31 },
        { x: 0.41, y: -0.24 },
        { x: 0.37, y: -0.17 },
        { x: 0.46, y: -0.12 },
        { x: 0.50, y: -0.04 },
        { x: 0.46, y: 0.05 },
        { x: 0.53, y: 0.13 },
        { x: 0.48, y: 0.22 },
        { x: 0.54, y: 0.31 },
        { x: 0.49, y: 0.40 },
        { x: 0.39, y: 0.47 },
        { x: 0.28, y: 0.54 },
        { x: 0.15, y: 0.57 }
      ]
    },
    {
      name: 'main-inner-a',
      color: COLORS.branchA,
      width: 0.013,
      start: 0.08,
      end: 0.62,
      points: [
        seed,
        { x: -0.01, y: -0.41 },
        { x: 0.03, y: -0.33 },
        { x: -0.01, y: -0.24 },
        { x: 0.06, y: -0.15 },
        { x: 0.01, y: -0.05 },
        { x: 0.09, y: 0.07 },
        { x: 0.02, y: 0.17 },
        { x: 0.11, y: 0.29 },
        { x: 0.04, y: 0.41 },
        { x: 0.10, y: 0.54 }
      ]
    },
    {
      name: 'upper-loop',
      color: COLORS.branchB,
      width: 0.011,
      start: 0.18,
      end: 0.50,
      points: [
        { x: 0.02, y: -0.33 },
        { x: 0.11, y: -0.28 },
        { x: 0.18, y: -0.21 },
        { x: 0.21, y: -0.12 },
        { x: 0.20, y: -0.02 },
        { x: 0.14, y: 0.07 },
        { x: 0.05, y: 0.11 },
        { x: -0.02, y: 0.08 },
        { x: -0.07, y: 0.01 }
      ]
    },
    {
      name: 'left-shelf',
      color: COLORS.branchC,
      width: 0.011,
      start: 0.22,
      end: 0.56,
      points: [
        { x: -0.05, y: -0.19 },
        { x: -0.13, y: -0.12 },
        { x: -0.22, y: -0.10 },
        { x: -0.28, y: -0.04 },
        { x: -0.26, y: 0.05 },
        { x: -0.17, y: 0.09 },
        { x: -0.09, y: 0.16 },
        { x: -0.13, y: 0.26 },
        { x: -0.06, y: 0.36 },
        { x: 0.02, y: 0.44 }
      ]
    },
    {
      name: 'middle-shelf',
      color: COLORS.branchA,
      width: 0.011,
      start: 0.28,
      end: 0.66,
      points: [
        { x: -0.18, y: -0.02 },
        { x: -0.08, y: -0.05 },
        { x: 0.02, y: -0.02 },
        { x: 0.11, y: 0.03 },
        { x: 0.19, y: 0.02 },
        { x: 0.27, y: 0.09 },
        { x: 0.34, y: 0.18 },
        { x: 0.28, y: 0.29 }
      ]
    },
    {
      name: 'lower-shelf',
      color: COLORS.branchB,
      width: 0.011,
      start: 0.34,
      end: 0.72,
      points: [
        { x: -0.19, y: 0.14 },
        { x: -0.10, y: 0.18 },
        { x: 0.00, y: 0.18 },
        { x: 0.10, y: 0.23 },
        { x: 0.19, y: 0.23 },
        { x: 0.28, y: 0.28 },
        { x: 0.33, y: 0.39 }
      ]
    },
    {
      name: 'twig-1',
      color: COLORS.branchA,
      width: 0.007,
      start: 0.24,
      end: 0.40,
      points: [
        { x: -0.25, y: -0.17 },
        { x: -0.33, y: -0.16 },
        { x: -0.37, y: -0.10 }
      ]
    },
    {
      name: 'twig-2',
      color: COLORS.branchA,
      width: 0.007,
      start: 0.28,
      end: 0.46,
      points: [
        { x: -0.24, y: 0.08 },
        { x: -0.31, y: 0.10 },
        { x: -0.35, y: 0.16 }
      ]
    },
    {
      name: 'twig-3',
      color: COLORS.branchA,
      width: 0.007,
      start: 0.33,
      end: 0.50,
      points: [
        { x: -0.05, y: 0.18 },
        { x: -0.10, y: 0.26 },
        { x: -0.13, y: 0.33 }
      ]
    },
    {
      name: 'twig-4',
      color: COLORS.branchA,
      width: 0.007,
      start: 0.37,
      end: 0.55,
      points: [
        { x: 0.22, y: -0.18 },
        { x: 0.30, y: -0.14 },
        { x: 0.36, y: -0.07 }
      ]
    },
    {
      name: 'twig-5',
      color: COLORS.branchA,
      width: 0.007,
      start: 0.39,
      end: 0.57,
      points: [
        { x: 0.27, y: 0.06 },
        { x: 0.35, y: 0.10 },
        { x: 0.40, y: 0.17 }
      ]
    },
    {
      name: 'twig-6',
      color: COLORS.branchA,
      width: 0.007,
      start: 0.43,
      end: 0.62,
      points: [
        { x: 0.16, y: 0.33 },
        { x: 0.23, y: 0.39 },
        { x: 0.26, y: 0.47 }
      ]
    }
  ];

  const timings = {
    grow: 4200,
    rotate: 1800,
    brainHold: 900,
    erase: 2600,
    ecg: 2500
  };

  const cycleLength = Object.values(timings).reduce((a, b) => a + b, 0);

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function rotatePoint(p, angle) {
    const dx = p.x - pivot.x;
    const dy = p.y - pivot.y;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
      x: pivot.x + dx * cos - dy * sin,
      y: pivot.y + dx * sin + dy * cos
    };
  }

  let currentScale = 1;

  function screenPoint(p) {
    return {
      x: canvas.width / 2 + p.x * currentScale,
      y: canvas.height / 2 + p.y * currentScale
    };
  }

  function pathLength(points) {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      len += Math.hypot(
        points[i].x - points[i - 1].x,
        points[i].y - points[i - 1].y
      );
    }
    return len;
  }

  function partialPoints(points, progress) {
    if (progress <= 0) return [];
    if (progress >= 1) return points.slice();

    const target = pathLength(points) * progress;
    let walked = 0;
    const result = [points[0]];

    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);

      if (walked + seg <= target) {
        result.push(b);
        walked += seg;
      } else {
        const remain = target - walked;
        const t = seg === 0 ? 0 : remain / seg;
        result.push({
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t
        });
        break;
      }
    }

    return result;
  }

  function clipPolylineLeft(points, clipX) {
    if (points.length < 2) return points.slice();

    const out = [];

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const aIn = a.x <= clipX;
      const bIn = b.x <= clipX;

      if (aIn && out.length === 0) out.push(a);

      if (aIn && bIn) {
        out.push(b);
      } else if (aIn && !bIn) {
        const t = (clipX - a.x) / (b.x - a.x);
        out.push({
          x: clipX,
          y: a.y + (b.y - a.y) * t
        });
      } else if (!aIn && bIn) {
        const t = (clipX - a.x) / (b.x - a.x);
        out.push({
          x: clipX,
          y: a.y + (b.y - a.y) * t
        });
        out.push(b);
      }
    }

    return out;
  }

  function drawPolyline(points, color, width, alpha = 1) {
    if (!points || points.length < 2) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, width * currentScale);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const first = screenPoint(points[0]);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < points.length; i++) {
      const p = screenPoint(points[i]);
      ctx.lineTo(p.x, p.y);
    }

    ctx.stroke();
    ctx.restore();
  }

  function drawSeed(point, alpha = 1) {
    const p = screenPoint(point);
    const r = 0.024 * currentScale;

    ctx.save();
    ctx.globalAlpha = alpha;

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
    glow.addColorStop(0, 'rgba(255, 157, 82, 0.35)');
    glow.addColorStop(1, 'rgba(255, 157, 82, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 157, 82, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 1.55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = COLORS.seed;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawAxis() {
    ctx.save();
    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.12, canvas.height / 2);
    ctx.lineTo(canvas.width * 0.88, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, canvas.height * 0.10);
    ctx.lineTo(canvas.width / 2, canvas.height * 0.90);
    ctx.stroke();

    ctx.restore();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    currentScale = Math.min(canvas.width, canvas.height) * 0.46;
  }

  window.addEventListener('resize', resize);
  resize();

  function transformedPaths(angle, progressMode = null) {
    return paths.map(path => {
      let pts = path.points;

      if (progressMode !== null) {
        const local = clamp(
          (progressMode - path.start) / (path.end - path.start),
          0,
          1
        );
        pts = partialPoints(pts, easeOut(local));
      }

      return {
        ...path,
        points: pts.map(p => rotatePoint(p, angle))
      };
    });
  }

  function drawGrowing(t) {
    phaseLabel.textContent = 'Growing';
    drawAxis();

    const angle = 0;
    const items = transformedPaths(angle, t);
    drawSeed(rotatePoint(seed, angle));

    items.forEach(item => {
      drawPolyline(item.points, item.color, item.width);
    });
  }

  function drawRotating(t) {
    phaseLabel.textContent = 'Rotating';
    drawAxis();

    const angle = -Math.PI / 2 * easeInOut(t);
    const items = transformedPaths(angle);
    drawSeed(rotatePoint(seed, angle));

    items.forEach(item => {
      drawPolyline(item.points, item.color, item.width);
    });
  }

  function drawBrainHold() {
    phaseLabel.textContent = 'Brain';
    drawAxis();

    const angle = -Math.PI / 2;
    const items = transformedPaths(angle);
    drawSeed(rotatePoint(seed, angle), 0.55);

    items.forEach(item => {
      drawPolyline(item.points, item.color, item.width);
    });
  }

  function drawErasing(t) {
    phaseLabel.textContent = 'Erasing';
    drawAxis();

    const angle = -Math.PI / 2;
    const rotatedItems = transformedPaths(angle);
    const allPts = rotatedItems.flatMap(item => item.points);

    const minX = Math.min(...allPts.map(p => p.x));
    const maxX = Math.max(...allPts.map(p => p.x));
    const clipX = maxX - (maxX - minX) * easeInOut(t);

    rotatedItems.forEach(item => {
      const clipped = clipPolylineLeft(item.points, clipX);
      drawPolyline(clipped, item.color, item.width);
    });

    drawSeed(rotatePoint(seed, angle), 0.35);

    const lineStart = { x: clipX, y: pivot.y + 0.02 };
    const extend = clamp((t - 0.45) / 0.55, 0, 1);

    if (extend > 0) {
      const lineEnd = { x: clipX + 0.78 * extend, y: lineStart.y };
      drawPolyline([lineStart, lineEnd], COLORS.ecg, 0.014, 1);
    }
  }

  function drawECG(t) {
    phaseLabel.textContent = 'Pulse';
    drawAxis();

    const y = pivot.y + 0.02;
    const x0 = -0.42;
    const x1 = 0.42;
    const beatStart = -0.05;

    const line = [
      { x: x0, y: y },
      { x: beatStart - 0.08, y: y },
      { x: beatStart, y: y - 0.02 },
      { x: beatStart + 0.04, y: y + 0.18 },
      { x: beatStart + 0.08, y: y - 0.30 },
      { x: beatStart + 0.13, y: y + 0.22 },
      { x: beatStart + 0.19, y: y },
      { x: x1, y: y }
    ];

    const reveal = clamp(t / 0.55, 0, 1);
    drawPolyline(partialPoints(line, reveal), COLORS.ecg, 0.014);

    if (t > 0.55) {
      const heartT = (t - 0.55) / 0.45;
      const hx = 0.23;
      const hy = y - 0.01;
      const s = 0.11 * Math.min(1, easeOut(heartT));
      const glowAlpha = 0.4 * Math.sin(Math.min(1, heartT) * Math.PI);

      ctx.save();
      ctx.strokeStyle = '#ff7ab8';
      ctx.lineWidth = Math.max(2, 0.012 * currentScale);
      ctx.shadowColor = `rgba(255, 122, 184, ${glowAlpha})`;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(a), 3);
        const yv = -(
          13 * Math.cos(a) -
          5 * Math.cos(2 * a) -
          2 * Math.cos(3 * a) -
          Math.cos(4 * a)
        );

        const p = screenPoint({
          x: hx + (x / 32) * s,
          y: hy + (yv / 32) * s
        });

        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }

      ctx.stroke();
      ctx.restore();
    }
  }

  function loop(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = now % cycleLength;

    if (time < timings.grow) {
      drawGrowing(time / timings.grow);
    } else if (time < timings.grow + timings.rotate) {
      drawRotating((time - timings.grow) / timings.rotate);
    } else if (time < timings.grow + timings.rotate + timings.brainHold) {
      drawBrainHold();
    } else if (
      time <
      timings.grow + timings.rotate + timings.brainHold + timings.erase
    ) {
      drawErasing(
        (time - timings.grow - timings.rotate - timings.brainHold) /
          timings.erase
      );
    } else {
      drawECG(
        (time -
          timings.grow -
          timings.rotate -
          timings.brainHold -
          timings.erase) /
          timings.ecg
      );
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
