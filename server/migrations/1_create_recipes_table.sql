CREATE EXTENSION "uuid-ossp";

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  name TEXT NOT NULL
);
