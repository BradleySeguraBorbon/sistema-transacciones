/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "account_number" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "owner_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Account" ("account_number", "balance", "bank_code", "createdAt", "name", "phone_number") SELECT "account_number", "balance", "bank_code", "createdAt", "name", "phone_number" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_phone_number_key" ON "Account"("phone_number");
CREATE TABLE "new_Transaction" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_account_number" TEXT NOT NULL,
    "sender_bank_code" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "receiver_account_number" TEXT NOT NULL,
    "receiver_bank_code" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
