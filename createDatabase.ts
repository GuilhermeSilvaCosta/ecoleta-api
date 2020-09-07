require('dotenv').config();

import knex from 'knex';

const connection = knex({
    client: 'pg',
    connection: {
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        user : process.env.PG_USER,
        password : process.env.PG_PASSWORD,
        database : 'postgres'
    },
    useNullAsDefault: true,
})

connection.raw(`CREATE DATABASE ${process.env.PG_DATABASE} TEMPLATE template0`)
    .then(() => {
        connection.destroy();
        console.log('database created');
    });