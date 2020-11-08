const orm = require('../orm');

function router( app ){
    app.post('/api/user/login', async function( req, res ){
        const email = req.body.email;
        const password = req.body.password;
        const userData = await orm.users.loginUser(email, password);
        console.log( '[/api/user/login] userData: ', userData);
        if( !userData ){
            return res.send( { status: false, message: 'Sorry unknown user or wrong password' } );
        }

        console.log('* valid password, proceeding with sending userData to client!', userData);
        res.send({ status: true, ...userData });
    });

    app.post( '/api/user/register', async function( req, res ){
        const userData = {
            firstName:     req.body.firstName,
            lastName:      req.body.lastName,
            emailAddress:  req.body.email,
            userPassword:  req.body.password
        };

        const userId = await orm.users.registerUser(userData);
        console.log( ' created user [orm.registerUser]: userId=', userId );

        if( !userId ){
            return res.send( { status: false, message: 'Sorry failed to create the user, try later?' } );
        }

        res.send( { status: true, message: `You are registered (userId: #${userId})!` } );
    } );

    app.put( '/api/user/image-fav/:imageId', async function( req, res ){
        const userId = req.headers.session;
        const imageId = req.params.imageId;
        console.log( `[PUT /api/image-fav/] id=${imageId}` );
        const result = await orm.users.addImageFav( userId, imageId );
        if( !result ) return res.send( { status: false } )
        res.send( { status: true, message: `Thank you, added fav` } );
    });

    app.delete( '/api/user/image-fav/:imageId', async function( req, res ){
        const userId = req.headers.session;
        const imageId = req.params.imageId;
        console.log( `[DELETE /api/image-fav/] id=${imageId}` );
        const result = await orm.users.removeImageFav( userId, imageId );
        if( !result ) return res.send( { status: false } )

        res.send( { status: true, message: `Thank you, remove fav` } );
    });

    app.post( '/api/user/bulk-actions', async function( req, res ){
        const userId = req.headers.session;
        const actions = req.body.actions;
        console.log( `[POST /api/bulk-actions]`, actions );
        const result = await orm.users.bulkActionSync( userId, actions );
        if( !result ) return res.send( { status: false } )

        res.send( { status: true, message: `Thank you, changes saved` } );
    });
}

module.exports = router;