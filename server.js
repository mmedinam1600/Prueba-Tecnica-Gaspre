const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');
const { sequelize } = require('./db/connection');


// GLOBAL APP
const app = express();


// GLOBAL MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(logger('dev'));


//ROUTES






async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Connection to database successful.');

        const server = app.listen(process.env.PORT || 3001, () => {
            console.log(`Server started on http://localhost:${server.address().port}`);
        });

    } catch (e) {
        console.error('ERROR: \n' + e);
    }
}

startServer().then(() => {
    console.log('OK');
});