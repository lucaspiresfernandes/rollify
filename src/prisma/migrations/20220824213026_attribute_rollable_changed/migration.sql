/*
  Warnings:

  - You are about to alter the column `rollable` on the `attribute` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum("Attribute_rollable")`.

*/
-- AlterTable
ALTER TABLE `attribute` MODIFY `rollable` ENUM('VALUE', 'MAX_VALUE') NULL;
