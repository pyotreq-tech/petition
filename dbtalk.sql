-- DROP TABLE IF EXISTS signatures;
-- DROP TABLE IF EXISTS users;

-- Check if user can post limited chars

-- CREATE TABLE signatures (
--      id SERIAL PRIMARY KEY,
--      signature TEXT NOT NULL CHECK (signature != ''),
--      userid INTEGER NOT NULL UNIQUE REFERENCES users(id),
--      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE users (
--      id SERIAL PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (last != ''),
--      email VARCHAR NOT NULL UNIQUE CHECK (email != ''),
--      password VARCHAR NOT NULL CHECK (password != ''),
--      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--      admin VARCHAR
-- );


-- UPDATE users SET admin = 'true' WHERE id = 1;
