// include mongoose models (it will include each file in the models directory)
let orm = {};
const ormModules = ['users','images'];
ormModules.forEach( function( module ){
    orm[module] = require(`${__dirname}/${module}.js`);
});


module.exports = orm;