const express = require('express');
const userRouter = require("./routes/User");
const mongoose = require('mongoose');
const path = require('path');
const cors = require("cors");

require('dotenv').config( { path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json())
app.use(cors());

app.use('/users', userRouter)

const uri = process.env.ATLAS_URI

const connection = mongoose.connection
connection.once('open', () => {
    console.log(`MongoDB connection has established.`)
})

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on ${PORT}`))

