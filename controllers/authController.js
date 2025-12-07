const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Promisify jwt.verify
const verifyToken = promisify(jwt.verify);

const signToken = (id) =>
  // @ts-ignore - process.env values are checked at runtime
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    // secure: true, // This should be true only in production (for https)
    // TODO: httpOnly: true, // This cannot be accessed or modified by the browser
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // TODO: Remove password from the output
  // user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    // passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
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

  // TODO:
  // if (!user || !(await user.correctPassword(password, user.password))) {
  //   return next(new AppError("Incorrect email or password", 401));
  // }

  if (!user || user.password !== password) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. Send token to client
  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token and check if it exists
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

  // 4. TODO: Check if user changed passwords after token was issued
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError('User recently changed password! Plase log in again.', 401),
  //   );
  // }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
