# BYSpace Project

## Project Overview
BYSpace is a community forum system developed by the Baiyu team, consisting of a frontend Vue application and a backend Express service with MySQL database. The project aims to provide users with product feedback and technical support features.

## Technology Stack
- **Frontend**: Vue 3 + Vue Router + Pinia
- **Backend**: Node.js + Express + MySQL
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Project Structure
```
BYSpace/
├── client/          # Frontend Vue application
│   ├── src/         # Frontend source code
│   │   ├── components/ # Shared components
│   │   ├── router/    # Routing configuration
│   │   ├── services/  # API services
│   │   ├── views/     # Page components
│   │   ├── App.vue    # Root component
│   │   └── main.js    # Entry file
│   ├── .eslintrc.js  # ESLint configuration
│   ├── package.json  # Frontend dependencies
│   ├── pnpm-lock.yaml # Dependency lock file
│   └── vue.config.js # Vue CLI configuration
└── server/          # Backend Express service
    ├── controllers/ # Controllers
    │   └── user.controller.js # User controller
    ├── middleware/  # Middleware
    │   └── auth.js  # Authentication middleware
    ├── routes/      # Routes
    │   └── user.routes.js # User routes
    ├── utils/       # Utilities
    │   └── db.js    # Database connection
    ├── package.json # Backend dependencies
    └── index.js     # Service entry point
```

## Installation Guide
1. Clone repository
```bash
git clone <repository URL>
```

2. Install frontend dependencies
```bash
cd client
pnpm install
```

3. Install backend dependencies
```bash
cd ../server
pnpm install
```

## Running the Project
1. Start frontend development server
```bash
cd client
pnpm dev
```

2. Start backend service
```bash
cd ../server
node index.js
```

## Feature Modules
- User authentication system
- User feedback system
- Technical support documentation

## Contribution Guidelines
Welcome to submit Pull Requests or Issues.
Please ensure the code complies with ESLint standards and passes all tests.