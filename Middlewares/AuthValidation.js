const Joi = require('joi');

const playerSignupValidation = (req, res, next) =>{
    const schema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()


    });

    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400)
            .json({message: "Bad request", error})
    }
    next();
}   

const playerLoginValidation = (req, res, next) =>{
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()
    });

    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400)
            .json({message: "Bad request", error})
    }
    next();
}  

const ownerSignupValidation = (req, res, next) =>{
    const schema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()


    });

    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400)
            .json({message: "Bad request", error})
    }
    next();
}   

const ownerLoginValidation = (req, res, next) =>{
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()
    });

    const {error} = schema.validate(req.body);
    if(error) {
        return res.status(400)
            .json({message: "Bad request", error})
    }
    next();
}  

module.exports = {
    playerSignupValidation,
    playerLoginValidation,
    ownerLoginValidation,
    ownerSignupValidation
}