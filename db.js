var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.getImageUrl = (cookie) => {
    return db.query(`SELECT signature FROM signatures WHERE id = ${cookie} `);
};

module.exports.getIfSignature = (id) => {
    return db.query(`SELECT * FROM signatures WHERE userid IN
    (SELECT id FROM users WHERE id = ${id})`);
};

exports.getUserData = (email) => {
    return db.query(`SELECT * FROM users WHERE email = '${email}' `);
};

exports.addSignature = (first, last, signature, time, userid) => {
    return db.query(
        `
        INSERT INTO signatures (first, last, signature, time, userid)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `,
        [first, last, signature, time, userid]
    );
};
exports.addUser = (first, last, email, password, time) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password, time)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
    `,
        [first, last, email, password, time]
    );
};

exports.getUserPassword = (email) => {
    return db.query(`SELECT password FROM users WHERE email = '${email}'`);
};

exports.countSignatures = () => {
    return db.query(`SELECT count(*) FROM signatures`);
};

exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signatures WHERE id = $1`, [id]);
};
