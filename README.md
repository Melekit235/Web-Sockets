# Authentication and File Management System with WebSockets

## Overview

This project is a web-based authentication and file management system designed for users to securely register, log in, and manage their files. Built with **Node.js** and **Express** for the backend, and **vanilla JavaScript** for the frontend, it supports real-time updates using **WebSockets**. Users can upload, download, and delete files, while file events are communicated to all connected clients via WebSockets. **JWT (JSON Web Tokens)** is used for secure authentication.

### Key Features

- **User Authentication**:
  - Secure registration and login with JWT-based session management.
  - Logout functionality with session token invalidation.

- **File Management**:
  - Users can upload, download, and delete files.
  - Real-time notifications for file upload and deletion using WebSockets.
  - File management actions are secured with authentication.

- **Real-Time Communication**:
  - Integrated WebSocket server to broadcast file events to all connected clients.

## Technologies Used

- **Frontend**: 
  - HTML
  - CSS
  - Vanilla JavaScript

- **Backend**: 
  - Node.js
  - Express.js
  - Multer (for file uploads)
  - JSON Web Tokens (JWT) for authentication
  - WebSockets for real-time communication
