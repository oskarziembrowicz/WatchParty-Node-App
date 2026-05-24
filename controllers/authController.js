const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Promisify jwt.verify
const verifyToken = promisify(jwt.verify);

const signToken = (id) =>
  // @ts-ignore - process.env values are checked at runtime
  // SECURITY NOTE: add options = { expiresIn: process.env.JWT_EXPIRES_IN }
  jwt.sign({ id }, process.env.JWT_SECRET);

// TODO: Comment on jwt expitarion
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    secure: false,
    httpOnly: true,
    sameSite: 'strict',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!password || password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }

  const newUser = await User.create({
    username,
    email,
    password,
    // passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2. Check if the user exists and the password is correct
  const user = await User.findOne({ email: email }).select('+password');

  // The error message deliberately does not distinguish between wrong email and
  // wrong password, to prevent user enumeration.
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Send token to client
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: Clearing the cookie only removes it from the browser.
  //                The JWT itself is still valid until it expires — there is no server-side revocation.
  //                In production, maintain a token blacklist (e.g. in Redis) to invalidate tokens on logout.
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Try to get token from cookies first
  // console.log(req);
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. If no token in cookie, check for Bearer token in headers
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  // 2. Verify the token
  // @ts-ignore - process.env.JWT_SECRET is validated at runtime
  const decoded = await verifyToken(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  // @ts-ignore - decoded is a JWT payload with id property
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('This user does not exist!', 401));
  }

  // 4. SECURITY NOTE: In production, check if the user changed their password after the token was issued.
  //                   If so, the token should be considered invalid to prevent use of stolen old tokens.
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password! Plase log in again.', 401),
  //   );
  // }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
