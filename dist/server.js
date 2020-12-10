"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
require('dotenv').config({ path: path_1.default.resolve(__dirname, '../.env') });
const User_1 = require("./routes/User");
const UserProfile_1 = require("./routes/UserProfile");
const app = express_1.default();
const publicPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(publicPath));
app.use(express_1.default.json());
app.use('/api', User_1.userRouter);
app.use('/api', UserProfile_1.userProfileRouter);
app.use(cors_1.default());
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
const PORT = process.env.PORT || 8080;
const server = http_1.default.createServer(app);
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    console.log('We have a new connection!!!');
    socket.on('disconnect', () => {
        console.log('User had left!!!');
    });
});
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
//# sourceMappingURL=server.js.map