-- DROP TABLE IF EXISTS signatures;
-- DROP TABLE IF EXISTS users;

-- Check if user can post limited chars

-- CREATE TABLE signatures (
--      id SERIAL PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (last != ''),
--      signature TEXT NOT NULL CHECK (signature != ''),
--      time TIMESTAMP,
--      userid NUMERIC
-- );

-- CREATE TABLE users (
--      id SERIAL PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (last != ''),
--      email VARCHAR NOT NULL CHECK (email != ''),
--      password VARCHAR NOT NULL CHECK (password != ''),
--      time TIMESTAMP,
--      admin VARCHAR
-- );


-- UPDATE users SET admin = 'true' WHERE id = 2;
