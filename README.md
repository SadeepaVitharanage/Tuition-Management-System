# XenEdu Tuition Management System

XenEdu is a full-stack tuition management platform for managing students, teachers, classes, attendance, coursework, fees, registrations, payments, and dashboards for administrators, parents, teachers, and students.

The project contains:

- A React 19 and Vite frontend in `client/`
- An Express and MongoDB backend in `server/`
- JWT-based authentication and role-based access control
- Attendance scanning and session management
- Fee records, payment requests, and payment enforcement
- Coursework management and dashboard reporting
- AI-assisted features through Groq
- Email notifications through Nodemailer

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Zustand
- React Hook Form and Zod
- Recharts
- Socket.IO client functionality

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- Socket.IO
- Multer for file uploads
- Nodemailer for email notifications
- Groq SDK for AI features

## Prerequisites

Install the following before running the project:

- Node.js 18 or newer
- npm
- A running MongoDB database, either local or hosted

## Installation

Clone the repository and install dependencies for both applications:

```bash
git clone <repository-url>
cd Tuition-Management-System

cd server
npm install

cd ../client
npm install
```

## Environment Configuration

Create `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/xenedu
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
CLIENT_URL=http://localhost:5173

# Required only for AI features
GROQ_API_KEY=your-groq-api-key

# Required only for email notifications
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password-or-app-password
```

`PORT` is optional. The server uses port `5000` by default for HTTPS when certificates are available and always exposes an HTTP endpoint on port `5001`. The frontend currently uses port `5001` for API requests.

Do not commit `.env` files, private keys, certificates, or API credentials.

## Running the Application

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

The backend API root is available at:

```text
http://localhost:5001/
```

It should respond with a JSON message confirming that the XenEdu API is running.

## Production Build

Build the frontend:

```bash
cd client
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run the backend without Nodemon:

```bash
cd server
npm start
```

## Default Administrator

On the first successful database connection, the backend creates this administrator account if it does not already exist:

```text
Email: admin@xenedu.com
Password: admin123
```

Change this password immediately in any shared, staging, or production environment.

## Project Structure

```text
client/
	src/
		api/              Axios API client
		components/       Shared and role-specific React components
		layouts/          Application layouts
		pages/            Frontend pages
		store/            Client-side state management

server/
	config/             Database configuration
	controllers/        Request and business logic
	middleware/         Authentication and payment middleware
	models/             Mongoose models
	routes/             Express route definitions
	sockets/            Socket.IO functionality
	utils/              Email, PDF, and upload helpers
```

## Useful Commands

From `client/`:

```bash
npm run dev       # Start the Vite development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

From `server/`:

```bash
npm run dev       # Start with Nodemon
npm start         # Start with Node.js
```

## Notes

- Uploaded files are served from the backend's `server/uploads/` directory.
- The frontend discovers the API host from the browser hostname and uses port `5001`.
- For access from another device on the same network, run the development server on a reachable host and use the computer's local IP address in the browser.
