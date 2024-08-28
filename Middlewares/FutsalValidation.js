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
    // No ownerId here, as it's handled in the controller
});

const validateFutsal = (req, res, next) => {
    console.log('Validating futsal data:', req.body); // Log the data being validated
    const { error } = futsalSchema.validate(req.body, { abortEarly: false }); // Validate with abortEarly set to false for all errors

    if (error) {
        console.error('Validation error:', error.details.map(err => err.message).join(', ')); // Log all validation errors
        return res.status(400).json({
            message: 'Validation error',
            errors: error.details.map(err => err.message) // Include all validation errors in the response
        });
    }

    console.log('Validation successful. Proceeding to next middleware.');
    next(); 
};

module.exports = validateFutsal;
