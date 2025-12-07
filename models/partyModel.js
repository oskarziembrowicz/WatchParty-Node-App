const mongoose = require('mongoose');

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
  address: String,
  movies: [String],
  participants: {
    type: [mongoose.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  // usefulLinks: [String],
  // sharedFiles: [File],
  creationDate: {
    type: Date,
    default: Date.now,
    select: false,
  },
  authorId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  //   status: {
  //     type: PartyStatus,
  //     default: PartyStatus.Expected,
  //   }
  //   partyImpressions: [PartyImpression],
  //   movieImpressions: [MovieImpression],
});

const Party = mongoose.model('Party', partySchema);

module.exports = Party;
