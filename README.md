# To-Do App

A to-do application developed with React, TypeScript, and Vite.

## 📋 Prerequisites

- Node.js (version 18.0.0 or higher)
- npm or yarn
- MongoDB Atlas account (o MongoDB local)

## 🚀 Installation

Follow these steps to install and configure the project in your local environment:

```bash
# Clone the repository (if you're using Git)
git clone <repository-url>
cd to-do

# Install dependencies
npm install
# Or if you prefer using yarn
# yarn install
```

## ⚙️ Configuration

### MongoDB Setup

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) or use a local MongoDB instance
2. Create a new cluster or use an existing one
3. Create a database user with read/write permissions
4. Get your connection information (user, password, cluster, database)

### JWT Secret Configuration

1. Generate a secure JWT secret using one of the following methods:

```bash
# Method 1: Using Node.js in the terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 64
```

2. Copy the generated string for the next step

### Credentials Setup

1. Create a `credentials.json` file in the root directory based on the provided example:

```bash
cp credentials.example.json credentials.json
```

2. Edit the `credentials.json` file with your MongoDB and JWT information:

```json
{
  "mongodb": {
    "user": "your_mongodb_user",
    "password": "your_mongodb_password",
    "cluster": "your_cluster_address",
    "database": "your_database_name",
    "appName": "to-do-app"
  },
  "jwt": {
    "secret": "your_generated_jwt_secret"
  }
}
```

## 💻 Usage

### Backend Server

To run the backend server:

```bash
# Start the server in development mode with hot reload
npm run server:dev
# Or with yarn
# yarn server:dev

# Start the server in production mode
npm run server
# Or with yarn
# yarn server
```

### Local Development

To run the frontend application in development mode:

```bash
npm run dev
# Or with yarn
# yarn dev
```

This will start the Vite development server and open the application in your default browser. The application will automatically reload if you change any of the source files.

### Check Code Errors

To run the linter and check for code errors:

```bash
npm run lint
# Or with yarn
# yarn lint
```

### Build for Production

To build the application for production:

```bash
npm run build
# Or with yarn
# yarn build
```

### Preview Production Version

To preview the production build locally:

```bash
npm run preview
# Or with yarn
# yarn preview
```

## 📁 Project Structure

```
to-do/
├── public/             # Static files
├── src/                # Source code
│   ├── assets/         # Images and resources
│   ├── components/     # React components
│   ├── db/             # Database connection and models
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main component
│   ├── App.scss        # Main component styles
│   ├── index.scss      # Global styles
│   └── main.tsx        # Entry point
├── server.js           # Express server for API
├── credentials.json    # MongoDB and JWT configuration (not tracked by Git)
├── credentials.example.json # Example credentials template
├── .eslintrc.json      # ESLint configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🛠️ Technologies Used

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Sass](https://sass-lang.com/)
- [ESLint](https://eslint.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
