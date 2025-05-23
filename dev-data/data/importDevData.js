const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Party = require('../../models/partyModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to MongoDB...');
  });

// Read JSON file
const parties = JSON.parse(
  fs.readFileSync(`${__dirname}/parties-simple.json`, 'utf-8')
);

console.log(parties);

// Import data onto db
const importData = async () => {
  try {
    await Party.create(parties);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(`Couldn't create: ${err.message}`);
  }
  process.exit();
};

// Delete all data from db
const deleteData = async () => {
  try {
    await Party.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(`Couldn't delete: ${err.message}`);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  console.log('Importing data...');
  importData();
} else if (process.argv[2] === '--delete') {
  console.log('Deleting data...');
  deleteData();
}

console.log(process.argv);
