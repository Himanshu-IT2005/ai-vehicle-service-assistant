const errorHandler = (err, req, res, next) => {
    console.error("Centralized Error Caught:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = errorHandler;
