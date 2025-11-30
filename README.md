

# 🚀 Maha-Vision-Project  
_A lightweight, resilient, offline-first attendance & meal-tracking mini-app for Maharashtra schools_  

[Live Demo → ](https://maha-vision-project.lovable.app)  

---

## 🎯 What is this  

Maha-Vision-Project is a mobile-optimized, offline-capable web app that enables teachers to:  
- Log in with a secure 8-digit Teacher ID  
- Verify school using the 11-digit UDISE code  
- Download class rosters, even under low or no connectivity  
- Mark student attendance and meal attendance efficiently  
- Work entirely offline, with local caching and auto-sync when connectivity is restored  

---

## 🧩 Tech Stack & Architecture  

| Layer | Technology / Approach |
|-------|-----------------------|
| Frontend | Vite + React + TypeScript |
| UI / Styling | shadcn-ui + Tailwind CSS |
| Data Persistence | LocalStorage / IndexedDB (offline caching) |
| Sync Logic | Background sync with queued uploads on reconnect |
| Build / Dev Setup | Vite + npm or bun (as present in repo) |

Architecture:

```

User (mobile device/browser)
↓
React + Tailwind UI (responsive, touch-friendly)
↓
Local storage (cached teacher/school data + pending attendance)
↓
Network / Sync Manager → REST API when online

````

---

## 🚀 Quick Start  

```bash
git clone https://github.com/repo-sumit/maha-vision-project.git  
cd maha-vision-project  
npm install    # or bun install  
npm run dev    # start local dev server with hot-reload  
````

You should be able to test features locally.

---

## 🧪 Demo Credentials (for testing)

* **Teacher ID:** `12345678`
* **UDISE Code:** `27251234567`

---

## 📄 Project Structure

```
/  
├── public/  
├── src/  
│   ├── components/  
│   ├── screens/  
│   ├── services/  (API, sync logic, storage)  
│   ├── storage/   (local caching logic)  
│   ├── utils/     (helpers, validation)  
│   └── assets/  
├── index.html  
├── package.json  
├── tailwind.config.ts  
└── README.md  
```

---


### 📌 License

MIT License — feel free to reuse, modify, and improve.

```

