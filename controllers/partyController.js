const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const unlinkAsync = promisify(fs.unlink);
const catchAsync = require('../utils/catchAsync');
const Party = require('../models/partyModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const upload = require('../utils/upload');

exports.getAllParties = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: Returns every party in the database to any authenticated user.
  //                In production, filter by participant/author to avoid leaking private parties,
  //                and add pagination to prevent large data dumps.
  const parties = await Party.find();

  res.status(200).json({
    status: 'success',
    data: {
      parties,
    },
  });
});

exports.getParty = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      party,
    },
  });
});

exports.createParty = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: `joinLink` is stored as-is with no validation. In production, validate that it
  //                is a real URL and does not point to internal network addresses (SSRF prevention).
  const party = {
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    isOnline: req.body.isOnline,
    joinLink: req.body.joinLink,
    address: req.body.address,
    movies: req.body.movies,
    authorId: req.user.id,
    participants: [req.user.id],
  };
  const newParty = await Party.create(party);

  res.status(201).json({
    status: 'success',
    data: {
      party: newParty,
    },
  });
});

exports.addMovie = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can add movies to any party (IDOR).
  //                In production, verify req.user is the party author or a participant.
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  // Protect against duplicate movies
  if (!party.movies.includes(req.body.movieId)) {
    party.movies.push(req.body.movieId);
  }
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.removeMovie = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can remove movies from any party (IDOR).
  //                In production, verify req.user is the party author or a participant.
  const partyId = req.params.id;
  const { movieId } = req.params;
  const party = await Party.findById(partyId);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  // Protect against removing a movie that is not in the party
  if (!party.movies.includes(req.params.movieId)) {
    return next(new AppError('Movie not found in party', 404));
  }

  party.movies = party.movies.filter((movie) => movie !== movieId);
  const updatedParty = await Party.findByIdAndUpdate(partyId, party, {
    new: true,
  });

  res.status(204).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.addParticipant = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can add anyone to any party (IDOR).
  //                In production, restrict to the party author or implement an invite/accept flow.
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const { userId } = req.body;
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!party.participants.includes(userId)) {
    party.participants.push(userId);
  }
  // Add user to party participants
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.removeParticipant = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can remove anyone from any party (IDOR).
  //                In production, restrict to the party author or the participant themselves.
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const { userId } = req.params;
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  if (!party.participants.includes(userId)) {
    return next(new AppError('User not found in party', 404));
  }

  // Remove user from party participants
  party.participants.pull(userId);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.updateParty = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can update any party (IDOR).
  //                In production, verify req.user.id === party.authorId.toString().
  const allowedFields = [
    'name',
    'description',
    'startDate',
    'isOnline',
    'joinLink',
  ];

  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  // Only update allowed fields
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      party[field] = req.body[field];
    }
  });

  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.deleteParty = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can delete any party (IDOR).
  //                In production, verify req.user.id === party.authorId.toString(), or restrict to admins.
  await Party.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.endParty = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can archive any party (IDOR).
  //                In production, verify req.user.id === party.authorId.toString().
  const party = await Party.findByIdAndUpdate(
    req.params.id,
    { status: 'archived' },
    { new: true },
  );

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      party,
    },
  });
});

exports.addUsefulLink = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No authorization check -- any authenticated user can add links to any party (IDOR).
  //                In production, restrict to party participants.
  // SECURITY NOTE: The link value is not validated as a URL and not sanitized.
  //                In production, validate with a URL parser and reject internal/private addresses (SSRF).
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const { link } = req.body;
  if (!link) {
    return next(new AppError('Link is required', 400));
  }

  party.usefulLinks.push(link);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

// IMPRESSIONS
exports.getPartyImpressions = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      impressions: party.partyImpressions,
    },
  });
});

exports.addPartyImpression = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No check that req.user is actually a participant of this party.
  //                In production, verify party.participants.includes(req.user.id).
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const impression = {
    userId: req.user.id,
    impression: req.body.impression,
  };

  party.partyImpressions.push(impression);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

exports.addMovieImpression = catchAsync(async (req, res, next) => {
  // SECURITY NOTE: No check that req.user is a participant, or that the movie is part of this party.
  //                In production, validate both before storing the impression.
  const party = await Party.findById(req.params.id);

  if (!party) {
    return next(new AppError('No party found with that ID', 404));
  }

  const impression = {
    movieId: req.body.movieId,
    userId: req.user.id,
    impression: req.body.impression,
  };

  party.movieImpressions.push(impression);
  const updatedParty = await Party.findByIdAndUpdate(req.params.id, party, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedParty,
    },
  });
});

// ─── Shared Files ────────────────────────────────────────────────────────────

exports.getSharedFiles = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);
  if (!party) return next(new AppError('No party found with that ID', 404));
  res
    .status(200)
    .json({ status: 'success', data: { files: party.sharedFiles } });
});

// multer middleware runs first, then the async handler
// SECURITY NOTE: In production, verify req.user is a party participant before allowing upload
exports.uploadSharedFile = [
  upload.single('file'),
  catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError('No file provided', 400));

    const party = await Party.findById(req.params.id);
    if (!party) return next(new AppError('No party found with that ID', 404));

    const fileEntry = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploaderId: req.user.id,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    party.sharedFiles.push(fileEntry);
    await party.save();

    res.status(201).json({ status: 'success', data: { file: fileEntry } });
  }),
];

// SECURITY NOTE: In production, verify req.user is a party participant before allowing download
exports.downloadSharedFile = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);
  if (!party) return next(new AppError('No party found with that ID', 404));

  const file = party.sharedFiles.id(req.params.fileId);
  if (!file) return next(new AppError('File not found', 404));

  const filePath = path.join(__dirname, '..', 'uploads', file.filename);
  res.download(filePath, file.originalName);
});

// SECURITY NOTE: In production, restrict deletion to the uploader or an admin
exports.deleteSharedFile = catchAsync(async (req, res, next) => {
  const party = await Party.findById(req.params.id);
  if (!party) return next(new AppError('No party found with that ID', 404));

  const file = party.sharedFiles.id(req.params.fileId);
  if (!file) return next(new AppError('File not found', 404));

  const filePath = path.join(__dirname, '..', 'uploads', file.filename);

  // Remove from disk; ignore ENOENT in case the file was already deleted manually
  try {
    await unlinkAsync(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT')
      return next(new AppError('Error deleting file from disk', 500));
  }

  party.sharedFiles.pull({ _id: req.params.fileId });
  await party.save();

  res.status(204).json({ status: 'success', data: null });
});
