-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_department_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_profile_id_fkey`;

-- DropIndex
DROP INDEX `users_department_id_key` ON `users`;

-- DropIndex
DROP INDEX `users_profile_id_key` ON `users`;


