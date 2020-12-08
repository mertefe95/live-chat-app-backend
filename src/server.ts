import mongoose from "mongoose";
import express, { Application } from "express";
import path from "path";
import http from "http";
import * as socketIO  from "socket.io";
import cors from "cors";
require('dotenv').config( { path: path.resolve(__dirname, '../.env') });

import { userRouter } from "./routes/User";
import { userProfileRouter } from './routes/UserProfile';

const app: Application = express();
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath))
app.use(express.json())
app.use(cors());
app.use('/api', userRouter)
app.use('/api', userProfileRouter)


const uri = "mongodb+srv://admin:admin@live-chat-app.n1mw4.mongodb.net/live-chat-app?retryWrites=true&w=majority"

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


const server = http.createServer(app)
const io = socketIO(server);

server.listen(PORT, () => console.log(`Server running on ${PORT}`))







