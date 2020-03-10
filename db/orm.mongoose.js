const mongoose = require('mongoose');
const bcrypt = require ( 'bcrypt' );

mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`, {useNewUrlParser: true});

// include mongoose models (it will include each file in the models directory)
const db = require( './models' );

// input : userId, tag*
// output: <array> [{thumbId, name, imageUrl, tags, creationTime, isFavourite }]
async function listThumbnails( userId, tag='' ){
   // if a tag is given do a find-where 'tag' in tags
   const thumbList = tag ? await db.thumbnail.find({ $in: {tags: tag}}) : await db.thumbnail.find();

   // now get the corresponding user likes
   let userFavouriteList = await db.users.findOne({ _id: userId }, 'favourites' );
   userFavouriteList = userFavouriteList.favourites;
   console.log( 'userFavouriteList', userFavouriteList );

   // now clean up the list and return relevant data in camelCase
   let myList = [];
   thumbList.forEach( function( item ){
      console.log( `fav for ${item._id}?`,
         userFavouriteList.filter( fav=>String(fav)===String(item._id) ).length>0 ? item._id : false );
      myList.push({
         thumbId: item._id,
         name: item.name,
         imageUrl: item.imageUrl,
         tags: item.tags,
         creationTime: item.createdAt,
         // GOTCHA: 'fav' and item._id are typeof: objects ... pointing to different things so must cast to string
         isFavourite: !userFavouriteList ? false :
            userFavouriteList.filter( fav=>String(fav)===String(item._id) ).length>0 ? true : false
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
   const dbThumbnail = new db.thumbnail(thumbnailData);
   return dbThumbnail.save();
}

// input: { thumbId }
// output: boolean on success
function deleteThumbnail( thumbId ){
   return db.thumbnail.findByIdAndDelete(thumbId);
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
   return db.thumbnail.findByIdAndUpdate(myData._id, thumbnailData);
}

// input: thumbId
// output: { thumbId, name, imageUrl, tags, creationTime } || false
async function getThumbnail( thumbId ){
   const dbData = await db.thumbnail.findById(thumbId);
   console.log( '[getThumbnail] dbData', dbData );
   if( !dbData ) {
      return false;
   }
   /* return consistent format data */
   return {
      thumbId: dbData._id,
      name: dbData.name,
      imageUrl: dbData.imageUrl,
      tags: dbData.tags,
      creationTime: dbData.createdAt
   };
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
   const dbUser = new db.users( saveData );
   const saveUser = await dbUser.save();
   return saveUser._id;
}

// input: email, password
// output: <object> { userId, firstName, lastName, emailAddress, creationTime } || false
async function loginUser( email, password ) {
   const userFetch = await db.users.findOne({ emailAddress: email });
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
      firstName: userFetch.firstName,
      lastName: userFetch.lastName,
      emailAddress: userFetch.emailAddress,
      creationTime: userFetch.createdAt
   };
   return userData;
}

// input: userId, thumbId
// output: boolean on success
async function addFavourite(userId, thumbId){
   // const dbResult = await db.users.updateOne({_id:userID}, {$push: {favourites: mongoose.Types.ObjectId(thumbId)}});
   console.log( `[addFavourite] updateOne {_id:${userId}}}, {$push: ${thumbId} }`);
   const dbResult = await db.users.updateOne({_id:userId}, { $push: { favourites: mongoose.Types.ObjectId(thumbId) } });
   console.log( '[addFavourite\]', dbResult, dbResult.ok );
   return dbResult.ok ? true : false;
}

// input: userId, thumbId
// output: boolean on success
async function deleteFavourite(userId, thumbId){
   // const dbResult = await db.users.update({ObjectId:userId}, {$pull: {favourites: mongoose.Types.ObjectId(thumbId)}});
   const dbResult = await db.users.updateOne({_id:userId}, { $pull: { favourites: mongoose.Types.ObjectId(thumbId) } });
   return dbResult.ok ? true : false;
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