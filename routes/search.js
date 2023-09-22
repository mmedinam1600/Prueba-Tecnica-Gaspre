const express = require('express');
const router = express.Router();
const { sequelize } = require('../db/connection');
const { QueryTypes } = require('sequelize');

/**
 * Route http://localhost:3000/search
 * Description. Obtener los sig puntos de tu estación y de los competidores cercanos.
 */
router.get('/', async(req, res) => {
    try {
        const { stationId } = req.query;

        const query = `
            WITH price_difference AS (
                -- Se calcula todas las diferencias en precios de todas las estaciones con sus respectivos productos
                SELECT
                    p.cre_id,
                    p.product,
                    p.value as value,
                    (
                        p.value -
                        -- Obtenemos el precio del producto y de la id de la estacion, el precio debe ser el ultimo registrado
                        (SELECT value FROM prices WHERE cre_id = :stationId AND product = p.product AND date = (SELECT MAX(date) FROM prices WHERE cre_id = :stationId))
                    ) AS price_difference
                FROM
                    prices p
                WHERE
                    -- Obtenemos el ultimo precio o el mas reciente
                    p.date = (SELECT MAX(date) FROM prices WHERE cre_id = p.cre_id)
            )
            SELECT
                s.name AS name,
                sc.distance AS distance,
                pd.product AS product,
                pd.value AS price_per_product,
                b.name AS brand,
                pd.price_difference
            FROM stations_competitors sc
            -- Para obtener el nombre del competidor
            JOIN stations s ON sc.cre_id_competitor = s.cre_id
            -- Obtenemos el producto, su valor y la diferencia del precio en esa estacion (Es un left join ya que puede que algunos productos no los vendan en esa estacion)
            LEFT JOIN price_difference pd ON s.cre_id = pd.cre_id
            -- Obtenemos las marcas que venden en esa estacion, y solo obtenemos la marca mas reciente, me imagino que en una estacion se pueden cambiar las marcas.
            LEFT JOIN stations_brands sb ON s.cre_id = sb.cre_id AND sb.date_report = (SELECT MAX(date_report) FROM stations_brands WHERE cre_id = s.cre_id)
            -- Obtenemos el nombre de la marca
            LEFT JOIN brands b ON sb.id_brand = b.id
            -- Solo seleccionamos las gasolineras que son competidoras de nuestra estacion
            WHERE sc.cre_id = :stationId
            -- Se ordena ascendentemente la distancia para saber cuales son las gasolineras mas cercanas a la nuestra
            ORDER BY sc.distance;
        `;

        const stations = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { stationId: stationId }
        });


        res.status(200).json(stations);
    } catch (e) {
        console.error(`An error occurred while processing the GET /search path Error: ${e.message}`);
        res.status(400).json({ 'error': `${e.message}` });
        throw new Error(`An error occurred while processing the GET /search path Error: ${e.message}`);
    }
});

module.exports = router;