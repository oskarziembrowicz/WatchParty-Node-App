const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const partyRouter = require('./routes/partyRouter');
const movieRouter = require('./routes/movieRouter');
const userRouter = require('./routes/userRouter');
const globalErrorHandler = require('./controllers/errorController');
const helmet = require('helmet').default ?? require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const { rateLimit } = require('express-rate-limit');
const logger = require('./utils/logger');
const { morganStream } = require('./utils/logger');

const app = express();

// 1. GLOBAL MIDDLEWARES

// Rate limiting — auth endpoints: max 10 requests per hour per IP
const authLimiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/users/login', authLimiter);
app.use('/api/v1/users/signup', authLimiter);

// HTTP request logging — format only includes method, URL, status and response
// time. Request bodies are never logged, so passwords and tokens are safe.
app.use(morgan('combined', { stream: morganStream }));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Set security HTTP headers
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Cookie parser
app.use(cookieParser());

// Test middleware
app.use((req, res, next) => {
  // @ts-ignore - Adding custom property to Express Request
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 2. ROUTES
app.use('/api/v1/parties', partyRouter);
app.use('/api/v1/movies', movieRouter);
app.use('/api/v1/users', userRouter);

app.use(globalErrorHandler);

module.exports = app;
