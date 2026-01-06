const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WORLD = { width: 2000, height: 2000, baseRate: 10 };
const LINH_CAN_MULT = 1.7; 
const realms = [
    { name: "Luyện Khí", need: 100, absorb: 1.0, color: "#4facfe" },
    { name: "Trúc Cơ", need: 500, absorb: 1.3, color: "#00ff88" },
    { name: "Kim Đan", need: 2000, absorb: 1.8, color: "#f6d365" }
];

const mapImg = new Image();
mapImg.src = 'map.png'; 

let player = {
    x: WORLD.width / 2, y: WORLD.height / 2,
    size: 36, speed: 250, linhKhi: 0, realm: 0,
    angle: 0, state: "idle"
};

const camera = { x: 0, y: 0 };
const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space") tryBreakthrough();
});
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("mousedown", () => {
    if (player.state !== "move") player.state = "cultivate";
});
canvas.addEventListener("mouseup", () => {
    if (player.state === "cultivate") player.state = "idle";
});

function update(dt) {
    let dx = 0, dy = 0;
    if (keys["w"]) dy--; if (keys["s"]) dy++;
    if (keys["a"]) dx--; if (keys["d"]) dx++;

    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        player.x = Math.max(0, Math.min(WORLD.width, player.x + (dx / len) * player.speed * dt));
        player.y = Math.max(0, Math.min(WORLD.height, player.y + (dy / len) * player.speed * dt));
        player.state = "move";
    } else if (player.state !== "cultivate") {
        player.state = "idle";
    }

    const realm = realms[player.realm] || realms[realms.length - 1];
    let gain = (player.state === "cultivate") ? 
               (WORLD.baseRate * LINH_CAN_MULT * realm.absorb * 2) : 
               (WORLD.baseRate * LINH_CAN_MULT * realm.absorb * 0.2);
    
    player.linhKhi += dt * gain;
    player.angle += dt * (player.state === "cultivate" ? 3 : 1);
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    updateUI(gain, realm);
}

function updateUI(gain, realm) {
    document.getElementById("level-display").innerText = `Cảnh giới: ${realm.name}`;
    document.getElementById("spirit-count").innerText = Math.floor(player.linhKhi);
    document.getElementById("speed-tag").innerText = `Linh tốc: +${gain.toFixed(1)}/s`;
    document.getElementById("progress").style.width = Math.min((player.linhKhi / realm.need) * 100, 100) + "%";
    
    const stateEl = document.getElementById("state-display");
    if (player.state === "move") stateEl.innerText = "Trạng thái: Hành tẩu";
    else if (player.state === "cultivate") stateEl.innerText = "Trạng thái: Tu luyện";
    else stateEl.innerText = "Trạng thái: Tĩnh tọa";
}

function tryBreakthrough() {
    const realm = realms[player.realm];
    if (realm && player.linhKhi >= realm.need) {
        player.linhKhi = 0;
        player.realm++;
        canvas.style.filter = "brightness(2)";
        setTimeout(() => canvas.style.filter = "brightness(1)", 150);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const realm = realms[player.realm] || realms[realms.length - 1];
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    if (mapImg.complete) ctx.drawImage(mapImg, 0, 0, WORLD.width, WORLD.height);
    else { ctx.fillStyle = "#1a2635"; ctx.fillRect(0, 0, WORLD.width, WORLD.height); }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.strokeStyle = realm.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(-player.size/2 - 5, -player.size/2 - 5, player.size + 10, player.size + 10);
    ctx.fillStyle = "white";
    ctx.fillRect(-player.size/2, -player.size/2, player.size, player.size);
    ctx.restore();
    ctx.restore();
}

function loop(time) {
    const dt = (time - (loop.last || time)) / 1000;
    loop.last = time;
    update(dt); draw();
    requestAnimationFrame(loop);
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
});
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
requestAnimationFrame(loop);
