-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "account_number" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "bank_code" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "owner_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Account" ("account_number", "balance", "bank_code", "createdAt", "name", "owner_id", "phone_number") SELECT "account_number", "balance", "bank_code", "createdAt", "name", "owner_id", "phone_number" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_phone_number_key" ON "Account"("phone_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
