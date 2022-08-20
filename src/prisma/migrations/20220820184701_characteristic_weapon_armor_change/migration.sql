/*
  Warnings:

  - Added the required column `currentDescription` to the `PlayerArmor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentDescription` to the `PlayerSpell` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentDescription` to the `PlayerWeapon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `armor` MODIFY `description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `item` MODIFY `description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `playerarmor` ADD COLUMN `currentDescription` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `playeravatar` MODIFY `link` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `playercharacteristic` ADD COLUMN `checked` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `playerextrainfo` MODIFY `value` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `playeritem` MODIFY `currentDescription` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `playernote` MODIFY `value` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `playerspell` ADD COLUMN `currentDescription` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `playerweapon` ADD COLUMN `currentDescription` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `spell` MODIFY `description` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `weapon` MODIFY `description` LONGTEXT NOT NULL;
