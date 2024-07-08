BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	"admin"	INTEGER NOT NULL CHECK("admin" IN (0, 1)),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "tickets" (
	"ticket_id"	INTEGER,
	"state"	TEXT NOT NULL,
	"category"	TEXT,
	"owner_id"	INTEGER,
	"title"	TEXT NOT NULL,
	"ticket_timestamp"	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("ticket_id" AUTOINCREMENT),
	FOREIGN KEY("owner_id") REFERENCES "users"("id")
);
CREATE TABLE IF NOT EXISTS "textblock" (
	"textblock_id"	INTEGER,
	"ticket_id"	INTEGER NOT NULL,
	"textblock_timestamp"	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	"author"	INTEGER,
	"text"	TEXT NOT NULL,
	PRIMARY KEY("textblock_id" AUTOINCREMENT),
	FOREIGN KEY("author") REFERENCES "users"("id"),
	FOREIGN KEY("ticket_id") REFERENCES "tickets"("ticket_id")
);
INSERT INTO "users" VALUES (1,'Mario Rossi','mariorossi@gmail.com','0eb64110ccfdc5197e08f64b7aa90d5572e34db3704ff93a84072d47daeda597','96a0f4e845fc918f5400b4e92ed0d345',0);
INSERT INTO "users" VALUES (2,'Luca Gironi','lucagironi@gmail.com','e2d154a84fc9a8bb626cd4e53b83c9586aac6ab4951a3a38d262549c29f263af','cef0009f306c0743825d0a4d82b936cd',0);
INSERT INTO "users" VALUES (3,'Martina Mesiano
','martinamesiano@gmail.com','944a92a9005c710c1b8680de4ebdbf9bf6f02f52d50036e71b740288bbff4e32','cc87df425167e7e0d33555d096e11c2b',0);
INSERT INTO "users" VALUES (4,'Alessandro Quarta','alessandroquarta@gmail.com','4205f4b997488026ed0875355ef55dfeb63a3aefc3955a34e9b9c146655cc24c','2cafabadd7d7fadf9c8e41c65133e45f',1);
INSERT INTO "users" VALUES (5,'Filippo Carano','filippocarano@gmail.com','cd0aa683aee7f04a79fc35558562584d5636f8f5913ac3a6bb3d87692f78d0e3','1d68f9281e66b5b48e54b4978507da3a',1);
INSERT INTO "tickets" VALUES (1,'open','maintenance',1,'System Crash on Login','2024-06-14 08:43:29');
INSERT INTO "tickets" VALUES (2,'closed','new feature',2,'Feature Request: Dark Mode','2024-06-14 08:43:29');
INSERT INTO "tickets" VALUES (3,'open','administrative',3,'Unable to Reset Password','2024-06-14 08:43:29');
INSERT INTO "tickets" VALUES (6,'open','inquiry',1,'Inquiry about product','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (7,'closed','maintenance',2,'Maintenance request','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (8,'open','new feature',3,'New feature request','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (9,'closed','administrative',4,'Administrative issue','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (10,'open','payment',5,'Payment issue','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (11,'closed','inquiry',1,'Another inquiry','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (12,'open','maintenance',2,'Another maintenance request','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (13,'closed','new feature',3,'Another new feature request','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (14,'open','administrative',4,'Another administrative issue','2024-06-19 14:46:07');
INSERT INTO "tickets" VALUES (15,'closed','payment',5,'Another payment issue','2024-06-19 14:46:07');
INSERT INTO "textblock" VALUES (1,1,'2024-06-14 08:46:56',1,'Mario: Investigating the login issue, will update soon.');
INSERT INTO "textblock" VALUES (2,2,'2024-06-14 08:46:56',2,'Luca: The dark mode feature is scheduled for the next release.');
INSERT INTO "textblock" VALUES (3,3,'2024-06-14 08:46:56',3,'Martina: Password reset email is not being sent. Looking into it.');
INSERT INTO "textblock" VALUES (4,3,'2024-06-14 08:46:56',1,'Mario: Checked the email server, everything seems fine. Need more details.');
INSERT INTO "textblock" VALUES (5,1,'2024-06-19 18:04:05',2,'Luca: I noticed an error in the log, I am trying to solve it.');
INSERT INTO "textblock" VALUES (6,2,'2024-06-19 18:04:05',3,'Martina: I have implemented dark mode, it will be available in the next release.');
INSERT INTO "textblock" VALUES (7,3,'2024-06-19 18:04:05',1,'Mario: I have solved the problem with the password reset email.');
INSERT INTO "textblock" VALUES (8,1,'2024-06-19 18:04:05',4,'Alessandro: I tested the login, it seems to work correctly now.');
INSERT INTO "textblock" VALUES (9,2,'2024-06-19 18:04:05',5,'Filippo: I tested the dark mode, it looks great.');
INSERT INTO "textblock" VALUES (10,3,'2024-06-19 18:04:05',2,'Luca: I received the password reset email, it seems to work.');
INSERT INTO "textblock" VALUES (11,1,'2024-06-19 18:04:05',3,'Martina: I verified the fix for the login, everything is ok.');
INSERT INTO "textblock" VALUES (12,2,'2024-06-19 18:04:05',1,'Mario: I verified the dark mode, everything is ok.');
INSERT INTO "textblock" VALUES (13,3,'2024-06-19 18:04:05',4,'Alessandro: I verified the fix for the password reset email, everything is ok.');
INSERT INTO "textblock" VALUES (14,1,'2024-06-19 18:04:05',5,'Filippo: I closed the ticket for the login issue, solved.');
INSERT INTO "textblock" VALUES (15,6,'2024-06-19 18:05:25',2,'Luca: I noticed an error in the database, I am trying to solve it.');
INSERT INTO "textblock" VALUES (16,7,'2024-06-19 18:05:25',3,'Martina: I have implemented the new feature, it will be available in the next release.');
INSERT INTO "textblock" VALUES (17,8,'2024-06-19 18:05:25',1,'Mario: I have solved the problem with the server downtime.');
INSERT INTO "textblock" VALUES (18,9,'2024-06-19 18:05:25',4,'Alessandro: I tested the new feature, it seems to work correctly now.');
INSERT INTO "textblock" VALUES (19,10,'2024-06-19 18:05:25',5,'Filippo: I tested the server, it is up and running.');
INSERT INTO "textblock" VALUES (20,11,'2024-06-19 18:05:25',2,'Luca: I received the server downtime report, it seems to be working now.');
INSERT INTO "textblock" VALUES (21,12,'2024-06-19 18:05:25',3,'Martina: I verified the fix for the database error, everything is ok.');
INSERT INTO "textblock" VALUES (22,13,'2024-06-19 18:05:25',1,'Mario: I verified the new feature, everything is ok.');
INSERT INTO "textblock" VALUES (23,14,'2024-06-19 18:05:25',4,'Alessandro: I verified the fix for the server downtime, everything is ok.');
INSERT INTO "textblock" VALUES (24,15,'2024-06-19 18:05:25',5,'Filippo: I closed the ticket for the database issue, solved.');
COMMIT;
