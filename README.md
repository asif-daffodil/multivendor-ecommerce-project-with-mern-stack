# Multivendor E-commerce Project (MERN Stack)

This is a full-featured multivendor e-commerce platform built using the MERN stack (MongoDB, Express.js, React, Node.js). The project is organized into two main folders: `backend` and `frontend`.

## Features
- User authentication and authorization
- Admin and vendor dashboards
- Product management (CRUD)
- Category and brand management
- Order processing and payment integration
- Product reviews and ratings
- Profile management and image uploads
- Shopping cart and checkout
- Responsive UI with Tailwind CSS

## Project Structure
```
backend/
  ├── controller/         # Controllers for business logic
  ├── middleware/         # Express middlewares
  ├── model/              # Mongoose models
  ├── public/             # Static files (images, uploads)
  ├── router/             # Express routers
  ├── index.js            # Entry point
  └── package.json        # Backend dependencies
frontend/
  ├── src/                # React source code
  ├── public/             # Frontend static assets
  ├── index.html          # Main HTML file
  ├── package.json        # Frontend dependencies
  └── ...                 # Config files
```

## Backend Packages
- express
- mongoose
- jsonwebtoken
- bcryptjs
- multer
- cors
- dotenv
- nodemon (dev)

## Frontend Packages
- react
- react-dom
- react-router-dom
- axios
- tailwindcss
- @headlessui/react
- @heroicons/react
- vite

## Getting Started

### 1. Clone the repository
```sh
git clone <repo-url>
```

### 2. Install dependencies
#### Backend
```sh
cd backend
npm install
```
#### Frontend
```sh
cd ../frontend
npm install
```

### 3. Run the project
#### Backend
```sh
npm start
```
#### Frontend
```sh
npm run dev
```

### 4. Access the app
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Environment Variables
Create a `.env` file in the `backend` folder with the following:
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

## License
This project is for educational purposes.
