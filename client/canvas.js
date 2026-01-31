const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let currentStroke = null;
let startPoint = null;
let textInput = null;
let pendingImage = null;

const imageInput = document.getElementById("imageInput");

/* ===== SAFETY CHECK ===== */
if (!imageInput) {
  console.error("imageInput not found in DOM");
}

/* ===== RESIZE ===== */
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
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

/* ================= IMAGE UPLOAD ================= */

imageInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = reader.result;
  };
  reader.readAsDataURL(file);
};

/* ================= DRAW ================= */

function drawStroke(stroke) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.width;
  ctx.strokeStyle = stroke.color || "#000";

  ctx.globalCompositeOperation =
    stroke.tool === "eraser" ? "destination-out" : "source-over";

  if (stroke.tool === "rect") {
    const [a, b] = stroke.points;
    ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
    return;
  }

  if (stroke.tool === "circle") {
    const [a, b] = stroke.points;
    const r = Math.hypot(b.x - a.x, b.y - a.y);
    ctx.beginPath();
    ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  if (stroke.tool === "line") {
    const [a, b] = stroke.points;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    return;
  }

  if (stroke.tool === "triangle") {
    const [a, b] = stroke.points;
    ctx.beginPath();
    ctx.moveTo(a.x, b.y);
    ctx.lineTo((a.x + b.x) / 2, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.closePath();
    ctx.stroke();
    return;
  }

  if (stroke.tool === "text") {
    ctx.fillStyle = stroke.color;
    ctx.font = `${stroke.width * 4}px sans-serif`;
    ctx.fillText(stroke.text, stroke.points[0].x, stroke.points[0].y);
    return;
  }

  if (stroke.tool === "image") {
    const img = new Image();
    img.src = stroke.img;
    img.onload = () => {
      ctx.drawImage(
        img,
        stroke.points[0].x,
        stroke.points[0].y,
        130,
        150
      );
    };
    return;
  }

  ctx.beginPath();
  stroke.points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

function redraw(strokes = []) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(drawStroke);
}

/* ================= POINTER EVENTS ================= */

canvas.addEventListener("pointerdown", e => {
  if (!window.currentRoom || !window.currentUserName) {
    alert("Please enter Name and Room ID first");
    return;
  }

  const p = getPoint(e);

  /* ===== TEXT TOOL ===== */
  if (window.currentTool === "text") {
    if (textInput) textInput.remove();

    textInput = document.createElement("input");
    textInput.style.position = "absolute";
    textInput.style.left = `${p.x}px`;
    textInput.style.top = `${p.y}px`;
    textInput.style.fontSize = `${window.strokeWidth * 4}px`;

    document.body.appendChild(textInput);
    textInput.focus();

    textInput.onkeydown = ev => {
      if (ev.key === "Enter") {
        sendStroke({
          id: crypto.randomUUID(),
          user: window.currentUserName,
          tool: "text",
          color: window.currentColor,
          width: window.strokeWidth,
          text: textInput.value,
          points: [p]
        });
        textInput.remove();
        textInput = null;
        window.currentTool = "brush";
      }
    };
    return;
  }

  /* ===== IMAGE TOOL ===== */
  if (window.currentTool === "image") {
    if (!pendingImage) {
      alert("Please select an image first");
      return;
    }

    sendStroke({
      id: crypto.randomUUID(),
      user: window.currentUserName,
      tool: "image",            
      img: pendingImage,
      width: 1,
      points: [p]
    });

    pendingImage = null;
    imageInput.value = "";
    window.currentTool = "brush";
    return;
  }


  drawing = true;
  startPoint = p;

  currentStroke = {
    id: crypto.randomUUID(),
    user: window.currentUserName,
    color: window.currentColor,
    width: window.strokeWidth,
    tool: window.currentTool || "brush",
    points: [p]
  };
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const p = getPoint(e);

  if (["rect", "circle", "line", "triangle"].includes(currentStroke.tool)) {
    redraw(window.allStrokes || []);
    drawStroke({
      ...currentStroke,
      points: [startPoint, p]
    });
    return;
  }

  currentStroke.points.push(p);
  drawStroke({
    ...currentStroke,
    points: currentStroke.points.slice(-2)
  });
});

canvas.addEventListener("pointerup", e => {
  if (!drawing) return;
  drawing = false;

  if (["rect", "circle", "line", "triangle"].includes(currentStroke.tool)) {
    currentStroke.points.push(getPoint(e));
    sendStroke(currentStroke);
    window.currentTool = "brush";
    return;
  }

  sendStroke(currentStroke);
});
