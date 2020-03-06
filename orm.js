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
    password: "",
    database: "pictures"
});

async function listThumbnails(){
    const myList = await db.query( "SELECT * FROM thumbnails left join favourites on thumbnails.id = favourites.picture_id order by thumbnails.id" );
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

async function tagSearch( tag ){
    console.log(`orm tag: ${tag}`)
    let query = `select * from thumbnails where tags like "%${tag.replace('"','').replace('"','')}%"`;
    console.log(`Query: ${query}`);
    const tagSearchPictures = await db.query(query);
    console.log(`orm search: ${JSON.stringify(tagSearchPictures)}`)
    return JSON.stringify(tagSearchPictures);


async function addFavourite( userId, picID ){
    const myFav = await db.query ("INSERT INTO favourites (user_id, pic_id) VALUES(?,?)", [ userId, picID ] );
    return myFav;
}

async function deleteFavourite( userId, picID ){
    const myFav = await db.query("DELETE FROM favourites WHERE user_id=? AND pic_id=?", [ userId, picID ] );
    return myFav;
}

}
module.exports = { 
    listThumbnails,
    saveThumbnail,
    deleteThumbnail,
    updateThumbnail,
    getThumbnail,
    tagSearch,
    addFavourite,
    deleteFavourite
}