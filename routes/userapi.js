var express = require('express');
var router = express.Router();

var mongoose = require( 'mongoose' );
var User = mongoose.model('User');
var bCrypt = require('bcrypt-nodejs');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    //allow all get request methods    
    //if(req.method === "GET"){
    //    return next();
    //}
    if (req.isAuthenticated()){
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

//Register the authentication middleware
router.use('/', isAuthenticated);


//api for all posts
router.route('/')

    //gets all posts
    .get(function(req, res){
        User.find(function(err, posts){
            if(err){
                return res.send(500, err);
            }
            return res.send(posts);
        });
    });

//api for a specfic post
router.route('/:id')
    //gets specified post
    .get(function(req, res){       
        User.findById(req.param('id'), function(err, post){
            if(err)
                res.send(err);
            res.json(post);
        });

    })
    .delete(function(req, res) {
        console.log(req.param('id'));
        User.remove({
            _id: req.param('id')
        }, function(err) {
            if (err)
                res.send(err);
            res.json("deleted :(");
        });
    })
    .put(function(req, res) {
           User.findById(req.param('id'), function(err, user){            
                
                user.username = req.body.username;
                user.name = req.body.name;
                user.email = req.body.email;
                user.password = createHash(req.body.newPassword);               
                user.save(function(err, user){
                    if(err)
                        res.send(err);

                    res.json(user);
                });
                
            });
        }); 

    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

module.exports = router;
    