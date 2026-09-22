# IIT Hyderabad — AIFES Laboratory Website

Official website and portal for the **AI for Finance, Economies & Society (AIFES)** Laboratory at the Department of Artificial Intelligence, Indian Institute of Technology Hyderabad (IITH).

---

## 🚀 Tech Stack

- **Frontend**: React (Vite), React Router v6, Three.js (Hero canvas animation), Vanilla CSS Design System
- **Backend**: Node.js, Express, REST API
- **Fonts**: Open Sans, Roboto

---

## 📁 Project Structure

```
├── client/
│   ├── public/              # Static assets and images
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, Footer, EventsNewsSection, HeroCanvas)
│   │   ├── pages/           # Route pages (Home, Research, Education, ReadingGroup, Events, About, Contact, AdminPanel)
│   │   ├── App.jsx          # App routing
│   │   ├── main.jsx         # App root
│   │   └── index.css        # Core design tokens and styling
│   └── package.json
├── server/
│   ├── index.js             # Express API server for events & news posts
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

### 1. Install Dependencies

Install root, client, and server dependencies:

```bash
# In root directory
npm install

# In client directory
cd client
npm install

# In server directory
cd ../server
npm install
```

### 2. Run the Development Environment

Start both the backend server (port 5000) and frontend client (port 5173):

```bash
# Start backend API (from server folder)
npm start

# Start frontend (from client folder)
npm run dev
```

---

## 📝 Admin Panel

To manage **Events & News Updates** displayed across the Home and Events pages, navigate to:
```
http://localhost:5173/admin
```

---

## 📜 License

© IIT Hyderabad — AI for Finance, Economies & Society (AIFES) Lab. All rights reserved.
