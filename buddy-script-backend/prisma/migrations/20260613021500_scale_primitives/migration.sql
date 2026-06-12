CREATE TABLE "outbox_events" (
  "id" BIGSERIAL PRIMARY KEY,
  "event_name" TEXT NOT NULL,
  "aggregate_id" BIGINT NOT NULL,
  "payload" JSONB NOT NULL,
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "outbox_events_processed_at_created_at_id_idx"
  ON "outbox_events"("processed_at", "created_at", "id");

CREATE INDEX "outbox_events_event_name_created_at_idx"
  ON "outbox_events"("event_name", "created_at");

CREATE TABLE "counter_deltas" (
  "id" BIGSERIAL PRIMARY KEY,
  "target_type" TEXT NOT NULL,
  "target_id" BIGINT NOT NULL,
  "field_name" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "applied_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "counter_deltas_applied_at_created_at_id_idx"
  ON "counter_deltas"("applied_at", "created_at", "id");

CREATE INDEX "counter_deltas_target_type_target_id_field_name_applied_at_idx"
  ON "counter_deltas"("target_type", "target_id", "field_name", "applied_at");

ALTER TABLE "outbox_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "counter_deltas" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "outbox_events" FROM anon, authenticated;
REVOKE ALL ON TABLE "counter_deltas" FROM anon, authenticated;

REVOKE ALL ON SEQUENCE "outbox_events_id_seq" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "counter_deltas_id_seq" FROM anon, authenticated;
