/**
 * Standardized response helper functions
 */

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const error = (res, message = 'An error occurred', statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.details = details;
  }

  // Log error for debugging (in production, use proper logging)
  if (statusCode >= 500) {
    console.error('Server Error:', {
      message,
      statusCode,
      details,
      timestamp: response.timestamp
    });
  }

  return res.status(statusCode).json(response);
};

const paginated = (res, data, pagination, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  });
};

const created = (res, data, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

const updated = (res, data, message = 'Resource updated successfully') => {
  return success(res, data, message, 200);
};

const deleted = (res, message = 'Resource deleted successfully') => {
  return success(res, null, message, 200);
};

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

const unauthorized = (res, message = 'Unauthorized access') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Access forbidden') => {
  return error(res, message, 403);
};

const badRequest = (res, message = 'Bad request', details = null) => {
  return error(res, message, 400, details);
};

const validationError = (res, errors) => {
  return error(res, 'Validation failed', 422, { errors });
};

module.exports = {
  success,
  error,
  paginated,
  created,
  updated,
  deleted,
  notFound,
  unauthorized,
  forbidden,
  badRequest,
  validationError
};