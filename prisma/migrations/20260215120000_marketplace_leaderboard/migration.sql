-- Marketplace purchases in ledger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'LedgerKind'
      AND e.enumlabel = 'marketplace_purchase'
  ) THEN
    ALTER TYPE "LedgerKind" ADD VALUE 'marketplace_purchase';
  END IF;
END
$$;

ALTER TABLE "User" DROP COLUMN IF EXISTS "contributorPercentile";
