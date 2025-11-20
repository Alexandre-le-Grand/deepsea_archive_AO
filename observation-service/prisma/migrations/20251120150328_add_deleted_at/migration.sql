-- CreateTable
CREATE TABLE `Species` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `rarityScore` DOUBLE NOT NULL DEFAULT 1.0,
    `family` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `subSpecies` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Species_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Observation` (
    `id` VARCHAR(191) NOT NULL,
    `speciesId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('PENDING', 'VALIDATED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `validatedBy` VARCHAR(191) NULL,
    `validatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Observation` ADD CONSTRAINT `Observation_speciesId_fkey` FOREIGN KEY (`speciesId`) REFERENCES `Species`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
