CREATE TABLE days (
  date DATE PRIMARY KEY,
  lunch_id UUID,
  dinner_id UUID,
  CONSTRAINT fk_lunch FOREIGN KEY (lunch_id) REFERENCES recipes (id),
  CONSTRAINT fk_dinner FOREIGN KEY (dinner_id) REFERENCES recipes (id)
);
