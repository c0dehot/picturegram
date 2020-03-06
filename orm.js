const mysql = require( 'mysql' );


class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args=[] ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
  }
// at top INIT DB connection
const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "bootcamp2020",
    database: "pictures"
});

async function listThumbnails(){
    const myList = await db.query( "SELECT * FROM thumbnails ORDER BY id" );
    return myList;
}

async function saveThumbnail( myPost ){
    const myResult = await db.query( 
        "INSERT INTO thumbnails (name,image_url,tags) VALUES(?,?,?)",
        [ myPost.name, myPost.image_url, myPost.tags ] );
    return myResult;
}

async function deleteThumbnail( id ){
    const myResult = await db.query( 
        "DELETE FROM thumbnails WHERE id=?", [ id ]
    );
    return myResult;
}

async function updateThumbnail( myEdit ){
    const myResult = await db.query( 
        "UPDATE thumbnails SET name=?,image_url=?,tags=? WHERE id=?",
        [ myEdit.name, myEdit.image_url, myEdit.tags, myEdit.id ] );
    return myResult;    
}

async function getThumbnail( myId ){
    const myData = await db.query( "SELECT * FROM thumbnails WHERE id=?", [ myId ] );
    return myData[0];
}
async function registerUser( myPost ){
    const myResult = await db.query( 
        "INSERT INTO users(first_name,last_name,email_address,user_password) VALUES(?,?,?,?)",
        [ myPost.first_name, myPost.last_name, myPost.email_address, myPost.user_password ] );
    return myResult;
}

async function checkUserStuff(checkUser) {
    const userInfo = await db.query("SELECT user_password FROM users WHERE email_address=?", [ checkUser.userEmail ] );
    return userInfo[0].user_password;

}

module.exports = { 
    listThumbnails,
    saveThumbnail,
    deleteThumbnail,
    updateThumbnail,
    getThumbnail,
    registerUser,
    checkUserStuff
}