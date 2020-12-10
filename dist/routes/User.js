"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express = require('express');
const User_1 = require("../models/User");
const router = express.Router();
exports.userRouter = router;
const account_1 = require("../utils/account");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = __importDefault(require("uuid"));
const auth_1 = require("../middleware/auth");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + '../../.env' });
const SECRET_TOKEN = process.env.SECRET_TOKEN;
router.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.User.find({});
    if (!users) {
        return res
            .status(400)
            .send({ msg: "No user has been found." });
    }
    return res
        .status(200)
        .send(users);
}));
router.get('/users/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findById(req.params.id);
    if (!user) {
        return res
            .status(400)
            .send({ msg: "User not found." });
    }
    return res
        .status(200)
        .send(user);
}));
router.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findById(req.user);
    res.json({
        username: user.username,
        id: user._id
    });
}));
router.get('/activation/:activationKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { activationKey } = req.params;
    if (!activationKey) {
        return res
            .status(400)
            .send();
    }
    const user = yield User_1.User.findOne({ activationKey });
    if (!user) {
        return res
            .status(404)
            .send();
    }
    const { activatedDateTime } = user;
    if (activatedDateTime) {
        return res
            .status(404)
            .send({ msg: "This user has been activated before." });
    }
    const dateNow = Date.now().toString();
    yield User_1.User.updateOne({ activationKey }, { activatedDateTime: dateNow, lastUpdated: dateNow });
    account_1.sendActivatedEmail(user);
    return res
        .status(200)
        .send(({ msg: "Account has been activated." }));
}));
router.get('/forgot-password/:forgotToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { forgotToken } = req.params;
    const userK = yield User_1.User.findOne({ forgotToken });
    if (!forgotToken) {
        return res
            .status(400)
            .send({ msg: "Forgot token not found in the URL. Please enter your Forgot Token. " });
    }
    else if (!userK) {
        return res
            .status(400)
            .send({ msg: "No user found with the related forgot token. Empty or wrong token. " });
    }
    return res
        .status(200)
        .send();
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    const digit = /^(?=.*\d)/;
    const upperLetter = /^(?=.*[A-Z])/;
    if (!username || !email || !password) {
        return res
            .status(400)
            .send({ msg: "Please fill all the credentials. " });
    }
    if (!validator_1.default.isEmail(email) || !email) {
        return res.status(400).send({ msg: 'Please enter a valid email. ' });
    }
    if (!digit.test(password) || !upperLetter.test(password)) {
        return res
            .status(400)
            .send({ msg: "Please enter a password with at least a number and an uppercase letter." });
    }
    else if (password.length < 8) {
        return res
            .status(400)
            .send({ msg: "Please enter a password that is at least 8 characters or more." });
    }
    try {
        let userExistsByEmail = yield User_1.User.findOne({ email: email });
        let userExistsByUserName = yield User_1.User.findOne({ username: username });
        if (userExistsByEmail) {
            return res
                .status(400)
                .send({ msg: "The email is already used." });
        }
        else if (userExistsByUserName) {
            return res
                .status(400)
                .send({ msg: "Username already being used. Please enter a different username. " });
        }
        let encPassword = '';
        let theSalt = yield bcryptjs_1.default.genSalt(10);
        encPassword = yield bcryptjs_1.default.hash(password, theSalt);
        let registrationRequest = {
            username,
            email,
            password: encPassword
        };
        const user = new User_1.User(registrationRequest);
        yield user.save();
        account_1.sendConfirmationEmail(user);
        res.status(200).send('Successful registration. Please verify your email. ');
    }
    catch (e) {
        res.status(400).send(e);
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .send({ msg: "Please fill the missing fields. " });
        }
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .send({ msg: "An account with this email or username does not exists." });
        }
        else if (user && !user.activatedDateTime) {
            return res
                .status(400)
                .send({ msg: "Please activate your account from the link we've sent to your email. " });
        }
        else if (user && user.activatedDateTime) {
            const passwordCompare = yield bcryptjs_1.default.compare(password, user.password);
            if (!passwordCompare) {
                return res
                    .status(400)
                    .send({ msg: "Wrong or empty password." });
            }
            else if (passwordCompare) {
                const token = jsonwebtoken_1.default.sign({ id: user.id }, SECRET_TOKEN);
                return res
                    .status(200)
                    .json({ token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email
                    } });
            }
        }
    }
    catch (e) {
        res.status(500).send(e);
    }
}));
router.post("/tokenIsValid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("x-auth-token");
        if (!token)
            return res.json(false);
        const verified = jsonwebtoken_1.default.verify(token, SECRET_TOKEN);
        if (!verified)
            return res.json(false);
        const user = yield User_1.User.find(verified._id);
        if (!user)
            return res.json(false);
        return res.json(true);
    }
    catch (err) {
        res.status(500).json({ msg: err.message });
    }
}));
router.post("/forgot-password/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield User_1.User.findOne({ email });
    try {
        if (!validator_1.default.isEmail(email) || !email) {
            return res
                .status(400)
                .send({ msg: "Please enter a valid email. " });
        }
        else if (!user) {
            return res
                .status(404)
                .send({ msg: 'No account has been found related to that email. ' });
        }
        else if (user.forgotToken) {
            return res
                .status(400)
                .send({ msg: "Password change mail is already been sent. Please check your email." });
        }
        else if (user) {
            yield user.updateOne({ forgotToken: uuid_1.default });
            yield account_1.sendForgotPassword(user);
            return res
                .status(200)
                .send("Password change mail has been sent.");
        }
    }
    catch (e) {
        return res
            .status(500)
            .send();
    }
}));
router.post('/change-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newPassword, forgotToken } = req.body;
        const digit = /^(?=.*\d)/;
        const upperLetter = /^(?=.*[A-Z])/;
        if (!newPassword || !forgotToken) {
            return res
                .status(400)
                .send({ msg: "Please enter your new password and your forgot password key token." });
        }
        const userK = yield User_1.User.findOne({ forgotToken });
        if (!userK) {
            return res.status(400).send({
                msg: 'Token does not match. Enter the valid token.'
            });
        }
        if (newPassword && userK) {
            if (!digit.test(newPassword) || !upperLetter.test(newPassword)) {
                return res.status(400).send({
                    msg: 'Please enter at least a number and an uppercase letter with your password.',
                });
            }
            else if (newPassword.length < 8) {
                return res.status(400).send({
                    msg: 'Please enter a password that is at least 8 or more characters.',
                });
            }
            else if (digit.test(newPassword) && upperLetter.test(newPassword) && !(newPassword.length < 8)) {
                let encNewPassword = '';
                let theNewSalt = yield bcryptjs_1.default.genSalt(10);
                encNewPassword = yield bcryptjs_1.default.hash(newPassword, theNewSalt);
                yield userK.updateOne({ password: encNewPassword, forgotToken: null, activatedDateTime: null });
                return res.status(200).send("Password has been successfully changed.");
            }
        }
    }
    catch (e) {
        return res.status(500).send(e);
    }
}));
//# sourceMappingURL=User.js.map