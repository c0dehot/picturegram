/* this is our server file that will give us all the cool stuff we need */
const express = require( 'express' );
const PORT = process.env.PORT || 8080;

const orm = require( './orm' );

const app = express();

app.use( express.static('public') );
app.use( express.urlencoded({ extended: false }) );

app.get( '/api/thumbnails', async function( req, res ){
    const myPictureList = await orm.listThumbnails();
    res.send( myPictureList );
});

app.post( '/api/thumbnails', async function( req, res ){
    console.log( `[POST api/thumbnails] recieved: `, req.body );
    await orm.saveThumbnail( req.body );

    res.send( { message: `Thank you, saved ${req.body.name}` } );
} );

app.delete( `/api/thumbnail/:id`, async function( req, res ){
    console.log( `[DELETE api/thumbnail] id=${req.params.id}` );
    await orm.deleteThumbnail( req.params.id );

    res.send( { message: `Thank you, delete #${req.params.id}` } );
} );

app.get( `/api/thumbnail/:id`, async function( req, res ){
    const myEdit = await orm.getThumbnail( req.params.id );
    res.send( myEdit );
} );

app.put( '/api/thumbnails', async function( req, res ){
    console.log( `[PUT api/thumbnails]` );
    await orm.updateThumbnail( req.body );

    res.send( { message: `Thank you, updated ${req.body.name}` } );
} );

app.get('/api/thumbnails/:tag', async function( req, res){
    console.log(`api searcing for elements with tag ${req.params.tag}`)
    const myTagsList = await orm.tagSearch();

    res.send(myTagsList);
})

app.listen( PORT, function(){
    console.log( `[pictures] RUNNING, http://localhost:${PORT}` );
})
