function errorHandler(error, req, res, next) {

    console.error(error);

    if (error.statusCode) {
        return res.status(error.statusCode).json({
            error: error.message
        });
    }

    res.status(500).json({
        error: 'Error interno del servidor'
    });
}

module.exports = errorHandler;