document.addEventListener("DOMContentLoaded", () => {

    /* ======================================================
       ELEMENTS
    ====================================================== */

    const canvas =
        document.getElementById("rootBrainCanvas");

    const statusElement =
        document.getElementById("animationStatus");


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    /* ======================================================
       COLORS
    ====================================================== */

    const COLORS = {

        orange:
            "#f48a4b",

        orangeSoft:
            "rgba(244, 138, 75, 0.50)",

        blue:
            "#58a6ff",

        lightBlue:
            "#8ecaff",

        paleBlue:
            "#b7ddff",

        purple:
            "#c184ff",

        pink:
            "#ff83ad",

        guide:
            "rgba(88, 166, 255, 0.035)"

    };


    /* ======================================================
       CANVAS
    ====================================================== */

    let width = 0;
    let height = 0;

    const DPR =
        window.devicePixelRatio || 1;


    function resizeCanvas() {

        const rect =
            canvas.getBoundingClientRect();


        width =
            rect.width;

        height =
            rect.height;


        canvas.width =
            Math.round(
                width * DPR
            );

        canvas.height =
            Math.round(
                height * DPR
            );


        ctx.setTransform(
            DPR,
            0,
            0,
            DPR,
            0,
            0
        );

    }


    resizeCanvas();


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* ======================================================
       GENERAL HELPERS
    ====================================================== */

    function clamp(
        value,
        min = 0,
        max = 1
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );

    }


    function lerp(
        a,
        b,
        t
    ) {

        return (
            a
            +
            (
                b - a
            )
            * t
        );

    }


    function easeInOutCubic(t) {

        t =
            clamp(t);


        if (t < 0.5) {

            return (
                4
                * t
                * t
                * t
            );

        }


        return (
            1
            -
            Math.pow(
                -2 * t + 2,
                3
            )
            / 2
        );

    }


    function easeOutCubic(t) {

        t =
            clamp(t);


        return (
            1
            -
            Math.pow(
                1 - t,
                3
            )
        );

    }


    function smoothstep(t) {

        t =
            clamp(t);


        return (
            t
            * t
            * (
                3
                -
                2 * t
            )
        );

    }


    function distance(
        a,
        b
    ) {

        return Math.hypot(
            b.x - a.x,
            b.y - a.y
        );

    }


    /* ======================================================
       ROTATION
    ====================================================== */

    function rotateNormalizedPoint(
        point,
        angle
    ) {

        const cos =
            Math.cos(angle);

        const sin =
            Math.sin(angle);


        return {

            x:
                point.x * cos
                -
                point.y * sin,

            y:
                point.x * sin
                +
                point.y * cos

        };

    }


    /* ======================================================
       STAGE
    ====================================================== */

    function getStage() {

        return {

            centerX:
                width * 0.5,

            centerY:
                height * 0.51,

            scale:
                Math.min(
                    width,
                    height
                )
                * 0.31

        };

    }


    function toScreen(
        normalizedPoint,
        angle = 0
    ) {

        const stage =
            getStage();


        const rotated =
            rotateNormalizedPoint(
                normalizedPoint,
                angle
            );


        return {

            x:
                stage.centerX
                +
                rotated.x
                * stage.scale,

            y:
                stage.centerY
                +
                rotated.y
                * stage.scale

        };

    }


    /* ======================================================
       BACKGROUND GUIDE
    ====================================================== */

    function drawGuides() {

        const stage =
            getStage();


        ctx.save();

        ctx.strokeStyle =
            COLORS.guide;

        ctx.lineWidth =
            1;


        ctx.beginPath();

        ctx.moveTo(
            stage.centerX,
            65
        );

        ctx.lineTo(
            stage.centerX,
            height - 65
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            65,
            stage.centerY
        );

        ctx.lineTo(
            width - 65,
            stage.centerY
        );

        ctx.stroke();


        ctx.restore();

    }


    /* ======================================================
       THE CORE IDEA

       IMPORTANT:

       These coordinates define the BRAIN orientation.

       The seed / origin is on the LEFT.

       When rotated +90 degrees:
       the left origin becomes the TOP.

       Therefore:

       SAME EXACT STRUCTURE
       brain orientation = 0 degrees
       root orientation  = +90 degrees

       NO MORPHING.
       NO REARRANGEMENT.
    ====================================================== */


    /* ======================================================
       BRANCHING NETWORK

       The longer branches form the silhouette.

       Smaller branches create:
       - root laterals vertically
       - brain folds horizontally

       Branches contain sharper directional changes
       instead of simple arcs.
    ====================================================== */

    const NETWORK = [

        /* ----------------------------------------------
           PRIMARY CENTRAL AXIS

           This eventually survives longest during erase
           and becomes the horizontal ECG baseline.
        ---------------------------------------------- */

        {
            id:
                "central",

            color:
                COLORS.paleBlue,

            width:
                4.2,

            growStart:
                0.00,

            growEnd:
                0.43,

            eraseOrder:
                1.00,

            preserve:
                true,

            points: [

                { x: -1.04, y: 0.00 },

                { x: -0.87, y: -0.02 },

                { x: -0.69, y: 0.03 },

                { x: -0.50, y: -0.02 },

                { x: -0.32, y: 0.04 },

                { x: -0.13, y: 0.00 },

                { x: 0.07, y: 0.05 },

                { x: 0.26, y: -0.02 },

                { x: 0.44, y: 0.02 },

                { x: 0.62, y: -0.04 },

                { x: 0.79, y: 0.00 },

                { x: 0.98, y: 0.02 }

            ]

        },


        /* ----------------------------------------------
           UPPER OUTER BRANCH

           In root orientation:
           long external root.

           In brain orientation:
           upper silhouette.
        ---------------------------------------------- */

        {
            id:
                "upper-outline",

            color:
                COLORS.lightBlue,

            width:
                3.6,

            growStart:
                0.07,

            growEnd:
                0.72,

            eraseOrder:
                0.12,

            points: [

                { x: -0.87, y: -0.02 },

                { x: -0.77, y: -0.22 },

                { x: -0.65, y: -0.38 },

                { x: -0.48, y: -0.50 },

                { x: -0.27, y: -0.58 },

                { x: -0.05, y: -0.61 },

                { x: 0.16, y: -0.57 },

                { x: 0.35, y: -0.48 },

                { x: 0.52, y: -0.36 },

                { x: 0.64, y: -0.20 },

                { x: 0.70, y: -0.06 }

            ]

        },


        /* ----------------------------------------------
           LOWER OUTER BRANCH
        ---------------------------------------------- */

        {
            id:
                "lower-outline",

            color:
                COLORS.blue,

            width:
                3.6,

            growStart:
                0.10,

            growEnd:
                0.78,

            eraseOrder:
                0.18,

            points: [

                { x: -0.82, y: 0.01 },

                { x: -0.74, y: 0.22 },

                { x: -0.61, y: 0.40 },

                { x: -0.42, y: 0.52 },

                { x: -0.19, y: 0.60 },

                { x: 0.04, y: 0.62 },

                { x: 0.27, y: 0.57 },

                { x: 0.47, y: 0.47 },

                { x: 0.62, y: 0.31 },

                { x: 0.71, y: 0.14 },

                { x: 0.75, y: 0.02 }

            ]

        },


        /* ----------------------------------------------
           UPPER INTERIOR LARGE BRANCH
        ---------------------------------------------- */

        {
            id:
                "upper-main",

            color:
                COLORS.purple,

            width:
                3.2,

            growStart:
                0.17,

            growEnd:
                0.58,

            eraseOrder:
                0.27,

            points: [

                { x: -0.69, y: 0.03 },

                { x: -0.61, y: -0.14 },

                { x: -0.50, y: -0.27 },

                { x: -0.34, y: -0.31 },

                { x: -0.18, y: -0.26 },

                { x: -0.07, y: -0.14 },

                { x: -0.03, y: -0.02 }

            ]

        },


        /* ----------------------------------------------
           UPPER FRONT FORK
        ---------------------------------------------- */

        {
            id:
                "upper-front-fork",

            color:
                COLORS.lightBlue,

            width:
                2.6,

            growStart:
                0.29,

            growEnd:
                0.55,

            eraseOrder:
                0.42,

            points: [

                { x: -0.50, y: -0.27 },

                { x: -0.53, y: -0.42 },

                { x: -0.44, y: -0.50 },

                { x: -0.32, y: -0.48 }

            ]

        },


        {
            id:
                "upper-front-fork-small",

            color:
                COLORS.lightBlue,

            width:
                2.3,

            growStart:
                0.40,

            growEnd:
                0.59,

            eraseOrder:
                0.50,

            points: [

                { x: -0.44, y: -0.50 },

                { x: -0.47, y: -0.58 },

                { x: -0.41, y: -0.66 }

            ]

        },


        /* ----------------------------------------------
           UPPER CENTRAL FORK
        ---------------------------------------------- */

        {
            id:
                "upper-middle",

            color:
                COLORS.paleBlue,

            width:
                2.7,

            growStart:
                0.33,

            growEnd:
                0.63,

            eraseOrder:
                0.34,

            points: [

                { x: -0.18, y: -0.26 },

                { x: -0.12, y: -0.42 },

                { x: -0.01, y: -0.48 },

                { x: 0.09, y: -0.43 }

            ]

        },


        {
            id:
                "upper-middle-fork",

            color:
                COLORS.blue,

            width:
                2.3,

            growStart:
                0.46,

            growEnd:
                0.66,

            eraseOrder:
                0.46,

            points: [

                { x: -0.01, y: -0.48 },

                { x: -0.03, y: -0.59 },

                { x: 0.06, y: -0.67 }

            ]

        },


        /* ----------------------------------------------
           UPPER REAR BRANCH
        ---------------------------------------------- */

        {
            id:
                "upper-rear",

            color:
                COLORS.lightBlue,

            width:
                2.7,

            growStart:
                0.40,

            growEnd:
                0.69,

            eraseOrder:
                0.06,

            points: [

                { x: 0.26, y: -0.02 },

                { x: 0.32, y: -0.18 },

                { x: 0.42, y: -0.28 },

                { x: 0.54, y: -0.29 }

            ]

        },


        {
            id:
                "upper-rear-fork",

            color:
                COLORS.purple,

            width:
                2.3,

            growStart:
                0.53,

            growEnd:
                0.73,

            eraseOrder:
                0.02,

            points: [

                { x: 0.42, y: -0.28 },

                { x: 0.47, y: -0.40 },

                { x: 0.58, y: -0.44 }

            ]

        },


        /* ----------------------------------------------
           LOWER INTERIOR LARGE BRANCH
        ---------------------------------------------- */

        {
            id:
                "lower-main",

            color:
                COLORS.lightBlue,

            width:
                3.1,

            growStart:
                0.20,

            growEnd:
                0.62,

            eraseOrder:
                0.30,

            points: [

                { x: -0.61, y: 0.02 },

                { x: -0.56, y: 0.18 },

                { x: -0.44, y: 0.29 },

                { x: -0.29, y: 0.31 },

                { x: -0.13, y: 0.25 },

                { x: 0.00, y: 0.13 },

                { x: 0.07, y: 0.05 }

            ]

        },


        /* ----------------------------------------------
           LOWER FRONT ROOT FORKS
        ---------------------------------------------- */

        {
            id:
                "lower-front",

            color:
                COLORS.blue,

            width:
                2.6,

            growStart:
                0.36,

            growEnd:
                0.63,

            eraseOrder:
                0.54,

            points: [

                { x: -0.44, y: 0.29 },

                { x: -0.48, y: 0.43 },

                { x: -0.41, y: 0.53 },

                { x: -0.30, y: 0.55 }

            ]

        },


        {
            id:
                "lower-front-fork",

            color:
                COLORS.lightBlue,

            width:
                2.2,

            growStart:
                0.47,

            growEnd:
                0.68,

            eraseOrder:
                0.59,

            points: [

                { x: -0.41, y: 0.53 },

                { x: -0.44, y: 0.63 },

                { x: -0.37, y: 0.70 }

            ]

        },


        /* ----------------------------------------------
           LOWER CENTRAL
        ---------------------------------------------- */

        {
            id:
                "lower-middle",

            color:
                COLORS.purple,

            width:
                2.7,

            growStart:
                0.38,

            growEnd:
                0.68,

            eraseOrder:
                0.38,

            points: [

                { x: -0.13, y: 0.25 },

                { x: -0.08, y: 0.40 },

                { x: 0.04, y: 0.48 },

                { x: 0.16, y: 0.43 }

            ]

        },


        {
            id:
                "lower-middle-fork",

            color:
                COLORS.blue,

            width:
                2.3,

            growStart:
                0.50,

            growEnd:
                0.72,

            eraseOrder:
                0.44,

            points: [

                { x: 0.04, y: 0.48 },

                { x: 0.02, y: 0.59 },

                { x: 0.10, y: 0.67 }

            ]

        },


        /* ----------------------------------------------
           LOWER REAR
        ---------------------------------------------- */

        {
            id:
                "lower-rear",

            color:
                COLORS.lightBlue,

            width:
                2.7,

            growStart:
                0.43,

            growEnd:
                0.72,

            eraseOrder:
                0.10,

            points: [

                { x: 0.44, y: 0.02 },

                { x: 0.48, y: 0.17 },

                { x: 0.58, y: 0.27 },

                { x: 0.68, y: 0.25 }

            ]

        },


        {
            id:
                "lower-rear-fork",

            color:
                COLORS.purple,

            width:
                2.2,

            growStart:
                0.56,

            growEnd:
                0.76,

            eraseOrder:
                0.04,

            points: [

                { x: 0.58, y: 0.27 },

                { x: 0.62, y: 0.39 },

                { x: 0.72, y: 0.43 }

            ]

        },


        /* ----------------------------------------------
           SHORT BRAIN / ROOT SIDE BRANCHES
        ---------------------------------------------- */

        {
            id:
                "tiny-upper-one",

            color:
                COLORS.lightBlue,

            width:
                2.0,

            growStart:
                0.50,

            growEnd:
                0.68,

            eraseOrder:
                0.24,

            points: [

                { x: 0.09, y: -0.43 },

                { x: 0.17, y: -0.51 },

                { x: 0.24, y: -0.49 }

            ]

        },


        {
            id:
                "tiny-upper-two",

            color:
                COLORS.blue,

            width:
                2.0,

            growStart:
                0.52,

            growEnd:
                0.70,

            eraseOrder:
                0.15,

            points: [

                { x: 0.54, y: -0.29 },

                { x: 0.62, y: -0.35 },

                { x: 0.69, y: -0.31 }

            ]

        },


        {
            id:
                "tiny-lower-one",

            color:
                COLORS.lightBlue,

            width:
                2.0,

            growStart:
                0.53,

            growEnd:
                0.72,

            eraseOrder:
                0.22,

            points: [

                { x: 0.16, y: 0.43 },

                { x: 0.24, y: 0.50 },

                { x: 0.32, y: 0.47 }

            ]

        },


        {
            id:
                "tiny-lower-two",

            color:
                COLORS.blue,

            width:
                2.0,

            growStart:
                0.58,

            growEnd:
                0.76,

            eraseOrder:
                0.08,

            points: [

                { x: 0.68, y: 0.25 },

                { x: 0.75, y: 0.31 },

                { x: 0.81, y: 0.27 }

            ]

        }

    ];


    /* ======================================================
       LINE DRAWING
    ====================================================== */

    function pathLength(points) {

        let length =
            0;


        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            length +=
                distance(
                    points[i - 1],
                    points[i]
                );

        }


        return length;

    }


    function drawPartialPath(
        normalizedPoints,
        {
            angle = 0,
            progress = 1,
            reverse = false,
            color = COLORS.lightBlue,
            lineWidth = 3,
            alpha = 1,
            glow = 0
        } = {}
    ) {

        progress =
            clamp(progress);


        if (
            progress <= 0
            ||
            normalizedPoints.length < 2
        ) {

            return;

        }


        const points =
            reverse
                ? [...normalizedPoints].reverse()
                : normalizedPoints;


        const total =
            pathLength(points);


        const target =
            total * progress;


        let travelled =
            0;


        ctx.save();


        ctx.globalAlpha =
            alpha;


        ctx.strokeStyle =
            color;


        ctx.lineWidth =
            lineWidth;


        ctx.lineCap =
            "round";


        ctx.lineJoin =
            "round";


        if (glow > 0) {

            ctx.shadowColor =
                color;

            ctx.shadowBlur =
                glow;

        }


        const first =
            toScreen(
                points[0],
                angle
            );


        ctx.beginPath();


        ctx.moveTo(
            first.x,
            first.y
        );


        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            const previous =
                points[i - 1];

            const current =
                points[i];


            const segmentLength =
                distance(
                    previous,
                    current
                );


            if (
                travelled
                +
                segmentLength
                <=
                target
            ) {

                const screen =
                    toScreen(
                        current,
                        angle
                    );


                ctx.lineTo(
                    screen.x,
                    screen.y
                );


                travelled +=
                    segmentLength;

            }

            else {

                const remaining =
                    target
                    -
                    travelled;


                const ratio =
                    segmentLength === 0
                        ? 0
                        : remaining
                        /
                        segmentLength;


                const partial = {

                    x:
                        lerp(
                            previous.x,
                            current.x,
                            ratio
                        ),

                    y:
                        lerp(
                            previous.y,
                            current.y,
                            ratio
                        )

                };


                const screen =
                    toScreen(
                        partial,
                        angle
                    );


                ctx.lineTo(
                    screen.x,
                    screen.y
                );


                break;

            }

        }


        ctx.stroke();


        ctx.restore();

    }


    /* ======================================================
       SEED
    ====================================================== */

    const SEED_POINT = {

        x:
            -1.04,

        y:
            0

    };


    function drawSeed(
        angle,
        alpha = 1
    ) {

        const position =
            toScreen(
                SEED_POINT,
                angle
            );


        const radius =
            13;


        ctx.save();


        ctx.globalAlpha =
            alpha;


        const gradient =
            ctx.createRadialGradient(
                position.x,
                position.y,
                0,
                position.x,
                position.y,
                42
            );


        gradient.addColorStop(
            0,
            "rgba(244, 138, 75, 0.48)"
        );


        gradient.addColorStop(
            1,
            "rgba(244, 138, 75, 0)"
        );


        ctx.fillStyle =
            gradient;


        ctx.beginPath();


        ctx.arc(
            position.x,
            position.y,
            42,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.fillStyle =
            COLORS.orange;


        ctx.beginPath();


        ctx.arc(
            position.x,
            position.y,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.strokeStyle =
            COLORS.orangeSoft;


        ctx.lineWidth =
            2;


        ctx.beginPath();


        ctx.arc(
            position.x,
            position.y,
            radius + 8,
            0,
            Math.PI * 2
        );


        ctx.stroke();


        ctx.restore();

    }


    /* ======================================================
       DRAW NETWORK
    ====================================================== */

    function drawGrowingNetwork(
        growth
    ) {

        /*
            +90 degrees turns the
            brain-left origin into
            the root-top origin.
        */

        const rootAngle =
            Math.PI / 2;


        drawSeed(
            rootAngle,
            1
        );


        NETWORK.forEach(
            branch => {

                const local =
                    clamp(
                        (
                            growth
                            -
                            branch.growStart
                        )
                        /
                        (
                            branch.growEnd
                            -
                            branch.growStart
                        )
                    );


                drawPartialPath(
                    branch.points,
                    {
                        angle:
                            rootAngle,

                        progress:
                            local,

                        color:
                            branch.color,

                        lineWidth:
                            branch.width,

                        alpha:
                            1
                    }
                );

            }
        );

    }


    function drawCompleteNetwork(
        angle,
        alpha = 1
    ) {

        NETWORK.forEach(
            branch => {

                drawPartialPath(
                    branch.points,
                    {
                        angle,
                        progress:
                            1,

                        color:
                            branch.color,

                        lineWidth:
                            branch.width,

                        alpha
                    }
                );

            }
        );

    }


    /* ======================================================
       ERASE BRAIN

       IMPORTANT:
       BRANCHES DO NOT MOVE.

       They are removed in place.

       Higher eraseOrder =
       survives longer.

       The central line survives
       until the end.
    ====================================================== */

    function drawErasingBrain(
        eraseProgress
    ) {

        NETWORK.forEach(
            branch => {

                if (
                    branch.preserve
                ) {

                    /*
                        Keep central horizontal
                        branch almost completely.
                    */

                    const centralErase =
                        clamp(
                            (
                                eraseProgress
                                -
                                0.78
                            )
                            /
                            0.22
                        );


                    drawPartialPath(
                        branch.points,
                        {
                            angle:
                                0,

                            progress:
                                1
                                -
                                centralErase
                                * 0.15,

                            color:
                                COLORS.paleBlue,

                            lineWidth:
                                4.2,

                            alpha:
                                1
                        }
                    );


                    return;

                }


                /*
                    Back first, front later.

                    eraseOrder determines
                    when branch starts vanishing.
                */

                const startErase =
                    branch.eraseOrder
                    * 0.72;


                const localErase =
                    clamp(
                        (
                            eraseProgress
                            -
                            startErase
                        )
                        /
                        0.28
                    );


                const visible =
                    1
                    -
                    smoothstep(
                        localErase
                    );


                if (
                    visible <= 0
                ) {

                    return;

                }


                /*
                    Erasing from the far endpoint
                    toward the branch origin.

                    This means line stays fixed.
                */

                drawPartialPath(
                    branch.points,
                    {
                        angle:
                            0,

                        progress:
                            visible,

                        color:
                            branch.color,

                        lineWidth:
                            branch.width,

                        alpha:
                            clamp(
                                visible
                                * 1.4
                            )
                    }
                );

            }
        );

    }


    /* ======================================================
       ECG
    ====================================================== */

    function getECGPoints() {

        const stage =
            getStage();


        const y =
            stage.centerY;


        const scale =
            stage.scale;


        return [

            {
                x:
                    stage.centerX
                    -
                    scale * 0.95,

                y
            },

            {
                x:
                    stage.centerX
                    -
                    scale * 0.55,

                y
            },

            {
                x:
                    stage.centerX
                    -
                    scale * 0.28,

                y
            },

            {
                x:
                    stage.centerX
                    -
                    scale * 0.12,

                y
            },

            {
                x:
                    stage.centerX
                    -
                    scale * 0.04,

                y:
                    y
                    -
                    scale * 0.13
            },

            {
                x:
                    stage.centerX
                    +
                    scale * 0.03,

                y:
                    y
                    +
                    scale * 0.20
            },

            {
                x:
                    stage.centerX
                    +
                    scale * 0.11,

                y:
                    y
                    -
                    scale * 0.35
            },

            {
                x:
                    stage.centerX
                    +
                    scale * 0.21,

                y:
                    y
                    +
                    scale * 0.23
            },

            {
                x:
                    stage.centerX
                    +
                    scale * 0.34,

                y
            },

            {
                x:
                    stage.centerX
                    +
                    scale * 0.60,

                y
            },

            {
                x:
                    stage.centerX
                    +
                    scale * 0.82,

                y
            }

        ];

    }


    function screenPathLength(
        points
    ) {

        let total =
            0;


        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            total +=
                distance(
                    points[i - 1],
                    points[i]
                );

        }


        return total;

    }


    function drawScreenPath(
        points,
        progress,
        color,
        lineWidth
    ) {

        if (
            progress <= 0
            ||
            points.length < 2
        ) {

            return;

        }


        const total =
            screenPathLength(
                points
            );


        const target =
            total
            *
            clamp(progress);


        let travelled =
            0;


        ctx.save();


        ctx.strokeStyle =
            color;


        ctx.lineWidth =
            lineWidth;


        ctx.lineCap =
            "round";


        ctx.lineJoin =
            "round";


        ctx.shadowColor =
            color;


        ctx.shadowBlur =
            8;


        ctx.beginPath();


        ctx.moveTo(
            points[0].x,
            points[0].y
        );


        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            const a =
                points[i - 1];

            const b =
                points[i];


            const segment =
                distance(
                    a,
                    b
                );


            if (
                travelled
                +
                segment
                <=
                target
            ) {

                ctx.lineTo(
                    b.x,
                    b.y
                );


                travelled +=
                    segment;

            }

            else {

                const remaining =
                    target
                    -
                    travelled;


                const ratio =
                    segment === 0
                        ? 0
                        : remaining
                        /
                        segment;


                ctx.lineTo(
                    lerp(
                        a.x,
                        b.x,
                        ratio
                    ),

                    lerp(
                        a.y,
                        b.y,
                        ratio
                    )
                );


                break;

            }

        }


        ctx.stroke();


        ctx.restore();

    }


    /* ======================================================
       HEART
    ====================================================== */

    function createHeartPoints(
        centerX,
        centerY,
        size
    ) {

        const points =
            [];


        const samples =
            100;


        for (
            let i = 0;
            i <= samples;
            i++
        ) {

            const t =
                (
                    i
                    /
                    samples
                )
                *
                Math.PI
                *
                2;


            const x =
                16
                *
                Math.pow(
                    Math.sin(t),
                    3
                );


            const y =
                -(
                    13
                    *
                    Math.cos(t)

                    -

                    5
                    *
                    Math.cos(
                        2 * t
                    )

                    -

                    2
                    *
                    Math.cos(
                        3 * t
                    )

                    -

                    Math.cos(
                        4 * t
                    )
                );


            points.push({

                x:
                    centerX
                    +
                    x
                    *
                    size
                    /
                    18,

                y:
                    centerY
                    +
                    y
                    *
                    size
                    /
                    18

            });

        }


        return points;

    }


    function drawECG(
        progress
    ) {

        const points =
            getECGPoints();


        const lineProgress =
            clamp(
                progress
                /
                0.68
            );


        drawScreenPath(
            points,
            lineProgress,
            COLORS.paleBlue,
            4.3
        );


        /*
            Heart appears midway
            through the signal.
        */

        if (
            progress > 0.53
        ) {

            const stage =
                getStage();


            const heartProgress =
                clamp(
                    (
                        progress
                        -
                        0.53
                    )
                    /
                    0.32
                );


            const heartCenterX =
                stage.centerX
                +
                stage.scale
                * 0.78;


            const heartCenterY =
                stage.centerY
                -
                3;


            const heart =
                createHeartPoints(
                    heartCenterX,
                    heartCenterY,
                    stage.scale
                    * 0.18
                );


            drawScreenPath(
                heart,
                heartProgress,
                COLORS.pink,
                3.8
            );


            if (
                heartProgress
                >=
                0.98
            ) {

                const beat =
                    (
                        Math.sin(
                            performance.now()
                            *
                            0.018
                        )
                        +
                        1
                    )
                    /
                    2;


                ctx.save();


                ctx.globalAlpha =
                    0.72
                    +
                    beat
                    *
                    0.28;


                ctx.shadowColor =
                    COLORS.pink;


                ctx.shadowBlur =
                    10
                    +
                    beat
                    *
                    12;


                drawScreenPath(
                    heart,
                    1,
                    COLORS.pink,
                    3.8
                );


                ctx.restore();

            }

        }

    }


    /* ======================================================
       RESET LINE → SEED

       The ECG line retreats toward
       the original left-side point.

       That point becomes the seed.

       Then next frame rotates it
       into the top root orientation.
    ====================================================== */

    function drawReset(
        progress
    ) {

        const stage =
            getStage();


        const y =
            stage.centerY;


        const startX =
            stage.centerX
            -
            stage.scale
            *
            1.04;


        const endX =
            lerp(
                stage.centerX
                +
                stage.scale
                *
                0.98,

                startX,

                easeInOutCubic(
                    progress
                )
            );


        ctx.save();


        ctx.strokeStyle =
            COLORS.paleBlue;


        ctx.lineWidth =
            4.2;


        ctx.lineCap =
            "round";


        ctx.beginPath();


        ctx.moveTo(
            startX,
            y
        );


        ctx.lineTo(
            endX,
            y
        );


        ctx.stroke();


        ctx.restore();


        /*
            Seed grows at the same
            left point.
        */

        const seedOpacity =
            clamp(
                (
                    progress
                    -
                    0.42
                )
                /
                0.58
            );


        const position = {

            x:
                startX,

            y

        };


        ctx.save();


        ctx.globalAlpha =
            seedOpacity;


        ctx.fillStyle =
            COLORS.orange;


        ctx.shadowColor =
            COLORS.orange;


        ctx.shadowBlur =
            18;


        ctx.beginPath();


        ctx.arc(
            position.x,
            position.y,
            12,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.restore();

    }


    /* ======================================================
       TIMELINE

       0.00 - 0.36
       Grow root downward

       0.36 - 0.44
       Hold complete root

       0.44 - 0.56
       Rotate exact same root 90°

       0.56 - 0.66
       Hold brain

       0.66 - 0.80
       Erase back → front
       no movement

       0.80 - 0.93
       ECG + heart

       0.93 - 1.00
       Flat line → seed
    ====================================================== */

    const LOOP_DURATION =
        20000;


    const startTime =
        performance.now();


    /* ======================================================
       MAIN LOOP
    ====================================================== */

    function animate(now) {

        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        drawGuides();


        const progress =
            (
                (
                    now
                    -
                    startTime
                )
                %
                LOOP_DURATION
            )
            /
            LOOP_DURATION;


        /*
            ROOT GROWTH
        */

        if (
            progress
            <
            0.36
        ) {

            statusElement.textContent =
                "GROWING";


            const t =
                easeOutCubic(
                    progress
                    /
                    0.36
                );


            drawGrowingNetwork(
                t
            );

        }


        /*
            ROOT HOLD
        */

        else if (
            progress
            <
            0.44
        ) {

            statusElement.textContent =
                "ROOT";


            drawGrowingNetwork(
                1
            );

        }


        /*
            ROTATE ONLY

            No branches change position
            relative to one another.
        */

        else if (
            progress
            <
            0.56
        ) {

            statusElement.textContent =
                "ROTATING";


            const t =
                easeInOutCubic(
                    (
                        progress
                        -
                        0.44
                    )
                    /
                    0.12
                );


            const angle =
                lerp(
                    Math.PI / 2,
                    0,
                    t
                );


            drawCompleteNetwork(
                angle,
                1
            );


            drawSeed(
                angle,
                1
                -
                t
                *
                0.88
            );

        }


        /*
            BRAIN HOLD
        */

        else if (
            progress
            <
            0.66
        ) {

            statusElement.textContent =
                "BRAIN";


            drawCompleteNetwork(
                0,
                1
            );

        }


        /*
            ERASE

            No movement.
        */

        else if (
            progress
            <
            0.80
        ) {

            statusElement.textContent =
                "ERASING";


            const t =
                easeInOutCubic(
                    (
                        progress
                        -
                        0.66
                    )
                    /
                    0.14
                );


            drawErasingBrain(
                t
            );

        }


        /*
            ECG
        */

        else if (
            progress
            <
            0.93
        ) {

            statusElement.textContent =
                "PULSE";


            const t =
                easeOutCubic(
                    (
                        progress
                        -
                        0.80
                    )
                    /
                    0.13
                );


            drawECG(
                t
            );

        }


        /*
            RESET
        */

        else {

            statusElement.textContent =
                "RENEW";


            const t =
                easeInOutCubic(
                    (
                        progress
                        -
                        0.93
                    )
                    /
                    0.07
                );


            drawReset(
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

});
