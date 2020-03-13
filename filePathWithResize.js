// quick function used for file uploads to rename with extension
const fs = require('fs');
const sharp = require('sharp');

async function filePathWithResize( filePath, originalName, resizeWidth=0, resizeHeight=0 ){
   const fileExt = originalName.toLowerCase().substr((originalName.lastIndexOf('.')));
   const filePathWithExt = filePath+fileExt;
   resizeWidth = Math.round(resizeWidth); resizeHeight = Math.round(resizeHeight);
   if( resizeWidth>0 && resizeHeight>0 ){
      // resize if given parameters
      await sharp(`${__dirname}/${filePath}`)
         .resize(resizeWidth, resizeHeight, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
         })
         .toFile(`${__dirname}/${filePathWithExt}`);
      console.log( `** resized ${resizeWidth}x${resizeHeight} for ${__dirname}/${filePathWithExt}` );
   } else {
      fs.renameSync( `${__dirname}/${filePath}`, `${__dirname}/${filePathWithExt}` );
   }

   // get rid of 'public' which is where all the html content/media is in by default
   return filePathWithExt.replace('public/','');
}

module.exports = filePathWithResize;