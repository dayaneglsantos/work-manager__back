-- CreateTable
CREATE TABLE `password_resets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `purpose` ENUM('passwordReset', 'passwordCreation') NOT NULL DEFAULT 'passwordReset',
    `code_hash` VARCHAR(191) NOT NULL,
    `code_expires_at` DATETIME(3) NOT NULL,
    `code_attempts` INTEGER NOT NULL DEFAULT 0,
    `verified_at` DATETIME(3) NULL,
    `reset_token_hash` VARCHAR(191) NULL,
    `reset_token_expires_at` DATETIME(3) NULL,
    `used_at` DATETIME(3) NULL,
    `invalidated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `password_resets_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
