// include mongoose models (it will include each file in the models directory)
function apiRouter( app ){
    const routerModules = ['users','images'];

    routerModules.forEach( function( module ){
        require(`${__dirname}/${module}.js`)(app);
    });
}

module.exports = apiRouter;