module.exports = function() {
   // load models from model directory
   const fs = require('fs');
   const files = fs.readdirSync('./models');
   let db = {};
   var filename = '';
   for(var i=0; i<files.length; i++){
      filename = files[i].split('.')[0];
      if( filename !== 'index' ){
         db[filename] = require('./models/' + files[i]);
         console.log('> loaded model ' + filename);
      }
   }
   return db;
};