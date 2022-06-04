const Joi =  require('joi');

exports.updateHostStautusValidator = (req, res, next) => {

    const hostReqSchema  = Joi.object({
        userId:Joi.string().required(),
        hostReqId:Joi.string().required(),
        status:Joi.string().valid('VERIFIED','REJECTED')
    })

    const { error } = hostReqSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.message
        });
    }
    next();
}