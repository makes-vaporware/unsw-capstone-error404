const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    //await mongoose.connect(process.env.DATABASE_URI);
    await mongoose.connect('mongodb://mongo-db/AlignEdDB');
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
