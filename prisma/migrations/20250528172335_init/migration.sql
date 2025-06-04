-- CreateTable
CREATE TABLE "Bank" (
    "bank_code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Account" (
    "account_number" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender_account_number" INTEGER NOT NULL,
    "sender_bank_code" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "receiver_account_number" INTEGER NOT NULL,
    "receiver_bank_code" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "amount_value" REAL NOT NULL,
    "amount_currency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hmac_md5" TEXT NOT NULL
);
