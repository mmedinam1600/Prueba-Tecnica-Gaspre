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
                SELECT
                    p.cre_id,
                    p.product,
                    p.value as value,
                    (p.value - (SELECT value FROM prices WHERE cre_id = :stationId AND product = p.product AND date = (SELECT MAX(date) FROM prices WHERE cre_id = :stationId))) AS 'price_difference'
                FROM
                    prices p
                WHERE
                    p.date = (SELECT MAX(date) FROM prices WHERE cre_id = p.cre_id)
            )
            SELECT
                s.name AS name,
                sc.distance AS distance,
                pd.product AS product,
                pd.value AS price_per_product,
                b.name AS brand,
                pd.price_difference
            FROM
                stations_competitors sc
            JOIN
                stations s ON sc.cre_id_competitor = s.cre_id
            LEFT JOIN
                price_difference pd ON s.cre_id = pd.cre_id
            LEFT JOIN
                stations_brands sb ON s.cre_id = sb.cre_id AND sb.date_report = (SELECT MAX(date_report) FROM stations_brands WHERE cre_id = s.cre_id)
            LEFT JOIN
                brands b ON sb.id_brand = b.id
            WHERE
                sc.cre_id = :stationId
            ORDER BY
                sc.distance;
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