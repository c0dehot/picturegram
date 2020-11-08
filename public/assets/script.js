/* eslint-disable no-unused-vars */
/*
    note how we wrap our api fetch in this function that allows us to do some
    additional error / message handling for all API calls...
*/
let db

async function fetchJSON( url, method='get', data={} ){
    method = method.toLowerCase();
    let settings = {
        headers: {
            'Session': localStorage.session ? localStorage.session : '',
            'Content-Type': 'application/json' },
        method
    };

    // only attach the body for put/post
    if( method === 'post' || method === 'put' ) {
        const isFormData = (typeof data)==='string';
        if( isFormData ){
            // for 'new FormData' generation we must NOT set content-type, let system do it
            delete settings.headers['Content-Type'];
            //* gather form data (esp. if attached media)
            //! NOTE: each entry to be attached must have a valid **name** attribute
            settings.body = new FormData( document.querySelector(data) );
        } else {
            settings.body = JSON.stringify( data );
        }
    }

    return fetch( url,settings ).then( res=>res.json() );
}

function showStatusMessage( result ){
    /* put the api result message onto the screen as a message if it exists */
    return new Promise( function( resolve, reject ){
        if( result.message ){
            const apiResultEl = document.querySelector('#apiMessage');
            if( !apiResultEl ) {
                resolve();
            }
            apiResultEl.innerHTML = result.message;
            apiResultEl.classList.remove( 'd-none' );
            apiResultEl.classList.remove( 'alert-danger' );
            apiResultEl.classList.remove( 'alert-success' );
            if( result.status ) {
                apiResultEl.classList.add( 'alert-success' );
            } else {
                apiResultEl.classList.add( 'alert-danger' );
            }
            console.log( 'showing message: '+ result.message );
            setTimeout( function(){
                apiResultEl.classList.add( 'd-none' );
                resolve(result.status);
            }, 5000 );
        } else {
            resolve();
        }
    });
}


// ==== action used on multiple pages ============================
function actionCancel( event='' ){
    if( event ) event.preventDefault();
    location.href = '/#';
}


//== registration.html page =====================
async function registerUser(event){
    event.preventDefault();

    const userData = {
        firstName:document.querySelector('#firstName').value,
        lastName: document.querySelector('#lastName').value,
        email:    document.querySelector('#email').value,
        password: document.querySelector('#password').value
    };

    if( userData.emailAddress === '' ) {
        document.querySelector('#email').focus();
        showStatusMessage( { message: 'Your Email is needed for login!' } );
        return false;
    }

    if( !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userData.email)) ) {
        document.querySelector('#email').focus();
        showStatusMessage( { message: 'Please provide a valid Email' } );
        return false;
    }

    if( userData.password === '' ) {
        document.querySelector('#password').focus();
        showStatusMessage( { message: 'Please provide a password' } );
        return false;
    }

    if( userData.password.length < 8 ) {
        document.querySelector('#password').focus();
        showStatusMessage( { message: 'Please provide a password that is atleast 8 character long' } );
        return false;
    }

    const response = await fetchJSON( '/api/user/register', 'post', userData );
    await showStatusMessage( response );
    if( !response.status ) {
        return;
    }

    // successfully registered
    console.log( '** PASS ** Registration appears to have worked! Check the mongo database \'users\' collection.' );
    location.href = '/login.html';
}

function registerInit(){
    // if session set, logged-in, so go to index page
    if( sessionStorage.session || localStorage.session ) {
        console.log( '[registerInit] found a valid session, going to the main page');
        location.href = '/';
    }
}


//== login.html page ============================
async function loginUser(event){
    event.preventDefault();

    const userData = {
        email:    document.querySelector('#email').value,
        password: document.querySelector('#password').value
    };
    const response = await fetchJSON( '/api/user/login', 'post', userData );
    console.log( ' .. [response] ', response );
    showStatusMessage( response );
    if( !response.status ) {
        return;
    }

    // success, so go back to home page (else we stay on this page for user to fix error)

    // if [remember-me]
    if( document.querySelector('#rememberMe').checked ){
        console.log( `* remember-me so using localStorage.userId = ${response.userId}`);
        localStorage.session = response.userId;
        localStorage.email = response.email;
        localStorage.firstName = response.firstName;
    } else {
        console.log( `* no remember-me so using sessionStorage.userId = ${response.userId}`);
        sessionStorage.session = response.userId;
    }

    console.log( '** PASS ** Login worked! Now going to main page.');
    location.href = '/';
}

