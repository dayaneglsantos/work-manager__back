/*
  Warnings:

  - You are about to drop the column `reference_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `reference_type` on the `comments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `comments_reference_type_reference_id_idx` ON `comments`;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `reference_id`,
    DROP COLUMN `reference_type`,
    ADD COLUMN `task_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
