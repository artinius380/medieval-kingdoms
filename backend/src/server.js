const express = require('express');
const cors = require('cors');

const playerRoutes = require('./routes/playerRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const cityRoutes = require('./routes/cityRoutes');

const {
    validatePlayer
} = require('./middleware/playerMiddleware');

const {
    validateCityOwnership
} = require('./middleware/cityMiddleware');

const errorHandler = require('./middleware/errorHandler');

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());


// ========================================
// RUTAS GENERALES
// ========================================

app.get('/', (req, res) => {

    res.send(
        'Medieval Kingdoms Backend funcionando!'
    );

});


// ========================================
// TEST DATABASE
// ========================================

app.get('/test-db', async (req, res, next) => {

    try {

        const pool =
            require('./config/database');

        const [rows] =
            await pool.query(
                'SELECT 1 AS resultado'
            );

        res.json(rows);

    } catch (error) {

        next(error);

    }

});


// ========================================
// RUTAS DE JUGADORES
// ========================================

app.use(
    '/api/players/:playerId',
    validatePlayer,
    playerRoutes
);


// ========================================
// RUTAS DE CIUDADES
// ========================================

app.use(
    '/api',
    cityRoutes
);

// ========================================
// Rutas de edificaciones de una ciudad
// ========================================

app.use(
    '/api/players/:playerId/cities/:cityId/buildings',

    validatePlayer,

    validateCityOwnership,

    buildingRoutes
);


// ========================================
// MIDDLEWARE GLOBAL DE ERRORES
// ========================================

app.use(errorHandler);


// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {

    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );

});