CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  endpoint TEXT,
  ts TEXT,
  req_method TEXT,
  req_headers TEXT,
  req_body TEXT,
  res_status INTEGER,
  res_headers TEXT,
  res_body TEXT
);

