ALTER TABLE recipes
DROP COLUMN body;

ALTER TABLE recipes
ADD COLUMN body_html TEXT NOT NULL DEFAULT '';

ALTER TABLE recipes
ADD COLUMN body_plain_text TEXT NOT NULL DEFAULT '';
