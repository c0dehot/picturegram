/* this is our server file that will give us all the cool stuff we need */
const express = require( 'express' );
const bcrypt = require ("bcrypt");

const PORT = process.env.PORT || 8080;

const orm = require( './orm' );

const saltRounds = 10;
const app = express();

app.use( express.static('public') );
app.use( express.urlencoded({ extended: false }) );

const userId = 10;

app.get( '/api/thumbnails/:userId', async function( req, res ){
    const myPictureList = await orm.listThumbnails( userId );
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

app.get('/api/thumbnails/:userId/:tag', async function( req, res){
    console.log(`api searcing for elements with tag ${req.params.tag}`)
    const tag = req.params.tag;
    const userId = req.params;
    console.log(`Calling tag search with: ${userId} ${tag}`)
    const myTagsList = await orm.tagSearch( userId, tag);
    console.log(myTagsList);

    res.send(myTagsList);
})

app.get( `/api/favourite-add/:userId/:picId`, async function( req, res ){
    await orm.addFavourite( req.params.userId, req.params.picId );
    res.send( { message: `Added fav for #${req.params.picId}`} );
})


app.get( `/api/favourite-del/:userId/:picId`, async function( req, res ){
    const myFav = await orm.deleteFavourite( req.params.userId, req.params.picId );
    res.send( { message: `Deleted fav for #${req.params.picId}`} );
})


app.post("/api/checkuser", async function( req, res){
    console.log(req.body.userPassword);
    const encryptedPassword = await orm.checkUserStuff(req.body);
    console.log(encryptedPassword); //encrypted password

    bcrypt.compare(req.body.userPassword, encryptedPassword, function (err, result) {
        if (result == true) {
            console.log(result);
            res.send(result);


        } else {
            console.log(result)
            res.send('Incorrect password');
        }

    });
});


app.post( '/api/registration', function( req, res ){

    bcrypt.hash(req.body.user_password, saltRounds, function(err,hash){
        console.log(hash);
        orm.registerUser({
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            email_address:req.body.email_address,
             user_password:hash

        }).then (function(data){
            console.log(hash);
            if (data){
                res.send('success!')
            }
        
        })

    });


    console.log( `[POST api/registration] recieved: `, req.body );
} );

app.listen( PORT, function(){
    console.log( `[pictures] RUNNING, http://localhost:${PORT}` );
})
