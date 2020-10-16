var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.getImageUrl = (cookie) => {
    return db.query(`SELECT signature FROM signatures WHERE id = ${cookie} `);
};

exports.addSignature = (first, last, signature, time) => {
    // console.log(first, last, signature, time);
    return db.query(
        `
        INSERT INTO signatures (first, last, signature, time)
        VALUES ($1, $2, $3, $4) RETURNING id
    `,
        [first, last, signature, time]
    );
};

exports.countSignatures = () => {
    return db.query(`SELECT count(*) FROM signatures`);
};
