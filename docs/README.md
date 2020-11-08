# Picturegram

This is a simple instagram-like app that allows you upload pictures.

It is nearly fully PWA-enabled to work in offline mode on your phone... hopefully it will be a good starting point for a instgram-type project for some of you!

## Contributors
See [CONTRIBUTORS.md](./CONTRIBUTORS.md)


## Database
It is built around mongo with mongoose.

But in app/orm/mysql.js you will see the original code towards using mysql. This code would need to be modified to accomodate the current ORM functionality in it. The [mysql.sql](./mysql.sql) is there as a reference for those wanting to migrate this to MySQL. Otherwise mongoose is fully enabled currently.

## Screenshots
Mobile PWA version has favourites enabled in offline mode, but upload and logout are disabled when offline.

![PWA Screenshot](./app-view.jpg?raw=true "PWA Screenshot")

