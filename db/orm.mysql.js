const mysql = require( 'mysql' );
const bcrypt = require ( 'bcrypt' );
const saltRounds = 10;

class Database {
   constructor( config ) {
      this.connection = mysql.createConnection( config );
   }
   query( sql, args=[] ) {
      return new Promise( ( resolve, reject ) => {
         this.connection.query( sql, args, ( err, rows ) => {
            if ( err ) {
               return reject( err );
            }
            resolve( rows );
         } );
      } );
   }
   close() {
      return new Promise( ( resolve, reject ) => {
         this.connection.end( err => {
            if ( err ) {
               return reject( err );
            }
            resolve();
         } );
      } );
   }
}
// at top INIT DB connection
const db = new Database({
   host: 'localhost',
   port: 3306,
   user: 'root',
   password: process.env.DB_PWD,
   database: process.env.DB_NAME
});

// listThumbnails with tagSearch too
async function listThumbnails( userId, tag = '' ){
   //tag =  tag.replace(/\"/g,'');
   console.log(`userId = ${userId} tag = ${tag}`);
   const sql = `SELECT thumbnails.*,favourites.picture_id FROM thumbnails left join favourites ON (thumbnails.id = favourites.picture_id AND favourites.user_id='${userId}') `+( tag ? `WHERE tags LIKE "%${tag}%" ` : '' )+'ORDER BY id';
   const myDbList = await db.query( sql );

   // now clean up the list and return relevant data in camelCase
   let myList = [];
   myDbList.forEach( function( item ){
      myList.push({
         thumbId: item.id,
         name: item.name,
         imageUrl: item.image_url,
         tags: item.tags,
         creationTime: item.creation_time,
         isFavourite: item.picture_id
      });
   });
   return myList;
}

async function saveThumbnail( myPost ){
   const myResult = await db.query(
      'INSERT INTO thumbnails (name,image_url,tags) VALUES(?,?,?)',
      [ myPost.name, myPost.imageUrl, myPost.tags ] );
   return myResult;
}

async function deleteThumbnail( thumbId ){
   const myResult = await db.query(
      'DELETE FROM thumbnails WHERE id=?', [ thumbId ]
   );
   return myResult;
}

async function updateThumbnail( thumbData ){
   const myResult = await db.query(
      'UPDATE thumbnails SET name=?,image_url=?,tags=? WHERE id=?',
      [ thumbData.name, thumbData.imageUrl, thumbData.tags, thumbData.thumbId ] );
   return myResult;
}

async function getThumbnail( thumbId ){
   const myData = await db.query( 'SELECT * FROM thumbnails WHERE id=?', [ thumbId ] );
   if( !myData ) {
      return false;
   } else {
      return {
         thumbId: myData[0].id,
         name: myData[0].name,
         imageUrl: myData[0].image_url,
         tags: myData[0].tags,
         creationTime: myData[0].creation_time
      };
   }
}

async function registerUser( userData ){
//* Encryption: (MD5 // SHA2 // BLOWFISH // ...)
   //* ===========
   //* 1. Userpassword: test123
   //* 2. Adding-Salt: sdfsfd
   //* 3. Final password: test123_sdfsfd
   //* 4. Generate the encrypted password: *(SDF)98(*DSFHJKL#RWSFD)
   //
   //* LOGIN Attempt
   //* =============
   //* Give password: 'test123'
   //* 1. System appends salt: test123_sdfsdf
   //* 2. System hashes user password with salt: hash('test123_sdfsfd') --> *(SDF)98(*DSFHJKL#RWSFD)
   //* 3. Checks if this hashed password matches what's in database.
   //* -->   sdfsfd|(ENCRYPTEDPASSWORD)
   const passwordHash = await bcrypt.hash(userData.userPassword, saltRounds);
   console.log( `[registerUser] (hash=${passwordHash}) req.body:`, userData );
   const myResult = await db.query(
      'INSERT INTO users(first_name,last_name,email_address,user_password) VALUES(?,?,?,?)',
      [ userData.firstName, userData.lastName, userData.emailAddress, passwordHash ] );
   return myResult.insertId ? myResult.insertId : false;
}

async function loginUser( email, password ) {
   const userFetch = await db.query('SELECT * FROM users WHERE email_address=?', [ email ] );
   console.log( `[loadUser] email='${email}' userFetch:`, userFetch );
   if( !userFetch ) {
      return false;
   }

   const isValidPassword = await bcrypt.compare( password, userFetch[0].user_password );
   console.log( ` [loginUser] checking password (password: ${password} ) hash(${userFetch[0].user_password})`, isValidPassword );
   if( !isValidPassword ) {
      return false;
   }
   // remap the data into the specified fields as we are using camelCase
   const userData = {
      userId: userFetch[0].id,
      firstName: userFetch[0].first_name,
      lastName: userFetch[0].last_name,
      emailAddress: userFetch[0].email_address,
      creationTime: userFetch[0].creation_time
   };
   return userData;
}

async function addFavourite( userId, picID ){
   const myFav = await db.query ('REPLACE INTO favourites (user_id, picture_id) VALUES(?,?)', [ userId, picID ] );
   return myFav ? true : false;
}

async function deleteFavourite( userId, picID ){
   const myFav = await db.query('DELETE FROM favourites WHERE user_id=? AND picture_id=?', [ userId, picID ] );
   return myFav ? true : false;
}

module.exports = {
   listThumbnails,
   saveThumbnail,
   deleteThumbnail,
   updateThumbnail,
   getThumbnail,
   addFavourite,
   deleteFavourite,
   registerUser,
   loginUser
};