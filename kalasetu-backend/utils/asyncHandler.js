import { captureException } from './sentry.js';

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Capture error in Sentry
    captureException(error, {
      request: {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        user: req.user ? { id: req.user.id, email: req.user.email } : null
      }
    });
    next(error);
  });
};

export default asyncHandler;
