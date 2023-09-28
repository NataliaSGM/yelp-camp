if (process.env.NODE_ENV !== 'production') {   //--> production refers to when the app is deployed -- run in developpement mode or production mode
    require('dotenv').config() //-> require dotenv package where the variable like 'secret' are stored and added tehm to process.env, and call the confi function
}; //require is always going to run bcs we are in developement monde, so we can have acces to dotenv, when in production that file will be ignored



const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const Campground = require('./models/campground');
const Review = require('./models/review');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoDBStore = require('connect-mongo')(session);

const dbUrl= process.env.DB_URL    //--> this one connects to atlas, it allows the production state
// const dbUrl= 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect( dbUrl , {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
}); 

const app = express();

app.engine('ejs', ejsMate); //--> use the ejsMate engine instead of the default engine from ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true})); //--> this allows the body of the post request to be accesible (in this case it will be displayed in the screen), by default it's not in express
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public'))); //--> stablishing the paths to acces the statics folder 'public'

const store = new MongoDBStore({
    url: dbUrl,
    secret:'thisisasecret',
    touchAfter: 24 * 60 * 60 //-> automatically save and update the session, in miliseconds (24hours, 60mnutes, 60 seconds equals seconds)
})

store.on('error', function(e) {
    console.log('session store ERROR', e)
})

const sessionConfig = {
    store,
    name: 'session',  // --> change the default name of the session to add a layer of security. it changes the name of the cookie
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true, 
    cookie:{  
        httpOnly: true,  //--> this means the cookie cannot be accessed through client side script, the browser will no reveal the cookie to the third party
        // secure:true, --> says that cookies only work on https, even if the user is logged on, if the website was not requested trhough a secure chanel(https), the user wont get to make any modifications to the campground they created. 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //--> this is the math to calculate one week starting the moment the cookie was sent
        maxAge: 1000 * 60 * 60 * 24 * 7 //--> 1000 milisecond in  a second, 60 seconds in a minute, etc
    }
} 
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcrb91rud/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session()); //--> make sure the user is logged in and not ask for password at each request
passport.use(new LocalStrategy(User.authenticate())); //--> use the authenticate method from the localStrategy of Passport on the User model

passport.serializeUser(User.serializeUser()); //--> how to store the user in the session 
passport.deserializeUser(User.deserializeUser()); //--> how to remove the user of the sesson

app.use((req, res, next) => {  //-> before handlers / on everysingle request we take whaever is in the flag under success and have access to it in the locals and have access under the key 'success' 
    res.locals.currentUser = req.user; //--> req.user is a passaport function that return the info about the user
    res.locals.success = req.flash('success'); //-> this allows access to the templates automatically
    res.locals.error = req.flash('error')
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);




app.get('/', (req, res) =>{
    res.render('home')
}); 

app.all('*', (req, res, next) => {  //--> this takes all the request when none of the avobe was picked up. all means all request, * means eve
    next (new ExpressError('Page Not Found', 404)); //--> next is sending the error to the next handling error function
});

app.use((err, req, res, next) =>{ //--> this is the error handler, all of the errors from previos request end up triggering this function, to display their particularities ( status code and respective message)
    const {StatusCode = 500} = err//--> deconstructing from error status and message
    if(!err.message) err.message = 'Something went wrong'
    res.status(StatusCode).render('error', { err })
})


app.listen(3000, () => {
    console.log("serving on port 3000")
})