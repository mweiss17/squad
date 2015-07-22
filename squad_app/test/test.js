/*jslint node: true */
/*global describe: false, before: false, after: false, it: false */
"use strict";

// Declare the variables used
var expect = require('chai').expect,
    assert = require('chai').assert,
    request = require('request'),
    server = require('../index'),
    redis = require('redis'),
    io = require('socket.io-client'),
    client;
client = redis.createClient();

var socket = io.connect('http://localhost:8080', {
    'reconnection delay' : 0,
    'reopen delay' : 0,
    'force new connection' : true
}); 

describe('SYNC TESTS', function () {
    describe('calculateElapsedTime', function () {
        //posts two locations
        it("should calculate the elapsed", function (done) {
            console.log("here");
            request.get({ url: 'http://localhost:80/api/sync' }, function (error, response, body) {
                console.log(body);
                done();
            });    
        });
    });
});

describe('ROOMS API', function () {

    describe('post_location', function () {

        //posts two locations
        it("should post two users locations", function (done) {
            var returned_twice = false;
            socket.emit('post_location', JSON.stringify({username: "mweiss10", lat: 30.0, lon: 40.0}));
            socket.emit('post_location', JSON.stringify({username: "mykul", lat: 40.0, lon: 50.0}));
            socket.on('return_post_location', function (data) {
                if(returned_twice){
                    done();
                }
                else{
                    returned_twice = true;
                }
            });
        });
    });

    describe('subscribe_to_ecstatic', function () {
        it("should subscribe the user to general updates", function (done) {
            socket.emit('subscribe_to_ecstatic');
            done();
        });
    });

    describe('create_room', function () {
        it("should create a room for one person", function (done) {
            var returned_twice = false;
            socket.emit('create_room', JSON.stringify({username: "mweiss10", room_name: "testy_room", player_state:{'is_playing': false, 'playing_song_index':0, 'elapsed':0}}));
            socket.on('return_create_room', function (data) {
                if(returned_twice){
                    done();
                }
                else{
                    returned_twice = true;
                }
            });
            socket.on('create_room', function (data) {
                if(returned_twice){
                    done();
                }
                else{
                    returned_twice = true;
                }
            });
        });
    }); 

    //prereturnring for the join_room test (should get this chatlog message) 
    describe('send_text_chatlog', function() {
        it("should store a message in the chatlog", function (done) {
            socket.emit('send_text', JSON.stringify({room_number:0, username:"mweiss10", message:"anyone there?"}));
            done();
        });
    });

    describe('get_rooms_around_me', function () {
        it("should get one room", function (done) {
            socket.emit('get_rooms_around_me', JSON.stringify({username: "mykul"}));
            socket.on('return_get_rooms_around_me', function (data) {
                console.log("json.rooms"+data.rooms[0].room_info.room_name);
                assert.include(data.rooms[0].room_info.room_name, "testy_room");
                done();
            });
        });
    });

    //Join room returns a JSON to the person who joined 
    //with the chatlog of the room, and playlist.
    //It also notifies everyone that the person joined
    describe('join_room', function () {
        it("should put two users in one room", function (done) {
            socket.emit('join_room', JSON.stringify({username: "mykul", room_number:0}));
            socket.on('join', function (data) {
                done();
            });
            //also returns "return_join_room" with a chatlog
        });
    });

    describe('join_event', function () {
        it("should join an event (with no one in it)", function (done) {
            socket.emit('join_room', JSON.stringify({username: "carlos", room_number:-10}));
            var returned_twice = false;
            socket.on('return_join_room', function (data) {
                done();
            });
        });
    });


    describe('get_list_of_users', function () {
        it("should get two users in one room", function (done) {
            socket.emit('get_user_list', JSON.stringify({room_number:0}));
            socket.on('return_get_user_list', function (data) {
                expect(data.length).to.equal(2);
                done();
            });
        });
    });

    describe('add_songs', function () {
        it("should add two songs to the playlist", function (done) {
            var returned_twice = false;
            socket.emit('add_song', JSON.stringify({room_number:0, duration:120, artwork_url:"https:test1", stream_url:"https:test1", song_name:'snow', artist:'Red Hot Chili Peppers', username:'mykul'}));
            socket.emit('add_song', JSON.stringify({room_number:0, duration:150, artwork_url:"https:test2", stream_url:"https:test2", song_name:'creep', artist:'radiohead', username:'mweiss10'}));
            socket.on("add_song", function (data) {
                if(returned_twice){
                    done();
                }
                else{
                    returned_twice = true;
                }
            });
        });
    });

    describe('get_playlist', function () {
        it("should get a playlist with two songs", function (done) {
            socket.emit('get_playlist', JSON.stringify({room_number:0}));
            socket.on("return_get_playlist", function (data) {
                expect(data.playlist.length).to.equal(2);
                done();
            });
        });
    });

    describe('move_song', function () {
        it("should reorder the songs", function (done) {
            socket.emit('move_song', JSON.stringify({"new_index":0, "room_number":0, "to_insert":{room_number:0, duration:150, artwork_url:"https:test2", stream_url:"https:test2", song_name:'creep', artist:'radiohead', username:'mweiss10'}}));
            socket.on("move_song", function (data) {
                done();
            });
        });
    });

    describe('remove_song', function () {
        it("should remove a song from the playlist", function (done) {
            socket.emit('remove_song', JSON.stringify({room_number:0, duration:120, artwork_url:"https:test1", stream_url:"https:test1", song_name:'snow', artist:'Red Hot Chili Peppers', username:'mykul'}));
            socket.on("remove_song", function (data) {
                done();
            });
        });
    });

    describe('send_text', function() {
        it("should send a realtime message to both users", function (done) {
            socket.emit('send_text', JSON.stringify({room_number:0, message:"yo does this chat work?"}));
            socket.on('send_text', function (data) {
                done();
            });
        });
    });

    describe('player play', function () {
        it("should send a play message", function (done) {
            var count = 0;
            socket.emit('player', JSON.stringify({room_number:0, username:"mweiss10", msg_type:"play", player_state:{'is_playing': true, 'is_locked': false, 'playing_song_index':3, 'elapsed': 44}}));
            socket.emit('player', JSON.stringify({room_number:0, username:"mweiss10", msg_type:"skip", player_state:{'is_playing': true, 'is_locked': false, 'playing_song_index':4, 'elapsed': 0}}));
            socket.emit('player', JSON.stringify({room_number:0, username:"mweiss10", msg_type:"back", player_state:{'is_playing': true, 'is_locked': false, 'playing_song_index':3, 'elapsed': 0}}));
            socket.emit('player', JSON.stringify({room_number:0, username:"mweiss10", msg_type:"lock", player_state:{'is_playing': true, 'is_locked': true, 'playing_song_index':3, 'elapsed': 0}}));
            socket.on('realtime_player', function (data) {
                console.log(data.msg_type);
                if(data.msg_type==="play"){
                    count++;
                }
                if(data.msg_type==="skip"){
                    count++;
                }
                if(data.msg_type==="back"){
                    count++;
                }
                if(data.msg_type==="lock"){
                    count++;
                }
                if (count == 4){
                    done();
                }
            });
        });
    });

    describe('get_player_status', function () {
        it("should get a player status json", function (done) {
            var count = 0;
            socket.emit('get_player_status', JSON.stringify({room_number:0}));
            socket.on('return_get_player_status', function (data) {
                console.log(data);
                done();
            });
        });
    });

    describe('leave_room', function () {
        it("should remove one user from room", function (done) {
            socket.emit('leave_room', JSON.stringify({username: "mykul", room_number:0}));
            socket.on('leave_room', function (data) {
                done();
            });
        });
    });

    describe('check_unsubscribed', function () {
        it("should unsubscribe to room updates after leaving the room", function (done) {
            socket.emit('add_song', JSON.stringify({room_number:0, duration:120, artwork_url:"https:test1", stream_url:"https:test1", song_name:'snow', artist:'Red Hot Chili Peppers', username:'test'}));
            socket.on('add_song', function (data) {
                console.log("ERROR did not unsubscribe");
                done();
            });
            done();
        });
    });
    
    describe('toggleLock', function () {
        it("should unsubscribe to room updates after leaving the room", function (done) {
            socket.emit('add_song', JSON.stringify({room_number:0, duration:120, artwork_url:"https:test1", stream_url:"https:test1", song_name:'snow', artist:'Red Hot Chili Peppers', username:'test'}));
            socket.on('add_song', function (data) {
                console.log("ERROR did not unsubscribe");
                done();
            });
            done();
        });
    });
    
    // Afterwards, stop the server and empty the database
    after(function (done) {
        console.log('Stopping the server');
        client.flushdb();
        done();
    });

});

