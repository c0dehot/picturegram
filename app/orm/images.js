const db = require( './models' );

// input: imageId
// action: fetches a single image with the imageId
// output: { imageId, title, imageUrl, tags, createdAt } || false
async function load( imageId ){
    const imageData = await db.images.findOne({_id: imageId}).populate('user');
    if( !imageData ) {
        return false;
    }

    /* return consistent format data */
    return {
        imageId: imageData._id,
        user: imageData.user,
        title: imageData.title,
        imageUrl: imageData.imageUrl,
        tags: imageData.tags,
        createdAt: imageData.createdAt
    };
}

// input: <object> { userId, title, imageUrl, tags }
// output: imageId on success, false otherwise
async function save( imageData ){
    // clean up tags into array of lower-case words
    const tags = imageData.tags.split(',').map( tag=>tag.trim().toLowerCase() );

    const dbData = {
        user: imageData.user,
        title: imageData.title,
        imageUrl: imageData.imageUrl,
        tags
    };
    const dbResult = await db.images.create(dbData);
    return dbResult._id ? dbResult._id : false;
}

// input: imageId, <object> { title, imageUrl, tags }
// note we DO NOT want to adjust the userId, nor forget it.
// output: imageId on success or false
async function update( imageId, imageData ){
    // clean up tags into array of lower-case words
    const tags = imageData.tags.split(',').map( tag=>tag.trim().toLowerCase() );

    const dbData = {
        title: imageData.title,
        imageUrl: imageData.imageUrl,
        tags 
    };
    const dbResult = await db.images.findOneAndUpdate({_id: imageId}, dbData, {new: true});
    return dbResult._id ? dbResult._id : false;
}

// input: { imageId }
// output: boolean on success
async function remove( imageId ){
    const dbResult = await db.images.findByIdAndDelete(imageId);
    return dbResult._id ? true : false;
}

// input : userId, search <object> { userId | tag | imageId }
// output: <array> [{imageId, name, imageUrl, tags, creationTime, isFavourite }]
async function list( userId, search={} ){
    // determine search query based on the search
    let imageList = [];
    if( search.user ){
        imageList = await db.images.find({ user: search.user }).populate('user','firstName lastName').sort({ createdAt: -1 });
    } else if( search.imageId ){
        const imageData = await db.images.findOne({_id: search.imageId}).populate('user','firstName lastName');
        imageList.push( imageData );
    } else if( search.tag ){
        console.log( `[ORM list] search by tag: ${search.tag}`)
        imageList = await db.images.find({tags: { $in: search.tag }}).populate('user','firstName lastName').sort({ createdAt: -1 });
    } else {
        imageList = await db.images.find().populate('user','firstName lastName').sort({ createdAt: -1 });
    }
    console.log( `imageList (${imageList.length} items) - latest:`, imageList[0] );
    if( imageList.length===0 ) {
        return false;
    }

    // get this users favourites, then we tag pictures in them
    const result = await db.users.findById( userId, 'imageFavourites' );
    const imageFavourites = result.imageFavourites;

    // now clean up the list and return relevant data in camelCase
    let outputList = [];
    imageList.forEach( function( item ){
        outputList.push({
            imageId: item._id,
            user: item.user,
            title: item.title,
            imageUrl: item.imageUrl,
            tags: item.tags,
            isMyFavourite: imageFavourites.indexOf(item._id)>-1,
            createdAt: item.createdAt,
        });
    });
    return outputList;
}

module.exports = {
    load, save, update, remove, list
};