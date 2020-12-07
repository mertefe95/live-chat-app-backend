"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
require('dotenv').config({ path: path_1.default.resolve(__dirname, '../.env') });
const User_1 = __importDefault(require("./routes/User"));
const UserProfile_1 = __importDefault(require("./routes/UserProfile"));
const app = express_1.default();
const publicPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(publicPath));
console.log(process.env.ATLAS_URI);
app.use(express_1.default.json());
app.use(cors_1.default());
app.use('/api', User_1.default);
app.use('/api', UserProfile_1.default);
const uri = "mongodb+srv://admin:admin@live-chat-app.n1mw4.mongodb.net/live-chat-app?retryWrites=true&w=majority";
const connection = mongoose_1.default.connection;
connection.once('open', () => {
    console.log(`MongoDB connection has established.`);
});
mongoose_1.default.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`${PORT} is been running.`);
});
