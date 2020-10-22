DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS weather;
DROP TABLE IF EXISTS trails;

CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    lat FLOAT8,
    lon FLOAT8,
    query VARCHAR(255),
    name VARCHAR(255)
);

CREATE TABLE weather (
    id SERIAL PRIMARY KEY,
    forecast VARCHAR(255),
    date DATE,
    lat FLOAT8,
    lon FLOAT8
);

CREATE TABLE trails (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    location VARCHAR(255),
    lat FLOAT8,
    lon FLOAT8,
    length FLOAT4,
    stars FLOAT4,
    votes INT,
    summary VARCHAR(255),
    url VARCHAR(255),
    conditions VARCHAR(255),
    conditionDate DATE,
    conditionTime TIME
);