function loginInit(){
    // if session set, logged-in, so go to index page
    if( sessionStorage.session || localStorage.session ){
        console.log( '[loginInit] found a valid session, going to the main page');
        location.href = '/';
    }

    // save email
    if( localStorage.email ){
        document.querySelector('#email').value = localStorage.email;
    }
}


//== index.html page ============================
function logOut(){
    localStorage.clear();
    sessionStorage.clear();
    console.log( '[logOut] cleared your localStorage values.' );
    location.href = '/login.html';
}

function showImageMenu( imageId, event ){
    event.preventDefault();

    document.querySelector(`#edBtn_${imageId}`).classList.remove('d-none');
    document.querySelector(`#delBtn_${imageId}`).classList.remove('d-none');
    setTimeout( function(){
        document.querySelector(`#edBtn_${imageId}`).classList.add('d-none');
        document.querySelector(`#delBtn_${imageId}`).classList.add('d-none');

    }, 2000 );
}

async function toggleFavourite( imageId ){
    const isMyFavourite = document.querySelector(`#fav_${imageId}`).classList.contains('far');
    const isOnline = navigator.onLine==true
    console.log( `[toggleFavourite] imageId(${imageId}) isMyFavourite?${isMyFavourite} isOnline(${isOnline})` );
    // if is fav, then delete it, else add it.
    if( isOnline ){
        const response = await fetchJSON( `/api/user/image-fav/${imageId}`, isMyFavourite ? 'put' : 'delete' );
        showStatusMessage( response );
    } else {
        // offline mode record
        await db.add('offlineActions', { time: Date.now(), type: 'imageIdFav', data: { imageId, isMyFavourite } } );
    }

    // adjust it in
    if( isMyFavourite ){
        // change to ON
        document.querySelector(`#fav_${imageId}`).classList.add('fas');
        document.querySelector(`#fav_${imageId}`).classList.remove('far');
    } else {
        document.querySelector(`#fav_${imageId}`).classList.add('far');
        document.querySelector(`#fav_${imageId}`).classList.remove('fas');
    }
}

async function imageDelete( imageId, event ){
    event.preventDefault();
    if( confirm( 'Are you sure you want to delete this?') ){
        const response = await fetchJSON( `/api/image/${imageId}`, 'delete' );
        console.log( ' .. [response] ', response );
        showStatusMessage( response );

        // forcing a reload unnessessary, we'll simply hide image (till the page reload)
        document.querySelector(`#card_${imageId}`).classList.add('d-none');
    }
}

async function showImageList(){
    const myUserId = localStorage.session;
    // get search from the location hash (ex. /#tag:good)
    const search = location.hash.substr(1)

    const response = await fetchJSON( `/api/image/${search}` );
    console.log( ` .. /api/image/${search} --> [response] `, response );
    showStatusMessage( response );
    if( !response.status ) {
        return;
    }

    console.log( `[showImageList/${search}`, response.imageList);
    let imageHtmlList = '';
    response.imageList.forEach( image=>{
        // map the tags to some clickable html
        const tagsHtml = image.tags.map( 
            tag=> tag ? `<a class="text-muted online-only" href="/#tag:${tag}">${tag}</a>` : ''
        )
        imageHtmlList += `
<div class="col-md-4 col-xl-3 mb-2">
    <div id="card_${image.imageId}" class="card shadow-sm h-100">
        <div class='right-overlay btn-group online-only ${!image.user||image.user._id!==myUserId ? 'd-none' : ''}'>
            <a href="/image.html#${image.imageId}" id="edBtn_${image.imageId}" class="btn btn btn-primary d-none">Edit</a>
            <button onClick="imageDelete('${image.imageId}',event)" id="delBtn_${image.imageId}" 
                class="btn btn btn-danger d-none">Delete</button>
            <button onClick="showImageMenu('${image.imageId}',event)" 
                class='btn btn-sm btn-outline-secondary'><i class="fas fa-ellipsis-v"></i></button>
        </div>
        <img src="${image.imageUrl}" loading="lazy" class="thumbnail-size img-fluid" preserveAspectRatio="xMidYMid slice" />
        <div class="card-body">
            <p class="card-text"><b>${image.title}</b> 
                <a class="float-right favorite" onClick="toggleFavourite('${image.imageId}')">
                    <i id="fav_${image.imageId}" class="${image.isMyFavourite===true ? 'fas' : 'far'} fa-heart fa-lg fav"></i>
                </a>
            </p>
            <small>${tagsHtml.join(' / ')}</small>
            <small class="text-muted float-right">${moment(image.createdAt).fromNow()} by ${image.user ? `<a href='/#user:${image.user._id}'>${image.user.firstName}</a>` : '-'}</small>
        </div>
    </div>
</div> 
        `;
    });
    document.querySelector('#imageList').innerHTML = '<div class="row">' + imageHtmlList + '</div>';
}

