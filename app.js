require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors'); // Add CORS middleware

var indexRouter = require('./routes/index');
var employeeRouter = require('./routes/employee');

var app = express();

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ], // Allow requests from React frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies or auth headers if needed
}));

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); // admin routes
app.use('/employee', employeeRouter); // employee routes

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // Check if this is an API request
  if (req.path.startsWith('/admin/') || req.path.startsWith('/employee/')) {
    // API error response
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(err.errors).forEach(key => {
        validationErrors[key] = err.errors[key].message;
      });

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle other errors
    return res.status(status).json({
      status: 'error',
      message: message,
      ...(req.app.get('env') === 'development' && { stack: err.stack })
    });
  }

  // Regular error page for non-API requests
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;