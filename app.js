const express = require('express');
const partyRouter = require('./routes/partyRouter');

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

*/

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// 2. ROUTES
app.use('/api/v1/parties', partyRouter);

module.exports = app;
