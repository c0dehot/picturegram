// Written by Filipe Laborde
// GPL - use as you choose

function imageTool( publicRelativePath, uploadPath, defaultWidth=0, defaultHeight=0 ){
    const fs = require('fs');
    const sharp = require('sharp');
    const path = require('path');

    return {
        resize: async function( uploadData, resizeWidth=defaultWidth, resizeHeight=defaultHeight ){
            const filePath = path.join(publicRelativePath,uploadData.path);
            // const originalName = uploadData.originalname;
            // const fileExt = originalName.toLowerCase().substr((originalName.lastIndexOf('.'))).replace('jpeg','jpg');
            const fileExt = '.jpg';
            const filePathWithExt = filePath+fileExt;
            resizeWidth = Math.round(resizeWidth); resizeHeight = Math.round(resizeHeight);
            const filePathFull = path.join(__dirname,filePath);
            const filePathWithExtFull = path.join(__dirname,filePathWithExt);
            if( resizeWidth>0 && resizeHeight>0 ){
                // resize if given parameters
                await sharp(filePathFull)
                    .resize(resizeWidth, resizeHeight, {
                        fit: sharp.fit.inside,
                        withoutEnlargement: true
                    })
                    .toFile( filePathWithExtFull );
                console.log( `** resized ${resizeWidth}x${resizeHeight} for ${filePathWithExtFull}` );
                // remove the original file
                fs.unlinkSync(filePathFull);
            } else {
                fs.renameSync(filePathFull, filePathWithExtFull );
            }

            // get the path FROM the 'uploadPath':
            return filePathWithExt.substr( filePathWithExt.indexOf(uploadPath) );
        }
    };
}

module.exports = imageTool;