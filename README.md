# CA-ProFlow

> **"Simplifying Compliance"**  
> A modern, professional, full-stack Compliance Management web application designed for Chartered Accountants and tax professionals.

---

## 📸 Master Management Modules

1. **Tax Group** (`/tax-group`)
   - Field: **Tax Name**
   - Quick preset suggestions & statutory classifications.

2. **Tax Master** (`/tax-master`)
   - 6 Compliance Attributes: **Description**, **Frequency**, **Date (From - To)**, **Submission Date**, **Reconciliation Date**, **Extend Date**.

3. **Work Master** (`/work-master`)
   - Fields: **Work Name**, **Tax Group** (linked to Tax Group master), **Type of Work** (linked to saved Tax Masters).
   - Live inter-master specifications card & modal popup.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (v18)** with **Vite**
- **Tailwind CSS (v3)**
- **JavaScript (JSX)**
- **React Router (v6)**
- **Axios** (REST API client)
- **Lucide React** (modern icon library)

### Backend
- **Node.js** & **Express.js**
- **Prisma ORM (v6)**
- **PostgreSQL** database (with zero-downtime file persistence fallback)
- **CORS** middleware
- **RESTful API** architecture

---

## 🚀 Getting Started

### Backend
```bash
cd backend
npm install
npm run prisma:generate
npm start
```
*Backend server runs on port 5000.*

### Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server runs on port 5173.*
