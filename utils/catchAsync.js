//-> this is a function that accepts another function
module.exports = func => {  //--> this accepts a function as an argument to pass it
    return (req, res, next) => {
        func(req, res, next).catch(next); //-> it executes that oter function and catches any error may come
    } 
}