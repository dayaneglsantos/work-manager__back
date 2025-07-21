/*
  Warnings:

  - You are about to drop the column `referenced_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `referenced_type` on the `comments` table. All the data in the column will be lost.
  - Added the required column `reference_type` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `comments_referenced_type_referenced_id_idx` ON `comments`;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `referenced_id`,
    DROP COLUMN `referenced_type`,
    ADD COLUMN `reference_id` INTEGER NULL,
    ADD COLUMN `reference_type` ENUM('task', 'post') NOT NULL;

-- CreateIndex
CREATE INDEX `comments_reference_type_reference_id_idx` ON `comments`(`reference_type`, `reference_id`);
