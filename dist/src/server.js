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
const module_1 = __importDefault(require());
const module_2 = __importDefault(require());
const app = express_1.default();
const publicPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(publicPath));
console.log(process.env.ATLAS_URI);
app.use(express_1.default.json());
app.use(cors_1.default());
app.use('/api', module_1.default);
app.use('/api', module_2.default);
const uri = process.env.ATLAS_URI;
const connection = mongoose_1.default.connection;
connection.once('open', () => {
    console.log(`MongoDB connection has established.`);
});
mongoose_1.default.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
const server = http_1.default.createServer(app);
const io = socket(server);
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`${PORT} is been running.`);
});
