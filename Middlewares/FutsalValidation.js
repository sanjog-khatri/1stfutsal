const Joi = require('joi');


const futsalSchema = Joi.object({
    name: Joi.string().required(),
    location: Joi.string().required(),
    priceWeekday: Joi.number().min(0).required(),
    priceSaturday: Joi.number().min(0).required(),
    format: Joi.string().valid('5A', '6A', '7A').required(),
    tournaments: Joi.array().items(Joi.string()).optional(),
    reviews: Joi.array().items(
        Joi.object({
            playerId: Joi.string().required(),
            rating: Joi.number().min(1).max(5).required(),
            comment: Joi.string().optional(),
            timestamp: Joi.date().default(Date.now)
        })
    ).optional()
});

const validateFutsal = (req, res, next) => {
    const { error } = futsalSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next(); 
};

module.exports = validateFutsal;
