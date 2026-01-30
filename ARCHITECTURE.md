# Real-Time Collaborative Canvas – Architecture

## Overview
This application allows multiple users to draw simultaneously on a shared canvas using room-based isolation.

## Core Design
- Canvas is a renderer only
- Server owns the authoritative stroke history
- WebSockets handle real-time sync

## Data Flow
User draws → local render → stroke commit → server → broadcast → clients redraw

## Undo / Redo
- Global per-room
- Server removes or restores strokes
- Clients replay strokes deterministically

## Room Management
- Each room has isolated state
- Users in different rooms never share data
- Empty rooms are auto-destroyed

## Performance
- Incremental drawing during pointer move
- Full redraw only on undo/redo/join
- Vector data only (no pixels sent)

## Scaling
- Room-based isolation
- Redis adapter can be used for horizontal scaling
