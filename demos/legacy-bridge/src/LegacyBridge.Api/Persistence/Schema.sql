PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS runs (
    run_id TEXT PRIMARY KEY,
    input_hash TEXT NOT NULL UNIQUE,
    orders_hash TEXT NOT NULL,
    payments_hash TEXT NOT NULL,
    rule_version TEXT NOT NULL,
    created_at_utc TEXT NOT NULL,
    dry_run INTEGER NOT NULL,
    summary_json TEXT NOT NULL,
    result_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_runs_created_at ON runs(created_at_utc DESC);

CREATE TABLE IF NOT EXISTS staged_orders (
    run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    payload_json TEXT NOT NULL,
    PRIMARY KEY (run_id, row_number)
);

CREATE TABLE IF NOT EXISTS staged_payments (
    run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    payload_json TEXT NOT NULL,
    PRIMARY KEY (run_id, row_number)
);

CREATE TABLE IF NOT EXISTS matches (
    run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
    match_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    PRIMARY KEY (run_id, match_id)
);

CREATE TABLE IF NOT EXISTS exceptions (
    run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
    exception_id TEXT NOT NULL,
    exception_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    PRIMARY KEY (run_id, exception_id)
);

CREATE INDEX IF NOT EXISTS ix_exceptions_type ON exceptions(run_id, exception_type);

CREATE TABLE IF NOT EXISTS planned_actions (
    run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
    action_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    PRIMARY KEY (run_id, action_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
    event_id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES runs(run_id) ON DELETE CASCADE,
    request_id TEXT NOT NULL,
    occurred_at_utc TEXT NOT NULL,
    outcome TEXT NOT NULL,
    dry_run INTEGER NOT NULL,
    input_hash TEXT NOT NULL,
    rule_version TEXT NOT NULL,
    actor TEXT NOT NULL,
    detail_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_audit_run ON audit_events(run_id, occurred_at_utc);
