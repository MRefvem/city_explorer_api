DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7)
);

INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ('los angeles', 'Los Angeles, Los Angeles County, California, USA', '34.0536909', '-118.2427666');
SELECT * FROM locations;