const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Test = require('./models/Test');

const authRoutes = require("./routes/auth");
const activityRoutes = require("./routes/activities");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.post('/test', async (req, res) => {
  const entry = await Test.create({
    name: 'Loveth',
    message: 'MongoDB is working!'
  });
  res.json(entry);
});

app.get('/test', async (req, res) => {
  const entries = await Test.find();
  res.json(entries);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));