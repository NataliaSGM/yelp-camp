const Review = require('../models/review');
const Campground = require('../models/campground');
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
};

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User ({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {        //--> req.login it's a method from passaport.when an user register, we make it be logged in inmediatly, so the user doesn't have to loge in again  
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        }) 
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}
module.exports.login = (req, res) => {  //--> local is the strategy, ther ecan be several, like google or facebook
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // returnTo is a passport method
    res.redirect(redirectUrl)

 }

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}