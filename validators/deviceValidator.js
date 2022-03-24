const Joi =  require('joi');

exports.deviceValidator = (req, res, next) => {
    const {location:{ lat,lng}, owner} = req.body;
    
    const locationSchema = Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    })
    const deviceSchema  = Joi.object({
        location: locationSchema,
        owner: Joi.string().optional()
    })

    const { error } = deviceSchema.validate(req.body);

    if (error) {
        res.status(400).json({
            message: error.message
        });
    }
    next();
}