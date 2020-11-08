# schema.sql
CREATE database picturegram;
USE picturegram;

CREATE TABLE images (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    tags VARCHAR(255) NOT NULL,
    creation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME ON UPDATE CURRENT_TIMESTAMP
);

DROP table image_favs;
CREATE TABLE image_favs (
  picture_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  PRIMARY key(picture_id,user_id)
);

DROP table users;
CREATE TABLE users(
id int NOT NULL AUTO_INCREMENT,
first_name varchar(50) NOT NULL,
last_name varchar(50) NOT NULL,
email_address varchar(50) NOT NULL,
user_password varchar(250) NOT NULL,
creation_time datetime DEFAULT CURRENT_TIMESTAMP,
update_time datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (id)
);

# seed.sql
INSERT INTO images (title,image_url,tags) VALUES('Dude','https://cdn.quotesgram.com/img/70/46/2076036230-omg-shocked-dog.jpg','shocked,confused,drooling');
INSERT INTO images (title,image_url,tags) VALUES('Cleo','https://slacktiverse.files.wordpress.com/2013/03/fuzzy-white-kitten-with-stubby-legs-from-sam_ayye-sam-pertsas.jpg', 'cute,innocent,bleached');
INSERT INTO images (title,image_url,tags) VALUES('Happy Fox','https://2.bp.blogspot.com/-A6zpgJXpJDY/T6kxsH2kgsI/AAAAAAAACzA/lUd2PDu5oxA/s1600/zen+fox+smiling+animal+beautiful+nature+photo+photography+happiness+joy+inspiration+life.jpg', 'happy,fox,orange');
INSERT INTO images (title,image_url,tags) VALUES('Serene Deer','http://i.ebayimg.com/images/i/380873307832-0-1/s-l1000.jpg','serene,deer,nature' );

