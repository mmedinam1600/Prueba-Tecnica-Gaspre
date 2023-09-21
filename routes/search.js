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

        const ref = await sequelize.query(`SELECT location_x, location_y FROM stations WHERE cre_id = '${stationId}';`, {
            type: QueryTypes.SELECT,
        });

        const { location_x, location_y } = ref[0];

        const query = `
            WITH reference_gas as (
                SELECT
                    s.cre_id,
                    p.value as price,
                    p.product
                FROM prueba.stations s
                JOIN prueba.prices p ON p.cre_id = s.cre_id
                WHERE s.cre_id = :stationId
            )
            SELECT s.cre_id,
                   s.name,
                   s.location_x,
                   s.location_y,
                   SQRT(POW(location_x - :location_x , 2) + POW(location_y - :location_y, 2)) AS distance,
                   p.value as prices,
                   p.product as product,
                   p.id as price_id,
                   b.name as brand,
                   sb.id as station_brands_id,
                   round(p.value - rg.price, 2) as price_difference
            FROM stations s
            JOIN prueba.prices p ON p.cre_id = s.cre_id
            JOIN prueba.stations_brands sb ON sb.cre_id = s.cre_id
            JOIN prueba.brands b on b.id = sb.id_brand
            JOIN reference_gas rg ON rg.product = p.product
            WHERE s.cre_id != :stationId
            ORDER BY distance
            LIMIT 10000;
        `;

        const stations = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: { stationId: stationId, location_x, location_y }
        });


        res.status(200).json(stations);
    } catch (e) {
        console.error(`An error occurred while processing the GET /search path Error: ${e.message}`);
        res.status(400).json({ 'error': `${e.message}` });
        throw new Error(`An error occurred while processing the GET /search path Error: ${e.message}`);
    }
});

module.exports = router;