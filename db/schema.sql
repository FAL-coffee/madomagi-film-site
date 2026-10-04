BEGIN;
CREATE TABLE IF NOT EXISTS film_posts (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title varchar(80) NOT NULL, caption varchar(1000) NOT NULL DEFAULT '', name varchar(40) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), width integer NOT NULL, height integer NOT NULL,
  image bytea NOT NULL, visible boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS film_likes (
  film_id integer NOT NULL REFERENCES film_posts(id) ON DELETE CASCADE,
  browser uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(film_id,browser)
);
CREATE TABLE IF NOT EXISTS film_reports (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  film_id integer NOT NULL REFERENCES film_posts(id) ON DELETE CASCADE,
  reason varchar(80) NOT NULL, browser uuid NOT NULL, resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(film_id,browser)
);
CREATE TABLE IF NOT EXISTS film_rate_limits (key text PRIMARY KEY, count integer NOT NULL, reset_at timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS film_visibility_date ON film_posts(visible,id DESC);
CREATE INDEX IF NOT EXISTS film_unresolved_reports ON film_reports(resolved,created_at);
ALTER TABLE film_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_rate_limits ENABLE ROW LEVEL SECURITY;
COMMIT;
