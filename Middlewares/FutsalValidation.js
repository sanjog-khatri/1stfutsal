const Joi = require('joi');

const futsalSchema = Joi.object({
    name: Joi.string().required(),
    location: Joi.string().required(),
    priceWeekday: Joi.number().min(0).required(),
    priceSaturday: Joi.number().min(0).required(),
    format: Joi.string().valid('5A', '6A', '7A').required(),
    openingTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(), // Pattern for 'HH:mm'
    closingTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(), // Pattern for 'HH:mm'
    slotDuration: Joi.number().min(1).required(), // Ensure slotDuration is a positive number
    tournaments: Joi.array().items(Joi.string()),
    reviews: Joi.array().items(Joi.object({
        playerId: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string(),
        timestamp: Joi.date()
    })),
    contact: Joi.string().required() 
});

const validateFutsal = (req, res, next) => {
    const { error } = futsalSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

module.exports = validateFutsal;
