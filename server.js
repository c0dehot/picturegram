require('dotenv').config(); // --> process.env
const express = require( 'express' );
const orm = require( './db/orm.mongoose' );
// const orm = require( './db/orm.mysql' );
const filePathWithResize = require( './filePathWithResize' );

const PORT = process.env.PORT || 8080;

const app = express();
const upload = require('multer')({ dest: 'public/uploads/' });

app.use( express.static('public') );
app.use( express.urlencoded({ extended: false }) );

// == init ==
// any initialization stuff goes here

// == thumbnails ==
app.get('/api/thumbnails/:userId/:tag?', async function( req, res ){
   const tag = req.params.tag;
   const userId = req.params.userId;
   console.log('[GET /api/thumbnails]'+( tag ? ` looked for tagged media: '${tag}'` : '' ) );

   const myPictureList = await orm.listThumbnails( userId, tag );

   res.send( myPictureList );
});

// media upload is optional
app.post( '/api/thumbnails', upload.single('imageFile'), async function( req, res ){ //single('media')
   let thumbData = req.body;
   // if they uploaded a file, let's add it to the thumbData
   if( req.file ){
      const [ resizeWidth, resizeHeight ] = thumbData.imageSize.split('x');
      const imageUrl = await filePathWithResize(req.file.path, req.file.originalname, resizeWidth, resizeHeight);
      // assign in the thumbData so can use as normal
      thumbData.imageUrl = imageUrl;
   }
   console.log( '[POST api/thumbnails] recieved'+(req.file ? `; attached file @ ${thumbData.imageSize}`:''), thumbData );

   if( thumbData.imageUrl==='' ) {
      // we can't save this picturegram without an image so abort
      res.send( { error: `Sorry problem uploading ${thumbData.name}` } );
   }

   await orm.saveThumbnail( thumbData );
   res.send( { message: `Thank you, saved ${thumbData.name}` } );
});

app.put( '/api/thumbnails', upload.single('imageFile'), async function( req, res ){
   const thumbId = req.body.thumbId;
   let thumbData = req.body;
   // if they uploaded a file, let's add it to the thumbData
   if( req.file ){
      const [ resizeWidth, resizeHeight ] = thumbData.imageSize.split('x');
      const imageUrl = await filePathWithResize(req.file.path, req.file.originalname, resizeWidth, resizeHeight);
      // assign in the thumbData so can use as normal
      thumbData.imageUrl = imageUrl;
   }
   console.log( `[PUT api/thumbnails] thumbId: ${thumbId}`+(req.file ? `; attached file @ ${thumbData.imageSize}`:''), thumbData );

   if( thumbData.imageUrl==='' ) {
      res.send( { error: `Sorry problem uploading ${thumbData.name}` } );
   }

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
app.get( '/api/favourite-add/:userId/:thumbId', async function( req, res ){
   const ormResult = await orm.addFavourite( req.params.userId, req.params.thumbId );
   console.log( `[api/favourite-add] userId(${req.params.userId}) thumbId(${req.params.thumbId})`, ormResult);
   res.send( { message: `Added fav for #${req.params.thumbId}`} );
});

app.get( '/api/favourite-del/:userId/:thumbId', async function( req, res ){
   const ormResult = await orm.deleteFavourite( req.params.userId, req.params.thumbId );
   console.log( `[api/favourite-add] userId(${req.params.userId}) thumbId(${req.params.thumbId})`, ormResult);
   res.send( { message: `Deleted fav for #${req.params.thumbId}`} );
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

// == error handling

// Error handling Middleware; first line allows second one to run
// each method needs to be wrapped in errorCatcher
app.use(function(err, req, res, next) {
   if(!err) {
      return next();
   }
   const status = error.status || 500;
   const message = error.message || 'Something went wrong';

   console.log(`**ERROR** Caught: ${status} / ${message}`);
   res.status(status).send({ status, message });
});
// == process-wide error handling
process.on('uncaughtException', err => {
   console.error('There was an uncaught error', err);
   process.exit(1); //mandatory (as per the Node.js docs)
});


app.listen( PORT, function(){
   console.log( `[pictures] RUNNING, http://localhost:${PORT}` );
});

