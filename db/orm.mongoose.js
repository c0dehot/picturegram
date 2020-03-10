const mongoose = require('mongoose');
const bcrypt = require ( 'bcrypt' );

mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {useNewUrlParser: true});

// include mongoose models (it will include each file in the models directory)
const db = require( './models' );

// input : userId, tag*
// output: <array> [{thumbId, name, imageUrl, tags, creationTime, isFavourite }]
function listThumbnails( userId, tag='' ){
   const thumbList = tag ? db.thumbnail.find({ $in: {tags: tag}}) : db.thumbnail.find();

   // get the corresponding user likes
   const userFavouriteList = db.users.find({ _id: userId });

   // now clean up the list and return relevant data in camelCase
   let myList = [];
   thumbList.forEach( function( item ){
      myList.push({
         thumbId: item._id,
         name: item.name,
         imageUrl: item.imageUrl,
         tags: item.tags,
         creationTime: item.creationTime,
         isFavourite: userFavouriteList.favorites.filter( fav=>fav.thumbId===item._id )
      });
   });
   return myList;
}

// input: <object> { name, imageUrl, tags }
// output: boolean on success
function saveThumbnail( myData ){
   const thumbnailData = {
      name: myData.name,
      imageUrl: myData.imageUrl,
      tags: myData.tags
   };
   const dbThumbnail = new Thumbnail(thumbnailData);
   return dbThumbnail.save();
}

// input: { thumbId }
// output: boolean on success
function deleteThumbnail( thumbId ){
   return Thumbnail.findByIdAndDelete(thumbId);
}

// input: thumbId, <object> { name, imageUrl, tags }
// output: boolean on success
async function updateThumbnail( thumbId, myData ){
   console.log('[updateThunbnail] myEdit: ', myData);
   console.log( ' _id: ', myData._id );
   const thumbnailData = {
      name: myData.name,
      imageUrl: myData.imageUrl,
      tags: myData.tags
   };
   return Thumbnail.findByIdAndUpdate(myData._id, thumbnailData);
}

// input: thumbId
// output: { thumbId, name, imageUrl, tags, creationTime } || false
async function getThumbnail( thumbId ){
   return Thumbnail.findById(thumbId);
}

// input: <object> { firstName, lastName, emailAddress, userPassword }
// output: userId
async function registerUser( userData ){
   const saltRounds = 10;

   const passwordHash = await bcrypt.hash(userData.userPassword, saltRounds);
   console.log( `[registerUser] (hash=${passwordHash}) req.body:`, userData );
   const saveData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      emailAddress: userData.emailAddress,
      userPassword: passwordHash
   };
   const newUser = new users( saveData );
   return newUser.save();
}

// input: email, password
// output: <object> { userId, firstName, lastName, emailAddress, creationTime } || false
async function loginUser( email, password ) {
   const userFetch = user.findOne({ emailAddress: email },'userPassword');
   console.log( `[loadUser] email='${email}' userFetch:`, userFetch );
   if( !userFetch ) {
      return false;
   }

   const isValidPassword = await bcrypt.compare( password, userFetch.userPassword );
   console.log( ` [loginUser] checking password (password: ${password} ) hash(${userFetch.userPassword})`, isValidPassword );
   if( !isValidPassword ) {
      return false;
   }

   // remap the data into the specified fields as we are using camelCase
   const userData = {
      userId: userFetch._id,
      firstName, lastName, emailAddress, creationTime
   };
   return userData;
}

// input: userId, thumbId
// output: boolean on success
function addFavourite(userID, thumbId){
   return user.update({ObjectId:userID}, {$push: {favorites: thumbId}});
}

// input: userId, thumbId
// output: boolean on success
function deleteFavourite(userId, thumbId){
   return user.update({ObjectId:userId}, {$pull: {favorites: thumbId}});
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