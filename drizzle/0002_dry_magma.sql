CREATE TABLE `valor1775_otps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`code` varchar(6) NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `valor1775_otps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `valor1775_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp,
	`ipAddress` varchar(64),
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `valor1775_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `valor1775_subscribers_email_unique` UNIQUE(`email`)
);
