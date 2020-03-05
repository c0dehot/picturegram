# schema.sql
CREATE database pictures;
USE pictures;

CREATE TABLE thumbnails (
	id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    tags VARCHAR(255) NOT NULL,
    creation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME ON UPDATE CURRENT_TIMESTAMP
);


# seed.sql
INSERT INTO thumbnails (name,image_url,tags) VALUES('Dude','https://cdn.quotesgram.com/img/70/46/2076036230-omg-shocked-dog.jpg','shocked,confused,drooling');
INSERT INTO thumbnails (name,image_url,tags) VALUES('Cleo','https://slacktiverse.files.wordpress.com/2013/03/fuzzy-white-kitten-with-stubby-legs-from-sam_ayye-sam-pertsas.jpg', 'cute,innocent,bleached');
INSERT INTO thumbnails (name,image_url,tags) VALUES('Happy Fox','https://2.bp.blogspot.com/-A6zpgJXpJDY/T6kxsH2kgsI/AAAAAAAACzA/lUd2PDu5oxA/s1600/zen+fox+smiling+animal+beautiful+nature+photo+photography+happiness+joy+inspiration+life.jpg', 'happy,fox,orange');
INSERT INTO thumbnails (name,image_url,tags) VALUES('Serene Deer','http://i.ebayimg.com/images/i/380873307832-0-1/s-l1000.jpg','serene,deer,nature' );

