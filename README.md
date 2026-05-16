# U-I-IceBreaker 🧊🚀

**U-I-IceBreaker** is a real-time, interactive team-building game platform designed to break the ice through fun, creative challenges. Whether it's photo submissions, pitches, or performances, U-I-IceBreaker brings people together with live updates, team scoring, and a competitive leaderboard.

---

## 🏗️ Architecture & Tech Stack

The project follows a modern decoupled architecture with a centralized Django backend and two specialized React frontends.

### 🔌 Backend (The Engine)
- **Framework:** [Django](https://www.djangoproject.com/) & [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
- **Real-time:** [Django Channels](https://channels.readthedocs.io/) (WebSockets) for instant state synchronization.
- **Task/Message Layer:** [Redis](https://redis.io/) (via `channels_redis`).
- **Storage:** [Cloudinary](https://cloudinary.com/) for hosting participant photo submissions.
- **Database:** PostgreSQL (production-ready).
- **Environment:** Python 3.11+.

### 💻 Frontends (The Experience)
- **Framework:** [React](https://reactjs.org/) (Vite-powered for speed).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Participant: v3, Admin: v4).
- **Communication:** Axios for APIs and native WebSockets for game state.
- **State Management:** Custom React hooks (`useGameState`, `useRoomSocket`) for synchronized real-time logic.

---

## 📂 Project Structure

```text
U-I-IceBreaker/
├── admin-frontend/           # Admin Dashboard (Control Room)
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── components/      # Admin Lobby & Game Controls
│   │   ├── hooks/           # Real-time sync hooks
│   │   └── data/            # Challenge templates
├── participant-frontend/     # Player Application
│   ├── src/
│   │   ├── components/      # UI components (Pixel art style)
│   │   ├── pages/           # Join & Lobby pages
│   │   └── services/        # API & Storage services
├── challenges/               # Django App: Logic for challenges & submissions
├── config/                   # Django Project: Settings, ASGI/WSGI config
├── players/                  # Django App: Player profile management
├── rooms/                    # Django App: Room life-cycle & WebSocket consumers
├── teams/                    # Django App: Team generation & scoring
├── manage.py                 # Django entry point
├── Dockerfile                # Production containerization
└── requirements.txt          # Python dependencies
```

---

## 🎮 Game Logic & Flow

### 1. Room Creation
An admin creates a room via the `admin-frontend`. A unique 6-character **Room Code** is generated (e.g., `AB12CD`).

### 2. Joining & Team Generation
Participants join using the code. Once enough players join, the Admin can **Generate Teams**. Players are randomly assigned to teams based on the desired team size.

### 3. Challenges
The Admin selects a challenge type (`PHOTO`, `PITCH`, or `PERFORMANCE`) and pushes a challenge to the room.
- **PHOTO:** Participants must take and upload a photo based on a prompt.
- **PITCH/PERFORMANCE:** Offline activities where the admin awards points after the task.

### 4. Real-time Sync
The `RoomConsumer` (WebSockets) ensures that when an admin pushes a challenge or starts a round, every participant's screen updates instantly without a refresh.

### 5. Review & Scoring
For photo challenges, submissions appear on the Admin's dashboard. The admin can review images and award points (1, 5, or 10) to teams. The **Leaderboard** updates in real-time for everyone.

---

## 🚀 Deployment (Docker & Render)

The project is ready for deployment using **Docker**.

### Production Environment Variables
| Variable | Description |
|----------|-------------|
| `DEBUG` | Set to `False` for production. |
| `SECRET_KEY` | Django secret key. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `REDIS_URL` | Redis instance for Channels. |
| `CLOUDINARY_URL` | API key for Cloudinary image hosting. |

### Docker Build
```bash
docker build -t ui-icebreaker .
```
The `Dockerfile` uses `python:3.11-slim`, installs system dependencies for `psycopg2` and `Pillow`, and starts the server using `uvicorn` (required for ASGI/WebSockets).

---

## 🛠️ Local Setup

### Backend
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`
4. Run migrations: `python manage.py migrate`
5. Start the server: `python manage.py runserver` (Note: Use `daphne` or `uvicorn` for WebSocket support locally).

### Frontends
1. Navigate to either `admin-frontend` or `participant-frontend`.
2. Install packages: `npm install`
3. Start development server: `npm run dev`

---

## ✨ Key Features
- **Pixel-Art UI:** The participant frontend features a nostalgic retro aesthetic.
- **Live Leaderboard:** Watch teams climb the ranks in real-time.
- **Cloud Integration:** Seamless photo uploads and hosting.
- **Admin Control:** Total control over the game flow, from team sizes to scoring.
- **Decoupled Architecture:** Scalable and easy to maintain.

---

## 📜 License
*Self-hosted / Private* - Created for internal engagement and fun!
