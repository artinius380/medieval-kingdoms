const fs = require('fs');
const path = require('path');

function errorHandler(error, req, res, next) {

    console.error(error);

    // Guarda el error en backend/logs/error.log para revisarlo
    try {
        const dir = path.join(__dirname, '..', '..', 'logs');
        fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(
            path.join(dir, 'error.log'),
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n${error.stack || error}\n${JSON.stringify(error.originalError || error.precedingErrors || '', null, 2)}\n\n`
        );
    } catch (e) {}

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