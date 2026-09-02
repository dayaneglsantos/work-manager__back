ALTER TABLE `profiles`
    ADD COLUMN `full_access` BOOLEAN NOT NULL DEFAULT false;

UPDATE `profiles`
SET `full_access` = true
WHERE `name` = 'Admin';

CREATE TABLE `system_owner` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_owner_user_id_key`(`user_id`),
    CONSTRAINT `system_owner_singleton` CHECK (`id` = 1),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `system_owner` (`id`, `user_id`, `created_at`, `updated_at`)
SELECT 1, `users`.`id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `users`
INNER JOIN `profiles` ON `profiles`.`id` = `users`.`profile_id`
WHERE `profiles`.`full_access` = true
ORDER BY `users`.`id` ASC
LIMIT 1;

ALTER TABLE `system_owner`
    ADD CONSTRAINT `system_owner_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
