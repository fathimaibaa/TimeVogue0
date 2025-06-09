const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session')
require('dotenv').config()
const bodyParser = require('body-parser');

const passport = require('passport')
const connectMongo = require('connect-mongo')
const mongoose = require('mongoose')
const connectFlash = require('connect-flash')
const nocache = require('nocache')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override');

const adminRoute = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute');
const dataBase = require('./config/dataBase')
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const multer=require('multer');
const sharp=require('sharp');


const app = express();
dataBase.dbConnect();



app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const storage =multer.memoryStorage()
const upload=multer({storage})



const MongoStore = connectMongo(session);
const store = new MongoStore({ mongooseConnection: mongoose.connection });


app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
        },
        store: store
    })
);


app.use(connectFlash());
app.use((req, res, next) => {
    res.locals.messages = req.flash()
    next();
})





app.use(passport.initialize())
app.use(passport.session())
require('./utility/passportAuth')


app.use((req, res, next) => {
    res.locals.user = req.user;
    next()
})




app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "/public/admin"));

app.use(expressLayouts)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.use(methodOverride('_method'));





app.use('/admin', adminRoute)
app.use('/', userRoute);


app.use(notFound);
app.use(errorHandler);




const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${process.env.PORT}`)
})
module.exports = app;




