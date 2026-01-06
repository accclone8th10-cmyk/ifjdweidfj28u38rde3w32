const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== DỮ LIỆU TU TIÊN =====
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 30,
  linhKhi: 0,
  level: 0
};

const levels = [
  { name: "Luyện Khí", need: 100 },
  { name: "Trúc Cơ", need: 300 },
  { name: "Kim Đan", need: 800 }
];

// ===== INPUT =====
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    tryBreakthrough();
  }
});

// ===== LOGIC =====
function update(dt) {
  player.linhKhi += dt * 20; // tu luyện tự động
}

function tryBreakthrough() {
  const current = levels[player.level];
  if (!current) return;

  if (player.linhKhi >= current.need) {
    player.linhKhi = 0;
    player.level++;
  }
}

// ===== VẼ =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // nhân vật
  ctx.fillStyle = "white";
  ctx.fillRect(
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size
  );

  // UI
  ctx.fillStyle = "lime";
  ctx.font = "20px sans-serif";

  const levelName = levels[player.level]
    ? levels[player.level].name
    : "Đại Năng";

  ctx.fillText(`Cảnh giới: ${levelName}`, 20, 40);
  ctx.fillText(`Linh khí: ${Math.floor(player.linhKhi)}`, 20, 70);
  ctx.fillText("Nhấn SPACE để đột phá", 20, 100);
}

// ===== GAME LOOP =====
let lastTime = 0;
function loop(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
