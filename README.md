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

### Code Formatting

This project uses Prettier for automatic code formatting. To format your code:

```bash
# Format all files in the project
npm run format

# Check if files are properly formatted
npm run format:check
```

**Note**: If you're using VS Code, Prettier is configured to automatically format files on save. See the [Prettier Setup Documentation](./docs/PRETTIER_SETUP.md) for detailed configuration instructions.

### Testing MongoDB Connection

To test the MongoDB connection independently:

```bash
npm run test-mongodb
```

### Development with Both Server and Client

To run both the backend server and frontend development server simultaneously:

```bash
npm start
```

This command will start both servers concurrently, allowing you to develop full-stack features efficiently.

## 🔧 Development Tools & VS Code Setup

### Recommended VS Code Extensions

This project includes recommended VS Code extensions in `.vscode/extensions.json`:

- **Prettier**: Code formatter
- **ESLint**: JavaScript/TypeScript linting
- **Auto Rename Tag**: Automatically rename paired HTML/JSX tags
- **Bracket Pair Colorizer**: Better bracket visibility
- **GitLens**: Enhanced Git capabilities

### VS Code Configuration

The project includes workspace-specific VS Code settings in `.vscode/settings.json` that:

- Enable automatic code formatting on save
- Configure Prettier as the default formatter
- Set up proper TypeScript and React development environment

### Code Quality

- **ESLint**: Configured for React and TypeScript best practices
- **Prettier**: Automatic code formatting with consistent style rules
- **TypeScript**: Strong typing for better code reliability

For detailed Prettier setup instructions, see [docs/PRETTIER_SETUP.md](./docs/PRETTIER_SETUP.md).

## 📁 Project Structure

```
to-do/
├── .vscode/            # VS Code workspace configuration
│   ├── extensions.json # Recommended extensions
│   └── settings.json   # Workspace settings (auto-format on save)
├── docs/               # Project documentation
│   └── PRETTIER_SETUP.md # Prettier configuration guide
├── public/             # Static files
├── src/                # Source code
│   ├── assets/         # Images and resources
│   ├── components/     # React components
│   ├── db/             # Database connection and models
│   │   └── models/     # MongoDB data models
│   ├── security/       # Authentication controllers and middleware
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main component
│   ├── App.scss        # Main component styles
│   ├── index.scss      # Global styles
│   └── main.tsx        # Entry point
├── .prettierrc         # Prettier configuration
├── .prettierignore     # Files excluded from Prettier formatting
├── server.js           # Express server for API
├── credentials.json    # MongoDB and JWT configuration (not tracked by Git)
├── credentials.example.json # Example credentials template
├── eslint.config.js    # ESLint configuration
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
- [Prettier](https://prettier.io/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [CORS](https://www.npmjs.com/package/cors)

## 🚀 Quick Start

After following the installation and configuration steps above:

1. **Start the backend server:**

   ```bash
   npm run server:dev
   ```

2. **In a new terminal, start the frontend:**

   ```bash
   npm run dev
   ```

3. **Or run both simultaneously:**

   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## 🔒 Features

- **User Authentication**: Register, login, password reset functionality
- **Task Management**: Create, edit, delete, and organize tasks
- **Subtasks**: Add subtasks to main tasks for better organization
- **Task Filtering**: Filter tasks by completion status
- **Real-time Updates**: Live connection status indicator
- **Responsive Design**: Works on desktop and mobile devices
- **Data Persistence**: All data stored securely in MongoDB
- **Code Quality**: ESLint + Prettier for consistent code style

## 🔍 Troubleshooting

### Common Issues

**1. MongoDB Connection Issues**

```bash
# Test your MongoDB connection
npm run test-mongodb
```

- Verify your `credentials.json` file has correct MongoDB information
- Ensure your MongoDB Atlas cluster allows connections from your IP
- Check if your database user has proper read/write permissions

**2. JWT Secret Issues**

- Make sure you've generated a secure JWT secret (64+ characters)
- Verify the secret is properly set in `credentials.json`

**3. Port Already in Use**

- Backend runs on port 3000 by default
- Frontend runs on port 5173 by default
- If ports are busy, stop other processes or modify the configuration

**4. Dependencies Issues**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**5. VS Code Auto-formatting Not Working**

- Install the Prettier extension: `esbenp.prettier-vscode`
- Restart VS Code after installing extensions
- Check that auto-format on save is enabled in workspace settings

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure MongoDB is properly configured
4. Review the [Prettier Setup Documentation](./docs/PRETTIER_SETUP.md)

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the linter and formatter: `npm run lint && npm run format`
5. Submit a pull request

---

_Happy coding! 🚀_
