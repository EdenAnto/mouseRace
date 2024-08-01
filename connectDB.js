const mongoose = require('mongoose');

const uri = "mongodb+srv://Office123:XVc2ElprezpiLIOZ@retaurantoffice.hdnt4lz.mongodb.net/mouseRace"

// establish connection to DB function 
const initialDBConnection = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connected to MongoDB!");
    return true;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    return false;
  }
};

// Schema and Model for rank
const rankSchema = new mongoose.Schema({
    name: String,
    score: String,
    timeSize: Number
  }, { collection: 'rank' });

const Rank = mongoose.model('rank', rankSchema);

// get top 3 at leaderboard table
const getRank = async () => {
  try {
    const rank = await Rank.find().sort({ timeSize: 1 }).limit(3); // Sorts timeSize ascending and cut top 3
    return rank;
  } catch (error) {
    console.error("Error fetching rank data:", error);
    throw error;
  }
};

// insert new record to db
const insertRank = async (rankDet) => {
    try {
        const newRank = new Rank(rankDet)
        await newRank.save();
    } catch (error) {
      console.error("Error fetching rank data:", error);
      throw error;
    }
  };


// closing DB connection
const close = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed!");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
};

module.exports = {
  initialDBConnection,
  getRank,
  insertRank,
  close
};
