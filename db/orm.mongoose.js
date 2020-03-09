const mongoose = require('mongoose');

mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {useNewUrlParser: true});

// include mongoose models
const Thumbnail = require('./models/thumbnail');
const user = require('./models/user');


// const mysql = require( 'mysql' );
const Thumbnail = require('./models/thumbnail');
const user = require('./models/user');
const tags = require('./models/tags');
// List Thumbnails 
//No Parameters to pass
 function listThumbnails(){
    return  Thumbnail.find({}); 
}

 function saveThumbnail( myPost ){
    let newThumbnail = new Thumbnail(myPost);
    return newThumbnail.save();
}

 function deleteThumbnail( Id ){
    return Thumbnail.findByIdAndDelete(Id);
}

 function updateThumbnail( myEdit ){
     console.log(`[updateThunbnail] myEdit: `, myEdit);
     console.log( ` _id: `, myEdit._id );
    return Thumbnail.findByIdAndUpdate(myEdit._id, myEdit);  
}

 function getThumbnail( myId ){
  return Thumbnail.findById(myId);
}
 function registerUser(myPost){
    let newUser = new user( myPost );
    return newUser.save();
    
}
function checkUserStuff(checkUser){
    return user.findOne({email_address:checkUser.userEmail},'user_password');
}

function addFavorites(userID,pictureId){
    return user.update({ObjectId:userID}, {$push: {favorites: pictureId}})
}
function deleteFavorites(userId,pictureId){
    return user.update({ObjectId:userId},{$pull: {favorites: pictureId}});
}
//function tagSearch()


module.exports = { 
    listThumbnails,
    saveThumbnail,
    deleteThumbnail,
    updateThumbnail,
    getThumbnail,
    tagSearch,
    addFavourite,
    deleteFavourite,
    registerUser,
    checkUserStuff,
    addFavorites,
    deleteFavorites
}