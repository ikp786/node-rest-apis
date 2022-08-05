import express from "express";
import mongoose from "mongoose";
import path from "path";
var bodyParser = require('body-parser');
import multer from "multer";
import { APP_PORT ,DB_URL } from "./config";
import errorHandler from "./middlewares/errorHandler";
const app = express()
import routes from './routes';
var upload = multer();
// DATABASE CONNECTION
mongoose.connect(DB_URL, {
   
 });
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'))
db.once('open', () => {
    console.log('DB connected...');
});

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({extended:false}));

// for parsing multipart/form-data
// app.use(upload.array()); 
// app.use(express.static('public'));
app.use('/uploads',express.static('uploads'));

app.use(express.json());
app.use('/api', routes);

app.use(bodyParser.json());
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(errorHandler);
app.listen(APP_PORT, () => console.log(`listening on porting ${APP_PORT}`))