ALTER TABLE recipes
ADD COLUMN body JSONB NOT NULL DEFAULT '{"blocks":[],"entityMap":{}}'::jsonb;
