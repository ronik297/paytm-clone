const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rootRouter = require("./routes/index");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", rootRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
  }
};

connectDB();
