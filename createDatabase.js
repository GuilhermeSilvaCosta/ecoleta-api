"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var knex_1 = __importDefault(require("knex"));
var connection = knex_1.default({
    client: 'pg',
    connection: {
        host: process.env.PG_HOST,
        port: Number(process.env.PG_PORT),
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: 'postgres'
    },
    useNullAsDefault: true,
});
connection.raw("CREATE DATABASE " + process.env.PG_DATABASE + " TEMPLATE template0")
    .then(function () {
    connection.destroy();
    console.log('database created');
});
