-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_account_number" TEXT NOT NULL,
    "sender_bank_code" TEXT,
    "sender_name" TEXT,
    "receiver_account_number" TEXT NOT NULL,
    "receiver_bank_code" TEXT,
    "receiver_name" TEXT,
    "amount_value" REAL NOT NULL,
    "amount_currency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hmac_md5" TEXT NOT NULL
);
INSERT INTO "new_Transaction" ("amount_currency", "amount_value", "description", "hmac_md5", "receiver_account_number", "receiver_bank_code", "receiver_name", "sender_account_number", "sender_bank_code", "sender_name", "timestamp", "transaction_id") SELECT "amount_currency", "amount_value", "description", "hmac_md5", "receiver_account_number", "receiver_bank_code", "receiver_name", "sender_account_number", "sender_bank_code", "sender_name", "timestamp", "transaction_id" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
