const Joi =  require('joi');

exports.deviceValidator = (req, res, next) => {
    const {location:{ lat,lng}, owner} = req.body;
    
    const locationSchema = Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
    })
    const deviceSchema  = Joi.object({
        location: locationSchema,
        owner: Joi.string().required(),
        code: Joi.string().required(),
        rate: Joi.number().required()
    })

    const { error } = deviceSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.message
        });
    }
    next();
}