const express = require('express');
const morgan = require('morgan'); // For logging
const cors = require('cors'); // For Cross-Origin Resource Sharing
const helmet = require('helmet'); // For security headers
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandlers');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Default logging template for requests
app.use(cors()); // Enable CORS with default options
app.use(helmet()); // Some default API security

// Routes
app.use('/api', routes);

// Handle 404 (Not Found)
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
