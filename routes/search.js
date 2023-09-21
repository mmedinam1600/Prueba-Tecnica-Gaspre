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
        //
        // sequelize.query(`SET @ref_x = (SELECT location_x FROM stations WHERE cre_id = '${stationId}');`);
        // sequelize.query(`SET @ref_y = (SELECT location_y FROM stations WHERE cre_id = '${stationId});`);

        const query = `
            WITH reference_gas as (
                SELECT
                    s.cre_id,
                    p.value as price,
                    p.product
                FROM prueba.stations s
                JOIN prueba.prices p ON p.cre_id = s.cre_id
                WHERE s.cre_id = 'PL/10001/EXP/ES/2015'
            )
            SELECT s.cre_id,
                   s.name,
                   s.location_x,
                   s.location_y,
                   SQRT(POW(location_x - (SELECT location_x FROM stations WHERE cre_id = 'PL/10001/EXP/ES/2015'), 2) + POW(location_y - (SELECT location_y FROM stations WHERE cre_id = 'PL/10001/EXP/ES/2015'), 2)) AS distance,
                   p.value as prices,
                   p.product as product,
                   p.id as price_id,
                   b.name as brand,
                   sb.id as station_brands_id,
                   p.value - rg.price as difference
            FROM stations s
            JOIN prueba.prices p ON p.cre_id = s.cre_id
            JOIN prueba.stations_brands sb ON sb.cre_id = s.cre_id
            JOIN prueba.brands b on b.id = sb.id_brand
            JOIN reference_gas rg ON rg.product = p.product
            WHERE s.cre_id != 'PL/10001/EXP/ES/2015'
            ORDER BY distance
            LIMIT 10000;
        `;

        const stations = await sequelize.query(query, {
            raw: true,
            type: QueryTypes.SELECT,
            replacements: { stationId: stationId}
        });


        res.status(200).json(stations);
    } catch (e) {
        console.error(`An error occurred while processing the GET /search path Error: ${e.message}`);
        res.status(400).json({ 'error': `${e.message}` });
        throw new Error(`An error occurred while processing the GET /search path Error: ${e.message}`);
    }
});

module.exports = router;