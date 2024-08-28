const Joi = require('joi');

const playerSignupValidation = (req, res, next) => {
    console.log('Validating player signup request:', req.body);
    const schema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error('Player signup validation failed:', error.details);
        return res.status(400)
            .json({ message: "Bad request", error: error.details });
    }

    console.log('Player signup validation successful');
    next();
}

const playerLoginValidation = (req, res, next) => {
    console.log('Validating player login request:', req.body);
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error('Player login validation failed:', error.details);
        return res.status(400)
            .json({ message: "Bad request", error: error.details });
    }

    console.log('Player login validation successful');
    next();
}

const ownerSignupValidation = (req, res, next) => {
    console.log('Validating owner signup request:', req.body);
    const schema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error('Owner signup validation failed:', error.details);
        return res.status(400)
            .json({ message: "Bad request", error: error.details });
    }

    console.log('Owner signup validation successful');
    next();
}

const ownerLoginValidation = (req, res, next) => {
    console.log('Validating owner login request:', req.body);
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(50).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        console.error('Owner login validation failed:', error.details);
        return res.status(400)
            .json({ message: "Bad request", error: error.details });
    }

    console.log('Owner login validation successful');
    next();
}

module.exports = {
    playerSignupValidation,
    playerLoginValidation,
    ownerLoginValidation,
    ownerSignupValidation
}
