CREATE TABLE member_icons(icon_id SERIAL PRIMARY KEY,icon_name varchar(24) UNIQUE NOT NULL, icon_path varchar(100) UNIQUE NOT NULL);
CREATE TABLE members(member_id SERIAL PRIMARY KEY NOT NULL,member_name varchar(128) UNIQUE NOT NULL,member_email varchar(64) UNIQUE NOT NULL,member_password varchar(200) NOT NULL, member_joined DATE NOT NULL, member_icon smallint NOT NULL default 1); 
INSERT INTO member_icons(icon_name,icon_path)VALUES('default','assets/icons/default.jpeg');
INSERT INTO member_icons(icon_name,icon_path)VALUES('Veteran Dog','assets/icons/animal2.png');
INSERT INTO member_icons(icon_name,icon_path)VALUES('Challenge Fox','assets/icons/animal1.png');
CREATE TABLE member_description(member_id integer REFERENCES members(member_id),description varchar(800));
CREATE TABLE member_posts(member_id integer REFERENCES members(member_id),post_id SERIAL PRIMARY KEY,post_body varchar(1600) NOT NULL, post_title varchar(200) NOT NULL, post_time time NOT NULL);
CREATE TABLE member_replies(member_id integer REFERENCES members(member_id),post_id INTEGER REFERENCES member_posts(post_id),post_body varchar(1600) NOT NULL, post_time time NOT NULL);
