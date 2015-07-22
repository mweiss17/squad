/*jslint node: true */
'use strict';

// Declare variables used
var squad_website, express, request, cors;
express = require('express');
request = require('request');
cors = require('cors');

//PROXY
var httpProxy = require('http-proxy');

var options = { router: {
  'squad.fm/app'  : 'localhost:3001',
  '.*'     : 'localhost:3002'  // default route
}}

var router = new httpProxy.createServer(options).listen(3000);













