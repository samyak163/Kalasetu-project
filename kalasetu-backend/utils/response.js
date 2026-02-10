export const success = (res, data, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const created = (res, data, message = 'Created') => {
  return success(res, data, message, 201);
};

export const error = (res, message, statusCode = 400, errors = undefined) => {
  return res.status(statusCode).json({ success: false, message, errors });
};
