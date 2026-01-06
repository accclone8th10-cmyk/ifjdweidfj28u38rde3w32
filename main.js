const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- TÀI NGUYÊN ---
const mapImg = new Image(); mapImg.src = 'map.png';
const mobImg = new Image(); mobImg.src = 'mob.png';

const realms = [
    { name: "Luyện Khí", need: 100, absorb: 1.5, color: "#4facfe", atk: 30 },
    { name: "Trúc Cơ", need: 800, absorb: 4.5, color: "#00ff88", atk: 80 },
    { name: "Kim Đan", need: 5000, absorb: 12.0, color: "#f6d365", atk: 200 }
];

let player = {
    x: 1000, y: 1000, 
    speed: 300, size: 40,
    linhKhi: 0, realm: 0, 
    hp: 100, maxHp: 100,
    mode: "BE_QUAN" // Khởi đầu là Bế Quan
};

let mobs = [];
let bullets = [];
const keys = {};
const WORLD_SIZE = 2000;

// --- ĐIỀU KHIỂN ---
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Nhấn Space để đột phá
window.addEventListener("keypress", e => {
    if (e.code === "Space") {
        let r = realms[player.realm];
        if (player.linhKhi >= r.need) {
            player.linhKhi = 0;
            player.realm = Math.min(player.realm + 1, realms.length - 1);
            player.maxHp += 300; player.hp = player.maxHp;
            canvas.style.filter = "brightness(2)";
            setTimeout(() => canvas.style.filter = "none", 200);
        }
    }
});

// Chuyển chế độ (1 nút duy nhất)
function toggleMode() {
    const btn = document.getElementById("btn-toggle-mode");
    if (player.mode === "BE_QUAN") {
        player.mode = "HANH_TAU";
        btn.innerText = "BẾ QUAN";
        spawnMobs(25);
    } else {
        player.mode = "BE_QUAN";
        btn.innerText = "HÀNH TẨU";
        mobs = [];
        player.x = canvas.width/2; player.y = canvas.height/2;
    }
}

function spawnMobs(n) {
    mobs = [];
    for(let i=0; i<n; i++) {
        mobs.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            hp: 100, maxHp: 100, speed: 120
        });
    }
}

// Bắn đạn
canvas.addEventListener("mousedown", e => {
    if (player.mode !== "HANH_TAU") return;
    const camX = player.x - canvas.width/2;
    const camY = player.y - canvas.height/2;
    const angle = Math.atan2(e.clientY + camY - player.y, e.clientX + camX - player.x);
    bullets.push({
        x: player.x, y: player.y,
        vx: Math.cos(angle) * 15, vy: Math.sin(angle) * 15,
        life: 100, color: realms[player.realm].color
    });
});

// --- VÒNG LẶP CHÍNH ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const r = realms[player.realm];

    // 1. Cập nhật Linh khí
    let gain = r.absorb * (player.mode === "BE_QUAN" ? 15 : 1);
    player.linhKhi += gain / 60;
    
    // 2. Cập nhật UI
    document.getElementById("display-realm").innerText = r.name;
    document.getElementById("hp-text").innerText = `${Math.floor(player.hp)}/${player.maxHp}`;
    document.getElementById("progress-bar").style.width = Math.min(100, (player.linhKhi/r.need)*100) + "%";
    document.getElementById("hp-bar").style.width = (player.hp/player.maxHp)*100 + "%";
    document.getElementById("speed-tag").innerText = `+${gain.toFixed(1)}/s`;

    if (player.mode === "HANH_TAU") {
        // DI CHUYỂN
        if (keys['w']) player.y -= player.speed / 60;
        if (keys['s']) player.y += player.speed / 60;
        if (keys['a']) player.x -= player.speed / 60;
        if (keys['d']) player.x += player.speed / 60;

        // VẼ CAMERA
        ctx.save();
        ctx.translate(-player.x + canvas.width/2, -player.y + canvas.height/2);

        // Nền map
        if (mapImg.complete) ctx.drawImage(mapImg, 0, 0, WORLD_SIZE, WORLD_SIZE);
        else { ctx.fillStyle = "#111"; ctx.fillRect(0,0,WORLD_SIZE,WORLD_SIZE); }

        // Quái đuổi & Vẽ quái
        mobs.forEach((m, mi) => {
            let dx = player.x - m.x; let dy = player.y - m.y;
            let dist = Math.hypot(dx, dy);
            m.x += (dx/dist) * (m.speed/60); m.y += (dy/dist) * (m.speed/60);

            if (mobImg.complete) ctx.drawImage(mobImg, m.x-25, m.y-25, 50, 50);
            else { ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(m.x, m.y, 25, 0, Math.PI*2); ctx.fill(); }
            
            if (dist < 40) player.hp -= 0.1; // Quái gây sát thương
        });

        // Vẽ đạn & Xử lý va chạm
        bullets.forEach((b, bi) => {
            b.x += b.vx; b.y += b.vy; b.life--;
            ctx.strokeStyle = b.color; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx*2, b.y - b.vy*2); ctx.stroke();

            mobs.forEach((m, mi) => {
                if (Math.hypot(b.x - m.x, b.y - m.y) < 30) {
                    m.hp -= r.atk; bullets.splice(bi, 1);
                    if (m.hp <= 0) { mobs.splice(mi, 1); player.linhKhi += 50; }
                }
            });
            if (b.life <= 0) bullets.splice(bi, 1);
        });

        // Nhân vật
        ctx.fillStyle = "white"; ctx.fillRect(player.x-20, player.y-20, 40, 40);
        ctx.restore();

    } else {
        // CHẾ ĐỘ BẾ QUAN
        ctx.fillStyle = "#02050a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = r.color; ctx.lineWidth = 5;
        ctx.beginPath(); 
        ctx.arc(canvas.width/2, canvas.height/2, 120 + Math.sin(Date.now()/200)*10, 0, Math.PI*2); 
        ctx.stroke();
        ctx.fillStyle = "white"; ctx.fillRect(canvas.width/2-20, canvas.height/2-20, 40, 40);
    }

    requestAnimationFrame(gameLoop);
}

// Khởi chạy
window.addEventListener("resize", () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
gameLoop();
