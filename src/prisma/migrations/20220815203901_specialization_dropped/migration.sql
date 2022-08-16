/*
  Warnings:

  - You are about to drop the column `specialization_id` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the `specialization` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `Skill_specialization_id_fkey`;

-- AlterTable
ALTER TABLE `skill` DROP COLUMN `specialization_id`;

-- DropTable
DROP TABLE `specialization`;
