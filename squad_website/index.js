/*jslint node: true */
'use strict';

// Declare variables used
var squad_website, express, request, cors;
express = require('express');
request = require('request');
cors = require('cors');


//WEBSITE
//Landing Page Templating
squad_website = express();
//set up sockets
squad_website.set('views', __dirname + '/views');
squad_website.set('view engine', "jade"); 
squad_website.set('port', 3002); 
squad_website.use(express.static('views'));
squad_website.use(cors());
//routes
squad_website.get('/', function (req, res) {
  	res.render('squad_index');
});
squad_website.listen(squad_website.get('port'), function(req, res) {
 console.log('Server listening at ' + squad_website.get('port'));
});