async function indexInit(){
    // enable our local database
    dbInit();

    // we don't try to re-direct if offline.
    if( navigator.onLine==true && !localStorage.session ) {
        console.log( 'index.html page -> indexInit() -> failed, no session going to login page');
        location.href = '/login.html';
    } else {
        document.querySelector('#firstName').innerHTML = `Welcome <b>${localStorage.firstName}</b>!`;

        showImageList();
    }
}


//== image.html page =================================
function previewImage(event){
    const reader = new FileReader();
    // the onload listener that runs when readAsDataURL() finished
    reader.onload = function(){
        const previewImageEl = document.querySelector('#previewThumbnail');
        previewImageEl.style.backgroundImage = `url( '${reader.result}' )`;
    };
    // trigger the read target file when upload
    reader.readAsDataURL(event.target.files[0]);
}

async function loadImage( imageId ){
    console.log( `[loadImage] fetching ${imageId}` );
    const response = await fetchJSON( `/api/image/image:${imageId}` );
    console.log( ' .. [response] ', response );
    showStatusMessage( response );
    const imageData = response.imageList[0];

    // show this information
    // these first 2 fields are hidden, just passing edit-info
    document.querySelector('#imageId').value = imageData.imageId;
    document.querySelector('#imageUrl').value = imageData.imageUrl;
    document.querySelector('#title').value = imageData.title;
    document.querySelector('#tags').value = imageData.tags.join(', ');
    document.querySelector('#previewThumbnail').style.backgroundImage = `url( '${imageData.imageUrl}' )`;
}

async function uploadImage( event ){
    event.preventDefault();

    const imageId = document.querySelector('#imageId').value;

    //* because we are using the built-in browser form-builder, we need valid
    //! **name** attributes - for ease we give same values as the id's
    const response = await fetchJSON( '/api/image', imageId ? 'put' : 'post', '#imageForm' );
    console.log( ' .. [response] ', response );
    await showStatusMessage( response );

    if( response.status ){
        // success, so go back to home page (else we stay on this page for user to fix error)
        location.href = '/';
    }
}

function imageInit(){
    if( !localStorage.session && !sessionStorage.session ){
        location.href = '/login.html';
        return;
    }

    // if a hash is there, ex. /image.html#873298f932e298a
    // then attempt to load the image
    const imageId = location.hash.substr(1);
    if( imageId ){
        loadImage( imageId );
    }

    document.querySelector('#firstName').innerHTML = `Welcome <b>${localStorage.firstName}</b>!`;
}

// adjust for offline mode
async function updateOnlineStatus(event){
    const isOnline = navigator.onLine==true || navigator.onLine==='online'
    const el = document.querySelectorAll('.online-only');
    for( let i=0; i<el.length; i++ ){
        if( isOnline ){
            el[i].classList.remove("appear-offline");
        } else {
            el[i].classList.add("appear-offline");
        }
    }

    if( isOnline ){
        // just come online, try to bulk sync any offline activity
        const offlineActions =  await db.getAllFromIndex('offlineActions', 'time');
        console.log( ` .. checking offlineAction queue (${offlineActions.length}): `, offlineActions )
        if( offlineActions.length>0 ){
            const response = await fetchJSON( `/api/user/bulk-actions/`, 'post', { actions: offlineActions } );
            console.log( ' .. [response] ', response );
            showStatusMessage( response );
            if( response.status ){
                // clear out the list now
                await db.clear('offlineActions')
            }
        }
    }
}


async function dbInit(){
    db = await idb.openDB('picturegram', 1, {
        upgrade(db) {
        // Create a store of objects
        const store = db.createObjectStore( 'offlineActions', {
            // The 'id' property of the object will be the key.
            keyPath: 'id',
            // If it isn't explicitly set, create a value by auto incrementing.
            autoIncrement: true,
        });
        // Create an index on the 'date' property of the objects.
        store.createIndex('time', 'time');
        },
    });
}

// async function saveOffline( table, key, value ) {
//     await db.add(table, { time: Date.now(), key, value });
// }

// async function getOffline( table ){
//     // get in the order
//    return await db.getAllFromIndex(table, 'time');
// }
