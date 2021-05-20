
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: 'ID348579_messagingapp.db.webhosting.be',
        user: 'ID348579_messagingapp',
        password: 'pur3r4nd0mn3ss',
        database: 'ID348579_messagingapp',
        port: 3306,
    }
});

module.exports = knex;

