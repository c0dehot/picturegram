const express = require( 'express' );
const bcrypt = require ("bcrypt");
const PORT = process.env.PORT || 8080;
const orm = require( './orm' );

const app = express();

app.use( express.static('public') );
app.use( express.urlencoded({ extended: false }) );

const saltRounds = 10;

app.post("/user/create",async function (req,res){
    
    await bcrypt.hash(req.body.passwordsignup, saltRounds, function(err,hash){
        db.User.create({

            name:req.body.usernamesignup,
            email:req.body.emailsignup,
            password:hash

        }).then (function(data){
            if (data){
                res.redirect("/home")
            }
        
        })

    })

});

//login page: storing and comparing email and password,and redirecting to home page after login
app.post('/user', function (req, res) {

    db.User.findOne({

         where: {
             email: req.body.email
                }

    }).then(function (user) {
        if (!user) {
           res.redirect('/');
        } else {

        bcrypt.compare(req.body.password, user.password, function (err, result) {

            if (result == true) {
                res.redirect('/home');

            } else {
                res.send('Incorrect password');
                res.redirect('/');

            }

            });
            
            }
 });
});



