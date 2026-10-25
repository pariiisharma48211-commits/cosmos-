const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game States
let score = 0;
let gameOver = false;
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

// Astronaut Object
const astronaut = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 70,
    width: 50,
    height: 60,
    speed: 8,
    dx: 0
};

// Falling Objects Array
let spaceObjects = [];

// Handle Keyboard Inputs
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "d") astronaut.dx = astronaut.speed;
    if (e.key === "ArrowLeft" || e.key === "a") astronaut.dx = -astronaut.speed;
});

document.addEventListener("keyup", (e) => {
    if (["ArrowRight", "d", "ArrowLeft", "a"].includes(e.key)) astronaut.dx = 0;
});

// Function to Spawn Meteors and Moons
function spawnObject() {
    if (gameOver) return;

    const types = ["yellowMeteor", "redMeteor", "moon"];
    // Logic: Yellow meteors are common, moons are rarer
    const chance = Math.random();
    let type = "yellowMeteor";
    
    if (chance > 0.6 && chance <= 0.85) type = "redMeteor";
    else if (chance > 0.85) type = "moon";

    const size = type === "moon" ? 40 : 20; // Moons are bigger
    const speed = Math.random() * 3 + 2;   // Varying fall speeds

    spaceObjects.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        type: type,
        speed: speed
    });

    // Keep spawning continuously
    setTimeout(spawnObject, Math.random() * 1000 + 500);
}

// Check Collision between Astronaut and Object
function checkCollision(rect, circle) {
    // Treat falling objects as circles for smoother gameplay mapping
    let closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    let closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    let distanceX = circle.x - closestX;
    let distanceY = circle.y - closestY;
    let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

    return distanceSquared < (circle.size * circle.size);
}

// Game Update Loop
function update() {
    if (gameOver) return;

    // Move Astronaut and keep inside canvas bounds
    astronaut.x += astronaut.dx;
    if (astronaut.x < 0) astronaut.x = 0;
    if (astronaut.x + astronaut.width > canvas.width) astronaut.x = canvas.width - astronaut.width;

    // Update Falling Objects
    for (let i = spaceObjects.length - 1; i >= 0; i--) {
        let obj = spaceObjects[i];
        obj.y += obj.speed;

        // Collision Check
        if (checkCollision(astronaut, { x: obj.x + obj.size/2, y: obj.y + obj.size/2, size: obj.size/2 })) {
            if (obj.type === "yellowMeteor") {
                score += 10;
            } else if (obj.type === "redMeteor") {
                score = Math.max(0, score - 5); // Avoid negative points
            } else if (obj.type === "moon") {
                gameOver = true;
                statusEl.textContent = "BROKEN DOWN (Game Over)";
                statusEl.style.color = "#ff4d4d";
            }
            scoreEl.textContent = score;
            spaceObjects.splice(i, 1);
            continue;
        }

        // Remove objects that fall past the screen
        if (obj.y > canvas.height) {
            spaceObjects.splice(i, 1);
        }
    }
}

// Game Render Loop
function draw() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Astronaut (Simple Visual Representation)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(astronaut.x, astronaut.y, astronaut.width, astronaut.height);
    // Helmet window
    ctx.fillStyle = "#33ccff";
    ctx.fillRect(astronaut.x + 10, astronaut.y + 10, astronaut.width - 20, 15);

    // Draw Space Objects
    spaceObjects.forEach(obj => {
        ctx.beginPath();
        ctx.arc(obj.x + obj.size/2, obj.y + obj.size/2, obj.size/2, 0, Math.PI * 2);
        
        if (obj.type === "yellowMeteor") ctx.fillStyle = "#ffff33";
        else if (obj.type === "redMeteor") ctx.fillStyle = "#ff3333";
        else if (obj.type === "moon") ctx.fillStyle = "#a6a6a6";
        
        ctx.fill();
        ctx.closePath();
    });

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "40px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("CRITICAL COLLISION", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Courier New";
        ctx.fillText("Refresh the page to deploy again.", canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Master Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start Game Execution
spawnObject();
gameLoop();
