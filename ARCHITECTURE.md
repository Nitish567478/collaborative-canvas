Real-Time Collaborative Canvas – Architecture
Overview

This application allows multiple users to draw, add shapes, text, and images simultaneously on a shared canvas using room-based isolation.
Users in the same room always see the same canvas state in real time.

Core Design

Canvas is a renderer only

Server owns the authoritative stroke history

WebSockets handle real-time synchronization

Clients replay server-approved state deterministically

Data Flow
High-Level Data Flow Diagram
┌─────────────┐
│   User A    │
│  (Canvas)   │
└──────┬──────┘
       │  Draw / Shape / Text / Image
       ▼
┌─────────────┐
│ Local Render│
│ (Preview)   │
└──────┬──────┘
       │  STROKE_COMMIT
       ▼
┌─────────────────────────┐
│   Node.js + Socket.IO   │
│   Room State Manager   │
└──────┬───────────┬─────┘
       │           │
       │ Broadcast │
       │           │
       ▼           ▼
┌─────────────┐  ┌─────────────┐
│   User B    │  │   User C    │
│  (Canvas)   │  │  (Canvas)   │
└─────────────┘  └─────────────┘


Detailed Flow

User draws
→ local preview render
→ stroke commit
→ server stores stroke
→ server broadcasts
→ clients redraw canvas

On join or reload, the server sends the full stroke history and clients replay it.

Undo / Redo

Global per room

Server maintains strokes and redoStack

Undo removes the last stroke

Redo restores the removed stroke

Clients never guess state; they replay server decisions

Room Management

Each room has isolated state

Users in different rooms never share data

Rooms are created on first join

Empty rooms are auto-destroyed

Reload keeps room state, leave resets session

Tools and Features

Freehand brush and eraser

Shapes: rectangle, square, circle, line, triangle

Text tool with inline canvas input

Image upload and placement (fixed size 50×60)

All tools are treated as strokes and support undo/redo

Performance

Incremental drawing during pointer movement

Full redraw only on join, undo, redo, or shape preview

Vector data only (no pixels sent)

Canvas scaled using devicePixelRatio for sharp rendering

Conflict Handling

Multiple users can draw simultaneously

No locking mechanism required

Stroke order defines final visual result

Last committed stroke appears on top

Scaling

Room-based isolation

Redis adapter can be used for horizontal scaling

Persistent storage can be added without client changes