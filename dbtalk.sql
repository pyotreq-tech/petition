-- Check if user can post limited chars


-- DROP TABLE IF EXISTS signatures CASCADE;
-- CREATE TABLE signatures (
--      id SERIAL PRIMARY KEY,
--      signature TEXT NOT NULL CHECK (signature != ''),
--      userid INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
--      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- DROP TABLE IF EXISTS users CASCADE;
-- CREATE TABLE users (
--      id SERIAL PRIMARY KEY,
--      first VARCHAR NOT NULL CHECK (first != ''),
--      last VARCHAR NOT NULL CHECK (last != ''),
--      email VARCHAR NOT NULL UNIQUE CHECK (email != ''),
--      password VARCHAR NOT NULL CHECK (password != ''),
--      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--      admin VARCHAR
-- );

-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- CREATE TABLE user_profiles(
--     id SERIAL PRIMARY KEY,
--     age INT,
--     city VARCHAR(255),
--     url VARCHAR(255),
--     userid INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
-- );




-- UPDATE users SET admin = 'true' WHERE id = 1;

