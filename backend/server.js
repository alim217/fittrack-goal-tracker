// Load environment variables from .env file immediately
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes.js'); // Assuming this file exports an Express Router

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Database Connection ---
const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }
    await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure if initial connection fails
    process.exit(1);
  }
};

// Connect to Database
connectDB();

// --- Express App Initialization ---
const app = express();

// --- Middleware ---

// Enable CORS - Configure origins specifically for production environments
app.use(cors()); // For development, allow all origins. In production, restrict this.

// Body Parser Middleware - Enable parsing of JSON request bodies
app.use(express.json());

// --- API Routes ---
app.use('/api', apiRoutes);

// --- Basic Root Endpoint for Health Check ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Fitness Tracker API Running' });
});

// --- Global Error Handling Middleware ---
// This should be the last middleware added
app.use((err, req, res, next) => {
  console.error('Global Error Handler Caught:', err.stack);

  const statusCode = err.statusCode || 500;
  const responseBody = {
    message: err.message || 'Internal Server Error',
    // Only include error details in development
    ...(NODE_ENV === 'development' && { error: err.stack }),
  };

  res.status(statusCode).json(responseBody);
});

// --- Server Startup ---
const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// --- Graceful Shutdown Handling ---
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    }).catch(err => {
       console.error('Error closing MongoDB connection during shutdown:', err);
       process.exit(1);
    });
  });
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle Unhandled Promise Rejections (Optional but Recommended)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, gracefully shutdown here as well or implement specific logic
  // For now, we just log it. Consider shutting down for critical unhandled rejections.
  // gracefulShutdown('Unhandled Rejection'); // Uncomment if shutdown is desired
});

// Handle Uncaught Exceptions (Optional but Recommended)
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // It's generally recommended to exit after an uncaught exception,
  // as the application state might be corrupted.
  console.log('Application encountered an uncaught exception. Shutting down...');
  server.close(() => {
    console.log('HTTP server closed due to uncaught exception.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed due to uncaught exception.');
      process.exit(1); // Exit with failure code
    }).catch(err => {
       console.error('Error closing MongoDB connection during uncaught exception shutdown:', err);
       process.exit(1);
    });
  });
  // Force exit if server/db doesn't close in time
  setTimeout(() => process.exit(1), 5000).unref();
});