const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A party must have a name'],
  },
  description: {
    type: String,
    required: [true, 'A party must have a description'],
  },
  startDate: {
    type: Date,
    required: [true, 'A party must have a start date'],
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  joinLink: String,
  address: String,
  //   movies: [mongoose.Types.ObjectId],
  //   participants: [mongoose.Types.ObjectId],
  usefulLinks: [String],
  sharedFiles: [File],
  creationDate: {
    type: Date,
    default: Date.now,
    select: false,
  },
  //   authorId: mongoose.Types.ObjectId,
  //   status: {
  //     type: PartyStatus,
  //     default: PartyStatus.Expected,
  //   }
  //   partyImpressions: [PartyImpression],
  //   movieImpressions: [MovieImpression],
});

const Party = mongoose.model('Party', partySchema);

module.exports = Party;
