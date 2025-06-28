-- CreateTable
CREATE TABLE `tasks_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `task_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    UNIQUE INDEX `tasks_tags_task_id_tag_id_key`(`task_id`, `tag_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tasks_tags` ADD CONSTRAINT `tasks_tags_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks_tags` ADD CONSTRAINT `tasks_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
