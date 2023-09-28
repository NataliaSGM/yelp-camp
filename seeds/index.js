const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');  //--> curly braces to destructure the data and import
const Campground = require('../models/campground')  //--> two dots means back out of the folder twice in order to bea ble to read the campground.js, have he same scope?

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
}); 

const sample = array => array[Math.floor(Math.random() * array.length)]; //--> determine a formular to randomly pick an element from an array
//--> pass the array and return a random element from that array


const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i=0; i<10; i++){
        const random1000 = Math.floor(Math.random()*1000); //--> picking a city randomly, probabilty 1000?
        const price = Math.floor(Math.random()*20 + 10)
        const camp = new Campground({  //--> notice we're using the model from campgrounds.js, new allows the following format to happen (object-like)
            author: '650c1e226c23241eb0447a9c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,  //--> using the random formular to create titles
            description: "this is the photo's descrition",
            price,
            geometry:{ type: 'Point',
                     coordinates: [
                        cities[random1000].longitude,
                        cities[random1000].latitude,
                    ]
            },
            images:[
                {
                    url: 'https://res.cloudinary.com/dcrb91rud/image/upload/v1695639312/YelpCamp/ieyetgtjmav2srbaswzu.jpg',
                    filename: 'YelpCamp/ieyetgtjmav2srbaswzu',
                },
                {
                    url: 'https://res.cloudinary.com/dcrb91rud/image/upload/v1695639315/YelpCamp/fioepgasoq4ng7chttsz.jpg',
                    filename: 'YelpCamp/fioepgasoq4ng7chttsz'
                }
            ],
        })
        await camp.save();
    }
}; 

seedDB().then(() => {
    mongoose.connection.close();
});

//--> why close? 1). It leads the connection memory leakage.

// // 2). If application server/web server is shut down, connection will
//  remain activate even though the user logs out.

// // 3) .Suppose database server has 100 connections available and 100
//  end users are requesting for the connection. If the database sever
//   grants all of them, and after their usage they are not closed, the 
//   database server would not be able to provide a connections for another request.
//    For that reason we need to close them - it is mandatory.

// // We should close all connections in finally block so that whether exception
//  occurs or not finally block will execute and connection will close.