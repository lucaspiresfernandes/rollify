/*
  Warnings:

  - Made the column `ammo` on table `weapon` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `weapon` MODIFY `ammo` INTEGER NOT NULL;
