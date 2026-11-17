// ============================================================
// CONEXIÓN A SQL SERVER
// ============================================================
// Antes el proyecto usaba mysql2. Este archivo expone la MISMA
// interfaz que usaban los servicios, para no tener que reescribirlos:
//
//   const [rows]   = await pool.query(sql, params);
//   const [result] = await pool.query('INSERT ...');  // result.insertId
//   const conn = await pool.getConnection();
//   await conn.beginTransaction(); conn.query(...); conn.commit();
//   conn.rollback(); conn.release();
//
// Internamente traduce lo que es propio de MySQL:
//   - Parámetros  ?           -> @mk_param0, @mk_param1, ... (no @p1: choca con el driver ODBC)
//   - FOR UPDATE              -> se quita (SQL Server no lo usa así)
//   - result.insertId         -> SCOPE_IDENTITY()
//   - BIGINT / DECIMAL        -> se devuelven como Number
//
// Dos formas de conectarse (se elige en el .env):
//   DB_TRUSTED_CONNECTION=true  -> Autenticación de Windows (como en SSMS)
//   DB_TRUSTED_CONNECTION=false -> usuario y contraseña de SQL Server
// ============================================================

require('dotenv').config();

const useWindowsAuth =
    String(process.env.DB_TRUSTED_CONNECTION).toLowerCase() === 'true';

// Con autenticación de Windows se usa el driver ODBC (msnodesqlv8);
// con usuario/contraseña se usa tedious (el driver por defecto).
const sql = useWindowsAuth
    ? require('mssql/msnodesqlv8')
    : require('mssql');


// ========================================
// Configuración
// ========================================

const server = process.env.DB_SERVER || 'localhost';
const instance = process.env.DB_INSTANCE || '';
const database = process.env.DB_NAME || 'medieval_kingdoms';

let config;

if (useWindowsAuth) {

    const driver =
        process.env.DB_ODBC_DRIVER || 'ODBC Driver 17 for SQL Server';

    const serverName = instance
        ? `${server}\\${instance}`
        : server;

    config = {
        connectionString:
            `Driver={${driver}};` +
            `Server=${serverName};` +
            `Database=${database};` +
            'Trusted_Connection=yes;' +
            'TrustServerCertificate=yes;',
        options: {
            // Las fechas se guardan y se leen en hora local,
            // igual que SYSDATETIME() en la base de datos.
            useUTC: false
        }
    };

} else {

    config = {
        server,
        database,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
        options: {
            instanceName: instance || undefined,
            encrypt: false,
            trustServerCertificate: true,
            useUTC: false
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };

}


// Un solo pool para toda la aplicación.
const poolPromise =
    new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
            console.log(
                `Conectado a SQL Server (${useWindowsAuth ? 'Windows' : 'SQL'}): ${server}${instance ? '\\' + instance : ''} / ${database}`
            );
            return pool;
        })
        .catch(error => {
            console.error(
                'No se pudo conectar a SQL Server:',
                error.message
            );
            throw error;
        });

// Evita "unhandled rejection" si la conexión falla;
// el error se vuelve a lanzar en cada consulta.
poolPromise.catch(() => {});


// ========================================
// Traducir consulta MySQL -> T-SQL
// ========================================

function translateQuery(text) {

    let index = 0;

    let translated = text
        .replace(/\bFOR\s+UPDATE\b/gi, '')
        .replace(/\?/g, () => `@mk_param${index++}`);

    const isInsert = /^\s*INSERT\s/i.test(translated);

    if (isInsert && !/\bOUTPUT\b/i.test(translated)) {
        translated +=
            ';\nSELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS insertId;';
    }

    return {
        text: translated,
        paramCount: index,
        isInsert
    };
}


// Columnas que tedious/ODBC devuelven como texto
// y que el código espera como número.
const NUMERIC_TYPES = new Set([
    sql.BigInt,
    sql.Decimal,
    sql.Numeric,
    sql.Money,
    sql.SmallMoney
]);

function normalizeRows(recordset) {

    if (!recordset) {
        return [];
    }

    const columns = recordset.columns || {};

    const numericColumns =
        Object.keys(columns).filter(name =>
            NUMERIC_TYPES.has(columns[name].type)
        );

    if (numericColumns.length === 0) {
        return Array.from(recordset);
    }

    return recordset.map(row => {

        for (const name of numericColumns) {
            if (row[name] !== null && row[name] !== undefined) {
                row[name] = Number(row[name]);
            }
        }

        return row;
    });
}


// ========================================
// Fechas: se envían como texto en hora LOCAL
// ========================================
// El driver ODBC guarda los Date de JavaScript en UTC
// (5 horas adelantados en Lima), pero los lee como hora
// local. Eso hacía que el juego viera la última
// actualización "en el futuro" y restara recursos.

function pad(n, size = 2) {
    return String(n).padStart(size, '0');
}

function toSqlValue(value) {

    if (!(value instanceof Date)) {
        return value;
    }

    return (
        `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}` +
        `T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}` +
        `.${pad(value.getMilliseconds(), 3)}`
    );
}


// ========================================
// Ejecutar una consulta
// ========================================
// Devuelve lo mismo que mysql2:
//   SELECT -> [rows]
//   INSERT/UPDATE/DELETE -> [{ insertId, affectedRows }]

async function runQuery(request, text, params = []) {

    const query = translateQuery(text);

    if (query.paramCount !== params.length) {
        throw new Error(
            `La consulta tiene ${query.paramCount} parámetros (?) pero se enviaron ${params.length}.`
        );
    }

    params.forEach((value, i) => {
        request.input(`mk_param${i}`, toSqlValue(value));
    });

    const result = await request.query(query.text);

    const isSelect =
        /^\s*(SELECT|WITH)\s/i.test(text);

    if (isSelect) {
        return [normalizeRows(result.recordset), []];
    }

    const affectedRows =
        (result.rowsAffected || []).reduce((a, b) => a + b, 0);

    let insertId = 0;

    if (query.isInsert && result.recordset && result.recordset.length > 0) {
        insertId = Number(result.recordset[0].insertId) || 0;
    }

    return [
        {
            insertId,
            affectedRows
        },
        []
    ];
}


// ========================================
// Interfaz compatible con mysql2
// ========================================

const pool = {

    async query(text, params) {

        const connectedPool = await poolPromise;

        return runQuery(
            connectedPool.request(),
            text,
            params
        );
    },

    async getConnection() {

        const connectedPool = await poolPromise;

        let transaction = null;

        return {

            async beginTransaction() {
                transaction = new sql.Transaction(connectedPool);
                await transaction.begin();
            },

            async query(text, params) {
                const request = transaction
                    ? new sql.Request(transaction)
                    : connectedPool.request();

                return runQuery(request, text, params);
            },

            async commit() {
                if (transaction) {
                    await transaction.commit();
                    transaction = null;
                }
            },

            async rollback() {
                if (transaction) {
                    try {
                        await transaction.rollback();
                    } catch (error) {
                        // La transacción ya pudo haberse
                        // cancelado por el propio error.
                    }
                    transaction = null;
                }
            },

            release() {
                // El pool de mssql administra las conexiones solo.
            }
        };
    }
};


module.exports = pool;
module.exports.translateQuery = translateQuery;
