"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const app = (0, express_1.default)();
const time_1 = __importDefault(require("../src/routes/time"));
const flightRoutes_1 = __importDefault(require("../src/routes/flightRoutes"));
const searchResult_1 = __importDefault(require("../src/routes/searchResult"));
app.set('view engine', 'html');
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use('/time', time_1.default);
app.use('/routes', flightRoutes_1.default);
app.use('/searchresult', searchResult_1.default);
module.exports.handler = (0, serverless_http_1.default)(app);
