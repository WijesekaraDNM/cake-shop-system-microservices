const Joi = require('joi');

const validateCartItem = (req, res, next) => {
  const schema = Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).default(1)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateQuantityUpdate = (req, res, next) => {
  const schema = Joi.object({
    quantity: Joi.number().integer().min(0).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = {
  validateCartItem,
  validateQuantityUpdate
};