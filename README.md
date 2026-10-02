# Dazzle Wheels - Car Rental Platform

A full-stack car rental website built with Next.js 14, NestJS, and PostgreSQL.

## Company Details
- **Company Name**: Dazzle Wheels
- **Address**: Bagalgunte, T Dasarahalli, Bangalore, India
- **Phone**: +91 7760322345
- **Email**: techbusinessblr@gmail.com

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: NestJS, PostgreSQL, Prisma ORM
- **Storage**: Cloudinary
- **Payments**: Razorpay
- **Email**: Gmail SMTP

## Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npx prisma generate
npx prisma db push
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

## Features
- User authentication (email, mobile, guest booking)
- Car rental booking system
- Payment gateway integration
- Email confirmations
- Admin panel
- Blog system with SEO
- Search analytics
- Responsive design

## Deployment
- Frontend: Vercel/Netlify ready
- Backend: Render/AWS ready
- Docker support included