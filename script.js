const scenes = [
    document.getElementById("scene-root"),
    document.getElementById("scene-brain"),
    document.getElementById("scene-ecg"),
    document.getElementById("scene-rebirth")
];

let currentScene = 0;
const sceneDuration = 5200;

function resetScene(scene) {
    scene.classList.remove("active");
    scene.classList.remove("animate");

    const animatedPaths = scene.querySelectorAll(".draw-on");
    animatedPaths.forEach((el) => {
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
    });

    const extraAnimated = scene.querySelectorAll(".pulse-dot, .final-point, .final-point-ring");
    extraAnimated.forEach((el) => {
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
    });
}

function showScene(index) {
    scenes.forEach((scene, i) => {
        if (i !== index) {
            resetScene(scene);
        }
    });

    const scene = scenes[index];
    scene.classList.add("active");

    requestAnimationFrame(() => {
        scene.classList.add("animate");
    });
}

function nextScene() {
    resetScene(scenes[currentScene]);
    currentScene = (currentScene + 1) % scenes.length;
    showScene(currentScene);
}

showScene(currentScene);
setInterval(nextScene, sceneDuration);
