class StateManager {
  constructor() {
    this.strokes = [];
    this.redoStack = [];
    this.users = new Map();
  }

  addUser(id, name) {
    this.users.set(id, name);
  }

  removeUser(id) {
    this.users.delete(id);
  }

  getUserCount() {
    return this.users.size;
  }

  addStroke(stroke) {
    this.strokes.push(stroke);
    this.redoStack = [];
  }

  undo() {
    if (!this.strokes.length) return null;
    const s = this.strokes.pop();
    this.redoStack.push(s);
    return s;
  }

  redo() {
    if (!this.redoStack.length) return null;
    const s = this.redoStack.pop();
    this.strokes.push(s);
    return s;
  }

  getStrokes() {
    return [...this.strokes];
  }
}

module.exports = StateManager;
