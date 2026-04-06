const mongoose = require('mongoose');
const PartyStatus = require('../types/partyStatus');

const PartyImpression = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  impression: String,
});

const MovieImpression = new mongoose.Schema({
  movieId: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  impression: String,
});

const SharedFile = new mongoose.Schema({
  filename: String, // name used to store the file on disk
  originalName: String,
  uploaderId: { type: mongoose.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  mimetype: String,
  size: Number,
});

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A party must have a name'],
  },
  description: String,
  startDate: {
    type: Date,
    // required: [true, 'A party must have a start date'],
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  joinLink: String,
  // SECURITY NOTE: joinLink and usefulLinks accept arbitrary strings with no URL validation.
  //                In production, validate these with a URL parser and reject private/internal addresses
  //                to prevent SSRF if the server ever fetches these URLs, or stored XSS if a client renders them.
  address: String,
  movies: [String],
  participants: {
    type: [mongoose.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  usefulLinks: [String],
  sharedFiles: [SharedFile],
  creationDate: {
    type: Date,
    default: Date.now,
    select: false,
  },
  authorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: Object.values(PartyStatus),
    default: PartyStatus.Expected,
  },
  partyImpressions: [PartyImpression],
  movieImpressions: [MovieImpression],
});

const Party = mongoose.model('Party', partySchema);

module.exports = Party;
