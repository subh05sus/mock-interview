# **AI-Powered Mock Interview System**  

This project is an AI-powered mock interview system that helps users prepare for technical interviews by providing LeetCode-style coding challenges and AI-powered code reviews.  

## **Features**  

✅ Browse job listings  
✅ Take mock interviews for specific job positions  
✅ LeetCode-style coding interface with multiple language support  
✅ AI-powered code review and feedback  
✅ View submission history  

## **Tech Stack**  

### **Backend**  
- **Node.js** with **Express.js**  
- **TypeScript**  
- **MongoDB** for data storage  
- **OpenAI API** for code review  
- **Judge0 API** for code execution  

### **Frontend**  
- **React.js** with **TypeScript**  
- **Vite** for faster builds  
- **Tailwind CSS** for styling  
- **Monaco Editor** for code editing  
- **React Router** for navigation  

### **DevOps**  
- **Docker** for containerization  
- **AWS EC2** for deployment  
- **GitHub Actions** for CI/CD  
- **Nginx** for reverse proxy  

---

## **Getting Started**  

### **1️⃣ Prerequisites**  
Ensure you have the following installed:  
- **Node.js** (v16+)  
- **MongoDB**  
- **Docker** and **Docker Compose** (for containerized deployment)  
- **Judge0 API key**  
- **OpenAI API key**  

### **2️⃣ Local Development**  

#### **Clone the repository:**  
```bash
git clone https://github.com/subh05sus/mock-interview.git
cd mock-interview
```

#### **Backend Setup**  
```bash
cd server
cp .env.example .env  # Copy and update environment variables
npm install
npm run dev  # Start the backend
```

#### **Frontend Setup**  
```bash
cd ../client
cp .env.example .env  # Copy and update environment variables
npm install
npm run dev  # Start the frontend
```

Now, visit `http://localhost:3000` in your browser.  

---

## **Admin Credentials**  

📧 **Email:** admin@jobsforce.ai  
🔑 **Password:** 123456  

---

## **Environment Variables (.env format)**  

### **Backend (`server/.env`)**  
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://jobsforce:xxxxxxxxxxxx@cluster0.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=jvuFYFJHMxxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI API
OPENAI_API_KEY=sk-proj--xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Judge0 API
JUDGE0_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **Frontend (`client/.env`)**  
```
REACT_APP_API_URL=https://jobsforce.subhadip.me/api
```

---

🚀 **Now, your mock interview platform is fully set up!** Let me know if you need any fixes. 😃
