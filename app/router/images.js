const orm = require('../orm');

// for file upload management
const HTML_PATH = process.env.HTML_PATH || 'public/';
const UPLOAD_PATH = process.env.UPLOAD_PATH || 'uploads/';
const upload = require('multer')({ dest: HTML_PATH+UPLOAD_PATH });
// first entry (../) is relative location of the image to current path
const imageTool = require( '../imageTool' )('../',UPLOAD_PATH);

function router( app ){
    // media upload looks for a picture file called 'imageFile'
    app.post( '/api/image', upload.single('imageFile'), async function( req, res ){
        // console.log( '[api/image] POST ', req.body, req.file )
        try {
            // with each api request we pass in session (actually we just pass in userId)
            let imageData = { ...req.body, user: req.headers.session };
            // if they uploaded a file, let's add it to the thumbData
            console.log( `[POST api/image] user(${imageData.user}) upload file ${req.file ? req.file.originalname: 'no-file'}` );

            if( req.file ){
                // resize to max 1024x1024
                const imageUrl = await imageTool.resize( req.file, 1024, 1024);
                // re-assign/update file upload fields
                imageData.imageUrl = imageUrl;
                imageData.name = req.file.originalname;
            }

            if( imageData.imageUrl==='' ) {
                throw new Error(`Sorry problem uploading ${imageData.name}`);
            }

            // save image
            const imageId = await orm.images.save( imageData );
            if( !imageId ) {
                throw new Error('Problems saving image');
            }
            // put imageId into the image before sending back to client
            imageData.imageId = imageId;

            res.send( { status: true, imageData, message: `Thank you, saved ${imageData.name}` } );

        } catch( err ){
            console.log( ' error: ', err );
            res.send( { status: false, message: `Sorry: ${err}` } );
        }
    });


    app.put( '/api/image', upload.single('imageFile'), async function( req, res ){
        try {
            const imageId = req.body.imageId;
            let imageData = { ...req.body };
            console.log( `[PUT api/images] imageId(${imageId}) `, imageData );
            // if they uploaded a file, let's add it to the thumbData
            if( req.file ){
                // resize
                const imageUrl = await imageTool.resize( req.file, 1024, 1024);
                // assign in the uploaded file new url
                imageData.imageUrl = imageUrl;
                imageData.name = req.file.originalname;
            }
            if( imageData.imageUrl==='' ) {
                throw new Error(`Sorry problem uploading ${imageData.name}`);
            }

            const _imageId = await orm.images.update( imageId, imageData );
            if( !_imageId ) {
                throw new Error('Problems saving image');
            }

            res.send( { status: true, message: `Thank you, update saved!` } );
        } catch( err ){
            console.log( ' error: ', err );
            res.send( { status: false, message: `Sorry: ${err}` } );
        }
    });

    app.get( '/api/image/:imageSearch?', async function( req, res ){
        let search = {};
        const userId = req.headers.session;
        const [searchType, searchId]= req.params.imageSearch ? req.params.imageSearch.split(':') : [];
        if( searchType=='tag' )
            search.tag = searchId;
        else if( searchType=='image' )
            search.imageId = searchId;
        else if( searchType==='user' )
            search.user = searchId;

        console.log( `GET /api/image search(${JSON.stringify(search)})`);
        const imageList = await orm.images.list( userId, search );
        res.send( { status: true, imageList } );
    });

    app.delete( '/api/image/:imageId', async function( req, res ){
        const imageId = req.params.imageId;
        console.log( `[DELETE api/image] id=${imageId}` );
        await orm.images.remove( imageId );

        res.send( { message: `Thank you, delete #${imageId}` } );
    });
}

module.exports = router;