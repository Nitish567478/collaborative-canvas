class StateManager {
  constructor() {
    this.strokes = [];
    this.undoStack = [];
    this.redoStack = [];
    this.users = new Map();
  }

  /* ===== USERS ===== */

  addUser(id, name) {
    this.users.set(id, {
      name
    });
  }

  removeUser(id) {
    this.users.delete(id);
  }

  getUserCount() {
    return this.users.size;
  }

  /* ===== STROKES ===== */

  addStroke(stroke) {
    this.strokes.push(stroke);
    this.undoStack.push(stroke);
    this.redoStack = [];
  }

  undo() {
    if (!this.undoStack.length) return null;

    const stroke = this.undoStack.pop();
    this.strokes = this.strokes.filter(s => s.id !== stroke.id);
    this.redoStack.push(stroke);
    return stroke;
  }

  redo() {
    if (!this.redoStack.length) return null;

    const stroke = this.redoStack.pop();
    this.strokes.push(stroke);
    this.undoStack.push(stroke);
    return stroke;
  }

  getStrokes() {
    return [...this.strokes];
  }
}

module.exports = StateManager;
