const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const partyRouter = require('./routes/partyRouter');
const movieRouter = require('./routes/movieRouter');
const userRouter = require('./routes/userRouter');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1. GLOBAL MIDDLEWARES

/* SECTION FOR FUTURE SECURITY

// Set security HTTP headers
app.use(helmet());

// This limiter is set to max of 100 request an hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP! Please try again in an hour.",
});
app.use("/api", limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// SECURITY NOTE: Configure CORS to restrict which origins can access this API.
//                Without it, any website can make cross-origin requests on behalf of a logged-in user.
// app.use(cors({ origin: process.env.ALLOWED_ORIGIN, credentials: true }));

*/

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
// SECURITY NOTE: This limit only applies to JSON bodies; multipart/form-data (file uploads) is not capped here.
//                In production, also set limits inside multer (see utils/upload.js).
app.use(express.json({ limit: '10kb' }));

// Cookie parser
// SECURITY NOTE: Without signed cookies (cookieParser(secret)), cookie values can be tampered with by the client.
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
