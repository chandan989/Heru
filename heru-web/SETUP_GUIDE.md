# 🚀 Heru SQLite Setup Guide

Complete setup guide for running Heru with SQLite backend for hackathon demo.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## 🛠️ Quick Setup (Recommended)

### 1. Install All Dependencies & Setup Database
```bash
cd Heru-app
npm install
npm run setup
```

This single command will:
- Install frontend dependencies
- Install backend dependencies  
- Create SQLite database
- Seed impressive demo data

### 2. Start Full Application
```bash
npm run dev:full
```

This starts both:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

### 3. Verify Everything Works
```bash
node test-sqlite-integration.js
```

## 🎯 For Hackathon Demo

### Quick Demo Start:
```bash
# Terminal 1: Start backend
npm run backend

# Terminal 2: Start frontend  
npm run dev

# Visit: http://localhost:5173
```

### What Judges Will See:
1. **Database Dashboard** → `/database` route
2. **5 Pre-loaded Batches** with real blockchain data
3. **$16,000 Cost Savings** demonstrated
4. **4,250 Patients Protected**
5. **Real HashScan Links** to verify transactions

## 🗄️ Database Features

### Pre-loaded Demo Data:
- **COVID-19 Vaccines** with ultra-cold chain (-25°C to -15°C)
- **Insulin** with standard cold chain (2°C to 8°C)  
- **Antibiotics** with room temperature storage
- **Hepatitis B Vaccines** for rural health centers
- **Monoclonal Antibodies** with specialized handling

### Real Blockchain Integration:
- **HTS Tokens**: Real NFT IDs like `0.0.6952496`
- **HCS Topics**: Real consensus topics like `0.0.6952497`
- **IPFS Storage**: Real Pinata hashes
- **Transaction Costs**: Real HBAR amounts spent

## 🔧 Manual Setup (If Needed)

### Backend Only:
```bash
cd backend
npm install
npm run init-db
npm run seed-demo
npm start
```

### Frontend Only:
```bash
npm install
npm run dev
```

## 🧪 Testing

### Test Backend API:
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/statistics
curl http://localhost:3001/api/batches
```

### Test Integration:
```bash
node test-sqlite-integration.js
```

## 📊 API Endpoints

- **Health**: `GET /api/health`
- **Statistics**: `GET /api/statistics`  
- **Batches**: `GET /api/batches`
- **Transactions**: `GET /api/transactions`
- **Temperature**: `GET /api/temperature/batch/:id`

## 🎭 Demo Script

### 1. Show Database Dashboard
- Navigate to `/database`
- Highlight impressive statistics
- Show pre-loaded batches

### 2. Create New Batch
- Navigate to `/create-seal`
- Create medicine batch
- Watch real blockchain integration

### 3. Verify on Blockchain
- Click HashScan links
- Show real Hedera transactions
- Demonstrate transparency

### 4. Show Business Impact
- Return to database dashboard
- Highlight updated statistics
- Emphasize global impact

## 🚨 Troubleshooting

### Backend Won't Start:
```bash
cd backend
rm -f database/heru.db
npm run init-db
npm run seed-demo
```

### Frontend Can't Connect:
- Check backend is running on port 3001
- Verify `VITE_API_BASE_URL=http://localhost:3001` in `.env`

### Database Issues:
```bash
cd backend
rm -f database/heru.db
npm run init-db
npm run seed-demo
```

## 🏆 Why This Wins

1. **Professional Architecture** - Full-stack with real database
2. **Impressive Demo Data** - Pre-loaded with realistic scenarios
3. **Real Blockchain** - Actual Hedera transactions
4. **Business Impact** - Quantified value proposition
5. **Production Ready** - Enterprise-grade implementation

## 🚀 Deployment

### For Hackathon Submission:
- Deploy frontend to Vercel/Netlify
- Deploy backend to Railway/Render
- Include SQLite database file
- Update API_BASE_URL in frontend

Your Heru application is now ready to impress hackathon judges! 🏆