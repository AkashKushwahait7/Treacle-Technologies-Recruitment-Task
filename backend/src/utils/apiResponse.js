/**
 * Standardized API Response Utilities
 */

export const successResponse = (res, data = {}, message = null, statusCode = 200) => {
  const payload = {
    success: true,
    data,
  };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message,
  };
  if (errors && process.env.NODE_ENV === 'development') {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};
