const bcrypt = require( 'bcrypt' );
const db = require( './models' );


// input: <object> { firstName, lastName, emailAddress, userPassword }
// output: userId
async function registerUser( userData ){
    // hint: look at https://mongoosejs.com/docs/api.html#model_Model.create
    console.log( '[registerUser] data passed by form (to write to DB): ', userData );

    // save hashed password
    const passwordHash = await bcrypt.hash(userData.userPassword.trim(), 10);
    userData.userPassword = passwordHash;
    userData.emailAddress = userData.emailAddress.toLowerCase();

    const result = await db.users.create(userData);

    console.log( '[registerUser] complete save result: ', result );
    return result._id;
}

// input: email, password
// output: <object> { userId, firstName, lastName, emailAddress, createdAt} || false
async function loginUser( email, password ) {
    // load user-info (for email)
    if( !email || !password ){
        console.log( '[loginUser] invalid email/password' );
        return false;
    }
    const result = await db.users.findOne( { emailAddress: email.toLowerCase() } );
    console.log( '[loginUser] result from email search: ', result, !result );

    // check if users password is same as servers
    if( !result || !result.userPassword ){
        console.log( ' .. x sorry could not find a user with that email!');
        return false;
    } else {
        const isValidPassword = await bcrypt.compare( password.trim(), result.userPassword );
        console.log( ` [loginUser] checking password (password: ${password} ) hash(${result.userPassword})`, isValidPassword );
        if( !isValidPassword ) {
            console.log( '[loginUser] invalid password, hashes do not match!' );
            return false;
        }
    }

    console.log( ' .. yah! password is valid, let\'s login!');
    const userData = {
        userId:         result._id,
        firstName:      result.firstName,
        lastName:       result.lastName,
        emailAddress:   result.emailAddress,
        createdAt:      ''
    };
    console.log( '[loginUser] complete, returning with userData' );
    return userData;
}

async function addImageFav( userId, imageId ){
    const result = await db.users.findById( userId, 'imageFavourites' );
    const imageFavourites = result.imageFavourites;
    // add if not present
    if( imageFavourites.indexOf(imageId)===-1 ){
        imageFavourites.push( imageId );
        const result = await db.users.updateOne( { _id: userId }, { $set: { imageFavourites } } );
        console.log( '[addImageFav] result:: ', result );
        return true;
    } else {
        console.log( `[addImageFav] no chnage imageId(${imageId}) not present for user#${userId}` );
        return false;
    }
}

async function removeImageFav( userId, imageId ){
    const result = await db.users.findById( userId, 'imageFavourites' );
    const imageFavourites = result.imageFavourites;
    // remove if present
    if( imageFavourites.indexOf(imageId)!==-1 ){
        imageFavourites.splice( imageFavourites.indexOf(imageId),1 );
        const result = await db.users.updateOne( { _id: userId }, { $set: { imageFavourites } } );
        console.log( '[removeImageFav] result:: ', result );
        return true;
    } else {
        console.log( `[removeImageFav] no change imageId(${imageId}) not present for user#${userId}` );
        return false;
    }
}

async function bulkActionSync( userId, bulkActions ){
    if( bulkActions.length<1 ) {
        return true;
    }

    const result = await db.users.findById( userId, 'imageFavourites' );
    const imageFavourites = result.imageFavourites;

    bulkActions.forEach( action=>{
        console.log( `.. ${action.type} @ ${action.time}` );
        if( action.type==='imageIdFav' ){
            const { imageId, isMyFavourite }= action.data;
            if( isMyFavourite && imageFavourites.indexOf(imageId)===-1 ){
                imageFavourites.push( imageId );
            } else if( !isMyFavourite && imageFavourites.indexOf(imageId)!==-1 ){
                imageFavourites.splice( imageFavourites.indexOf(imageId),1 );
            } else {
                console.log( '.. ignoring ');
            }
        }
    });

    const updateResult = await db.users.updateOne( { _id: userId }, { $set: { imageFavourites } } );
    console.log( '[bulkActionSync] result:: ', updateResult );
    return true;
}

module.exports = {
    registerUser,
    loginUser,
    addImageFav,
    removeImageFav,
    bulkActionSync
};