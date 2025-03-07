export const globalErrorHandler = (err, req, res, next) => {
    const status = err.cause || 500
     res.status(status).json({ message: err.message, stack: err.stack });
 }