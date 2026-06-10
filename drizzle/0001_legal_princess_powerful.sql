CREATE TABLE `nova_reign_otps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`code` varchar(6) NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nova_reign_otps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nova_reign_vault` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp,
	`ageVerified` boolean NOT NULL DEFAULT false,
	`ipAddress` varchar(64),
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nova_reign_vault_id` PRIMARY KEY(`id`),
	CONSTRAINT `nova_reign_vault_email_unique` UNIQUE(`email`)
);
