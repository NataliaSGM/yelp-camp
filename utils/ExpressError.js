class ExpressError extends Error {
    constructor(message, statusCode){
        super();  //--> bcs Erros is the main constructor, super it's calling its constructors?
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;