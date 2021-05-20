
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: 'ID348579_messagingappdev.db.webhosting.be',
        user: 'ID348579_messagingappdev',
        password: 'pur3r4nd0mn3ss',
        database: 'ID348579_messagingappdev',
        port: 3306,
    }
});

module.exports = knex;

