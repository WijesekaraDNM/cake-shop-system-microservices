const Joi = require('joi');
const { error } = require('../utils/responseHelper');

// Custom design validation schema
const customDesignSchema = Joi.object({
  occasion: Joi.string().required().trim().max(100).messages({
    'string.empty': 'Occasion is required',
    'string.max': 'Occasion cannot exceed 100 characters'
  }),
  flavor: Joi.string().valid('vanilla', 'chocolate', 'red-velvet', 'fruit', 'cheesecake', 'carrot').required().messages({
    'any.only': 'Invalid flavor selection'
  }),
  size: Joi.string().valid('small', 'medium', 'large', 'x-large').required().messages({
    'any.only': 'Invalid size selection'
  }),
  colorScheme: Joi.string().allow('', null).max(200).messages({
    'string.max': 'Color scheme cannot exceed 200 characters'
  }),
  deliveryDate: Joi.date().iso().greater('now').required().messages({
    'date.greater': 'Delivery date must be in the future',
    'date.base': 'Invalid delivery date format'
  }),
  budget: Joi.string().valid('5000-10000', '10000-20000', '20000-30000', '30000+').required().messages({
    'any.only': 'Invalid budget range selection'
  }),
  specialRequests: Joi.string().allow('', null).max(1000).messages({
    'string.max': 'Special requests cannot exceed 1000 characters'
  }),
  price: Joi.number().min(0).optional(),
  estimatedPrice: Joi.number().min(0).optional()
});

// Status update validation schema (for admin use)
const statusUpdateSchema = Joi.object({
  status: Joi.string().valid(
    'pending', 'reviewing', 'approved', 'rejected', 
    'in-progress', 'completed', 'cancelled'
  ).required().messages({
    'any.only': 'Invalid status value'
  }),
  adminNotes: Joi.string().allow('', null).max(500).messages({
    'string.max': 'Admin notes cannot exceed 500 characters'
  }),
  estimatedPrice: Joi.number().min(0).optional().messages({
    'number.min': 'Estimated price must be positive'
  })
});

// Validation middleware for custom design
const validateCustomDesign = (req, res, next) => {
  const { error: validationError, value } = customDesignSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (validationError) {
    const errors = validationError.details.map(detail => detail.message);
    return error(res, 'Validation failed', 400, { errors });
  }

  req.body = value;
  next();
};

// Validation middleware for status update
const validateStatusUpdate = (req, res, next) => {
  const { error: validationError, value } = statusUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (validationError) {
    const errors = validationError.details.map(detail => detail.message);
    return error(res, 'Validation failed', 400, { errors });
  }

  req.body = value;
  next();
};

// Query validation for pagination and filtering
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error: validationError, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (validationError) {
      const errors = validationError.details.map(detail => detail.message);
      return error(res, 'Invalid query parameters', 400, { errors });
    }

    req.query = value;
    next();
  };
};

// Common query schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'deliveryDate', 'status').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

const designListQuerySchema = paginationSchema.keys({
  status: Joi.string().valid(
    'pending', 'reviewing', 'approved', 'rejected', 
    'in-progress', 'completed', 'cancelled'
  ).optional(),
  userId: Joi.string().optional()
});

module.exports = {
  validateCustomDesign,
  validateStatusUpdate,
  validateQuery,
  paginationSchema,
  designListQuerySchema
};