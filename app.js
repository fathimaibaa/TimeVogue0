const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');

const passport = require('passport');
const mongoose = require('mongoose');
const connectFlash = require('connect-flash');
const nocache = require('nocache');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');

const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const multer = require('multer');
const sharp = require('sharp');

const app = express();


// ✅ Direct MongoDB connection here
mongoose.connect("mongodb+srv://fathimaibaa:dtNwrHMosy3lRTAy@cluster0.j50ma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => {
  console.error("❌ Error connecting to MongoDB:", err.message);
  process.exit(1);
});


// Middlewares
app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const storage = multer.memoryStorage();
const upload = multer({ storage });


// ✅ Updated connect-mongo (new API)
const store = MongoStore.create({
  mongoUrl: "mongodb+srv://fathimaibaa:dtNwrHMosy3lRTAy@cluster0.j50ma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  collectionName: "sessions",
});

app.use(
  session({
    secret: "poiuytrewq",   // 🔑 your session secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
    store: store,
  })
);


// Flash messages
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});


// Passport
app.use(passport.initialize());
app.use(passport.session());
require('./utility/passportAuth');

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


// Static + Views
app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "/public/admin"));

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));


// Routes
app.use('/admin', adminRoute);
app.use('/', userRoute);


// Error handlers
app.use(notFound);
app.use(errorHandler);


// Server
const PORT = 4000;   // ✅ Hardcoded port instead of .env
app.listen(PORT, () => {
  console.log(`🚀 Server Started on http://localhost:${PORT}`);
});

module.exports = app;
