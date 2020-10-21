var spicedPg = require("spiced-pg");

//we can add that data from secret.json alternatively

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

// module.exports.getSignatures = () => {
//     return db.query(`SELECT * FROM signatures`);
// };

module.exports.getSignatures = () => {
    //SELECT *, but then it does not change the columns name and they may duplicate
    //rewrite to main table be signatures
    //lowercase sql Andrea
    return db.query(`SELECT users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url, signatures.id AS id
    FROM signatures
    JOIN users
    ON signatures.userid = users.id
    LEFT OUTER JOIN user_profiles
    ON signatures.userid = user_profiles.userid;
    `);
};

module.exports.getUserDataForUpdate = (id) => {
    return db.query(
        `SELECT users.first AS first, users.last AS last, users.email AS email, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
    FROM users
    LEFT OUTER JOIN user_profiles
    ON users.id = user_profiles.userid
    WHERE users.id = $1
    `,
        [id]
    );
};

module.exports.getSignaturesCity = (city) => {
    //SELECT *, but then it does not change the columns name and they may duplicate
    //rewrite to main table be signatures
    //lowercase sql Andrea notes part 4
    //google city autocomplete??
    return db.query(
        `SELECT users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url, signatures.id AS id
    FROM signatures

    JOIN users

    ON signatures.userid = users.id

    LEFT OUTER JOIN user_profiles

    ON signatures.userid = user_profiles.userid

    WHERE city = $1;
    `,
        [city]
    );
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

exports.updateUsers = (id, first, last, email) => {
    return db.query(`UPDATE users SET first = '${first}' WHERE id = '${id}' ;
    UPDATE users SET last = '${last}' WHERE id = '${id}';
    UPDATE users SET email = '${email}' WHERE id = '${id}';
    `);
};

exports.upsertUsers = (age, city, url, userid) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, userid)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (userid)
    DO UPDATE SET age = $1, city = $2, url = '$3';
    `,
        [age || null, city, url, userid]
    );
};

exports.addSignature = (signature, userid) => {
    return db.query(
        `
        INSERT INTO signatures (signature, userid)
        VALUES ($1, $2) RETURNING id
    `,
        [signature, userid]
    );
};
exports.addUser = (first, last, email, password) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4) RETURNING id
    `,
        [first, last, email, password]
    );
};
exports.addUserProfile = (age, city, url, userid) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, userid)
        VALUES ($1, $2, $3, $4) RETURNING id
    `,
        [age || null, city, url, userid]
    );
};

// exports.getUserPassword = (email) => {
//     return db.query(`SELECT password FROM users WHERE email = '${email}'`);
// };

exports.countSignatures = () => {
    return db.query(`SELECT count(*) FROM signatures`);
};

exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signatures WHERE id = $1`, [id]);
};

// SQL injection for ALL requests
