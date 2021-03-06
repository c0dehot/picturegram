# Picturegram

This is a simple instagram-like app that allows you upload pictures.

It's main purpose is a teaching tool. Thus we strive to keep the code clean and simple to understand, yet use the latest ecosystem features available.

It uses:
* _Client Side_
* Bootstrap 5
* FontAwesome 5
* Pure ES6 javascript, modern syncronous programming style with awaits
* Two libraries: moment, [Jakes IndexDB](https://github.com/jakearchibald/idb)
* mongoose 5 features ($in)
* programming style to make transitioning to React programming intuitive
* 
* _Server Side_
* Node with bcrypt, dotenv, multer (picture uploading), sharp (image resizing)


It provides a simple register/login application with picture upload capabilities:
* pictures are resized when uploaded
* mobile-friendly UI
* PWA offline mode which disables features not currently supported in offline mode (ex. picture uploading)

Free to use, enjoy!


## Contributors
See [CONTRIBUTORS.md](./CONTRIBUTORS.md)


## Database
It is built around mongo with mongoose.

But in app/orm/mysql.js you will see the original code towards using mysql. This code would need to be modified to accomodate the current ORM functionality in it. The [mysql.sql](./mysql.sql) is there as a reference for those wanting to migrate this to MySQL. Otherwise mongoose is fully enabled currently.

## Screenshots
Mobile PWA version has favourites enabled in offline mode, but upload and logout are disabled when offline.

![PWA Screenshot](./app-view.jpg?raw=true "PWA Screenshot")

