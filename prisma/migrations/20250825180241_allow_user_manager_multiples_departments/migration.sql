-- DropForeignKey
ALTER TABLE `departments` DROP FOREIGN KEY `departments_manager_id_fkey`;

-- DropIndex
DROP INDEX `departments_manager_id_key` ON `departments`;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_action_id_fkey_new` FOREIGN KEY (`action_id`) REFERENCES `permission_actions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
