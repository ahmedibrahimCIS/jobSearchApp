# Job Search App

A full-featured job search application built with Node.js, Express, and MongoDB, featuring real-time notifications, authentication, and advanced job search capabilities.

## Features

-  Secure user authentication with JWT and Google OAuth
-  User profiles for both job seekers and employers
-  Advanced job search and filtering
-  Real-time notifications using Socket.IO
-  Email notifications for job applications and updates
-  File upload support with Cloudinary
-  Rate limiting and security features
-  Scheduled tasks with node-cron
-  Input validation with Joi
-  RESTful API architecture

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Google OAuth credentials (for social login)
- Cloudinary account (for file uploads)
- SMTP server details (for email notifications)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-search-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=your_port
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:your_port`

## API Documentation

The API includes the following main endpoints:

- `/auth` - Authentication routes (login, register, Google OAuth)
- `/job` - Job posting and search
- `/user` - User profile management
- `/chat` - Chat Api
- `/company` - Company data Manipulation
- `/graphql` - Admin Dashboard 

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet security headers
- Input validation
- CORS protection

## Real-time Features

The application uses Socket.IO for real-time features including:
- Instant notifications for job applications
- Real-time chat between employers and applicants
- Live job posting updates

