require('dotenv').config(); // --> process.env

const express = require( 'express' );
// our bcrypt logic will be in the orm package
// const orm = require( './db/orm.mysql' );
const orm = require( './db/orm.mongoose' );

const PORT = process.env.PORT || 8080;

const app = express();

app.use( express.static('public') );
app.use( express.urlencoded({ extended: false }) );


// == thumbnails ==
app.get('/api/thumbnails/:userId/:tag?', async function( req, res ){
   const tag = req.params.tag;
   const userId = req.params.userId;
   console.log('[GET /api/thumbnails]'+( tag ? ` looked for tagged media: '${tag}'` : '' ) );

   const myPictureList = await orm.listThumbnails( userId, tag );

   res.send( myPictureList );
});

app.post( '/api/thumbnails', async function( req, res ){
   const thumbData = req.body;
   console.log( '[POST api/thumbnails] recieved: ', thumbData );
   await orm.saveThumbnail( thumbData );

   res.send( { message: `Thank you, saved ${thumbData.name}` } );
});

app.put( '/api/thumbnails', async function( req, res ){
   const thumbId = req.body.thumbId;
   const thumbData = req.body;
   console.log( `[PUT api/thumbnails] thumbId: ${thumbId}` );
   await orm.updateThumbnail( thumbId, thumbData );

   res.send( { message: `Thank you, updated ${thumbData.name}` } );
});

app.get( '/api/thumbnail/:thumbId', async function( req, res ){
   const thumbData = await orm.getThumbnail( req.params.thumbId );
   res.send( thumbData );
});

app.delete( '/api/thumbnail/:thumbId', async function( req, res ){
   const thumbId = req.params.thumbId;
   console.log( `[DELETE api/thumbnail] id=${thumbId}` );
   await orm.deleteThumbnail( thumbId );

   res.send( { message: `Thank you, delete #${thumbId}` } );
});


// == favourites ==
app.get( '/api/favourite-add/:userId/:picId', async function( req, res ){
   await orm.addFavourite( req.params.userId, req.params.picId );
   res.send( { message: `Added fav for #${req.params.picId}`} );
});

app.get( '/api/favourite-del/:userId/:picId', async function( req, res ){
   await orm.deleteFavourite( req.params.userId, req.params.picId );
   res.send( { message: `Deleted fav for #${req.params.picId}`} );
});


// == user ==
app.post('/api/user/login', async function( req, res ){
   const userEmail = req.body.userEmail;
   const userPassword = req.body.userPassword;
   const userData = await orm.loginUser(userEmail, userPassword);
   console.log( '[/api/user/login] userData: ', userData);
   if( !userData ){
      res.send( { error: 'Sorry unknown user or wrong password' } );
   }

   console.log('* valid password, proceeding with sending userData to client!', userData);
   res.send(userData);
});

app.post( '/api/user/registration', async function( req, res ){
   let userId = await orm.registerUser({
      firstName:     req.body.firstName,
      lastName:      req.body.lastName,
      emailAddress:  req.body.emailAddress,
      userPassword:  req.body.userPassword
   });
   console.log( ' created user [orm.registerUser]: userId=', userId );

   if ( userId ){
      res.send( { message: `Your registration worked! (userId: #${userId})!` } );
   } else {
      res.send( { error: 'Sorry failed to create the user, try later?' } );
   }
} );

app.listen( PORT, function(){
   console.log( `[pictures] RUNNING, http://localhost:${PORT}` );
});
