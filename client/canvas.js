const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let currentStroke = null;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function drawStroke(stroke) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.width;

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color; // ← ALWAYS use stroke color
  }

  ctx.beginPath();
  stroke.points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

function redraw(strokes) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(drawStroke);
}

canvas.addEventListener("pointerdown", e => {
  if (!window.currentRoom || !window.currentUserName) {
    alert("Please enter Name and Room ID first");
    return;
  }

  drawing = true;

  // 🔥 ALWAYS read fresh values HERE
  currentStroke = {
    id: crypto.randomUUID(),
    user: window.currentUserName,
    color: window.currentColor,      // ← FIX
    width: window.strokeWidth,       // ← FIX
    tool: window.isEraser ? "eraser" : "brush",
    points: [getPoint(e)]
  };
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const p = getPoint(e);
  currentStroke.points.push(p);

  // Draw only the latest segment for performance
  drawStroke({
    ...currentStroke,
    points: currentStroke.points.slice(-2)
  });
});

canvas.addEventListener("pointerup", () => {
  if (!drawing) return;
  drawing = false;
  sendStroke(currentStroke); // send full stroke to server
});
