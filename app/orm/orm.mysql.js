/************************
 * MySQL can be switched in. The beauty of an ORM abstraction is that the
 * underlying database is not relevant and can be changed: this is one reason
 * we use abstraction in building our solutions.
 */

const mysql = require( 'mysql' );
const bcrypt = require ( 'bcrypt' );

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

// input : userId, tag*
// output: <array> [{imageId, name, imageUrl, tags, creationTime, isFavourite }]
async function listImages( userId, tag = '' ){
    //tag =  tag.replace(/\"/g,'');
    console.log(`userId = ${userId} tag = ${tag}`);
    const sql = `SELECT images.*,favourites.picture_id FROM images left join favourites ON (images.id = favourites.picture_id AND favourites.user_id='${userId}') `+( tag ? `WHERE tags LIKE "%${tag}%" ` : '' )+'ORDER BY id';
    const myDbList = await db.query( sql );

    // now clean up the list and return relevant data in camelCase
    let myList = [];
    myDbList.forEach( function( item ){
        myList.push({
            imageId: item.id,
            title: item.title,
            imageUrl: item.image_url,
            tags: item.tags,
            creationTime: item.creation_time,
            isFavourite: item.picture_id ? true : false /* MUST be false if not valid */
        });
    });
    return myList;
}

// input: <object> { name, imageUrl, tags }
// output: imageId on success, false otherwise
async function saveImage( myPost ){
    const myResult = await db.query(
        'INSERT INTO images (title,image_url,tags) VALUES(?,?,?)',
        [ myPost.title, myPost.imageUrl, myPost.tags ] );
    return myResult;
}

// input: imageId, <object> { name, imageUrl, tags }
// output: imageId on success or false
async function updateImage( imageId, imageData ){
    const myResult = await db.query(
        'UPDATE images SET title=?,image_url=?,tags=? WHERE id=?',
        [ imageData.title, imageData.imageUrl, imageData.tags, imageId ] );
    return myResult;
}

// input: { imageId }
// output: boolean on success
async function deleteImage( imageId ){
    const myResult = await db.query(
        'DELETE FROM images WHERE id=?', [ imageId ]
    );
    return myResult;
}

// input: imageId
// output: { imageId, name, imageUrl, tags, creationTime } || false
async function getImage( imageId ){
    const dbData = await db.query( 'SELECT * FROM images WHERE id=?', [ imageId ] );
    if( !dbData ) {
        return false;
    } else {
        return {
            imageId: dbData[0].id,
            title: dbData[0].title,
            imageUrl: dbData[0].image_url,
            tags: dbData[0].tags,
            creationTime: dbData[0].creation_time
        };
    }
}

// input: <object> { firstName, lastName, emailAddress, userPassword }
// output: userId
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
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.userPassword, saltRounds);
    console.log( `[registerUser] (hash=${passwordHash}) req.body:`, userData );
    const myResult = await db.query(
        'INSERT INTO users(first_name,last_name,email_address,user_password) VALUES(?,?,?,?)',
        [ userData.firstName, userData.lastName, userData.emailAddress, passwordHash ] );
    return myResult.insertId ? myResult.insertId : false;
}

// input: email, password
// output: <object> { userId, firstName, lastName, emailAddress, creationTime } || false
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

// input: userId, imageId
// output: boolean on success
async function addFavourite( userId, imageId ){
    const myFav = await db.query ('REPLACE INTO image_favs (user_id, picture_id) VALUES(?,?)', [ userId, imageId ] );
    return myFav ? true : false;
}

// input: userId, imageId
// output: boolean on success
async function deleteFavourite( userId, imageId ){
    const myFav = await db.query('DELETE FROM image_favs WHERE user_id=? AND picture_id=?', [ userId, imageId ] );
    return myFav ? true : false;
}

module.exports = {
    listImages,
    saveImage,
    deleteImage,
    updateImage,
    getImage,
    addFavourite,
    deleteFavourite,
    registerUser,
    loginUser
};