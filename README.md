# ELITES ARENA 🎮

**Elites Arena** is a premium, high-performance e-sports tournament platform built on the MERN stack. It features a cinematic, cyberpunk-inspired design with a dual-interface system for both players and administrators.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v16+ recommended.
- **MongoDB**: Access to a MongoDB database (Atlas or Local).

### 2. Installation
Clone the repository and install dependencies in both the root and client folders:

```bash
# Install Server Dependencies
npm install

# Install Client Dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Running the Project
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

---

## 🔐 How to Access

- **Frontend URL**: [http://localhost:5173](http://localhost:5173) (Default Vite port)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### User Roles & Navigation

#### 1. Player Dashboard
- **Access**: Sign up at the Register page or Login.
- **Features**:
  - **Identity Vault**: Customize your avatar (18+ tactical options), banner, and frame.
  - **Tactical Vault**: Track your combat merits and achievements.
  - **Tournaments**: Reserve slots for upcoming e-sports events.
  - **Support Center**: Direct encrypted communication link with the Overseers (Admins).

#### 2. Admin Panel
- **Access**: Login with an account that has the `ADMIN` role.
- **Features**:
  - **Operative Registry**: Manage and monitor all registered players.
  - **Tournament Orchestration**: Create and deploy new tournament protocols.
  - **Support Terminal**: Manage all active support conversations and transmit responses.
  - **System Analytics**: Real-time stats on operative enrollment and engagement.

---

## 🛡️ Key Features
- **Cinematic UI**: Cyber-industrial design with scanline overlays and neon accents.
- **Role-Based Access Control**: Secure separation between players and administrative staff.
- **Dynamic Avatars**: Fully synchronized profile system with automatic fallback handling.
- **Support Ecosystem**: Bidirectional support terminal for real-time player assistance.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, TailwindCSS, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose).
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt password hashing.

---

*Developed for the Elite Gaming Community.*
