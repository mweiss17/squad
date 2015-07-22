
//var rooms;
var socket = io('http://ecstatic.fm:8080/');
console.log({ username: 'anonymous squid' });
//socket.emit('post_location', JSON.stringify({latitude:1.0, longitude:1.0, username: 'anonymous squid'}))
socket.emit('get_server_time');
socket.on('returned_get_server_time', function (data){
    console.log("server time="+data);
});

/*socket.on('return_post_location', function (data) {
	console.log("location returned");
	socket.emit('get_rooms_around_me', JSON.stringify({ username: 'anonymous squid' }));    
});
socket.on('return_get_rooms_around_me', function (data) {
	rooms = data.rooms;
	console.log("data.rooms="+data.rooms);
	for (var i = 0; i < rooms.length ; i++) {
		if(rooms[i].room_info.room_name === "International Startup Fest"){
			console.log("yep");
		}
	}
});
*/

/*

+ (void) connect{
    static_socket = [[SocketIOClient alloc] initWithSocketURL:@"http://ecstatic.fm:8080" options:nil];
    
    [static_socket on: @"connect" callback: ^(NSArray* data, void (^ack)(NSArray*)) {
        NSLog(@"here connected");
    }];
    
    [static_socket on: @"return_post_location" callback: ^(NSArray* data, void (^ack)(NSArray*)){
        NSLog(@"Posted a location");
    }];
    
    [static_socket on:@"return_create_room" callback:^(NSArray * data, void (^ack) (NSArray*)){
        NSLog(@"create room returned,%@", data[0]);
        NSDictionary* room_info_dict =[((NSDictionary*) data[0]) objectForKey:@"room_info"];
        //        NSArray* room_info = [room_info_dict objectForKey:@"room_info"];
        [[Room currentRoom] initWithDict:room_info_dict];
    }];
    
    [static_socket on:@"join" callback:^(NSArray * data, void (^ack) (NSArray*)){
        NSLog(@"another user just joined you in the room");
    }];
	
	[static_socket on:@"return_join_room" callback:^(NSArray * data, void (^ack) (NSArray*)){
		NSLog(@"return_join_room returned,%@", data[0]);
	}];
    
    [static_socket on:@"leave_room" callback:^(NSArray * data, void (^ack) (NSArray*)){
        NSLog(@"one of the users just left the room");
    }];
	
	[static_socket on:@"send_text" callback:^(NSArray * data, void (^ack) (NSArray*)){
		NSLog(@"send_text returned,%@", data[0]);
		NSString* textMessage =[((NSDictionary*) data[0]) objectForKey:@"textMessage"];
		NSString* username =[((NSDictionary*) data[0]) objectForKey:@"username"];
		AppDelegate* appDelegate = [[UIApplication sharedApplication]delegate];
        
		[appDelegate.chatViewController addChatText:username content:textMessage];
	}];

    
    [static_socket on:@"return_get_player_status" callback:^(NSArray * data, void (^ack) (NSArray*)){
        NSDictionary *d = (NSDictionary*)data[0];
        NSDictionary *player_state = [d objectForKey:@"player_state"];
        
        if(player_state == NULL || player_state == (id)[NSNull null] )
        {
            [[Player sharedPlayer] joinPlayingRoom:0 withElapsedTime:0.0f andIsPlaying:0];
            return;
        }
        
        NSNumber *current_time_from_server = (NSNumber*)[d objectForKey:@"current_time"];
        
        int song_index = [[player_state objectForKey:@"playing_song_index"] intValue];
        int is_playing = [[player_state objectForKey:@"is_playing"] intValue];
        
        
        NSNumber *elapsed_time = [NSNumber numberWithInt:[[player_state objectForKey:@"elapsed"] intValue]];
        NSNumber *server_timestamp = (NSNumber*)[player_state objectForKey:@"timestamp"];
        
        float ctfs = [current_time_from_server longValue];
        float st = [server_timestamp longValue];
        float et = [elapsed_time intValue];
        float el = (float)ctfs - (float)st + (float)(1.0f*et);
        
        BOOL playing = is_playing;

        [[Player sharedPlayer] joinPlayingRoom:song_index withElapsedTime:el andIsPlaying:playing ];
    }];
    
    [static_socket on:@"realtime_player" callback:^(NSArray * data, void (^ack) (NSArray*)){
        NSString *username = [[NSUserDefaults standardUserDefaults] objectForKey:@"username"];
        NSDictionary *d = (NSDictionary*)data[0];
        NSString *usr = [d objectForKey:@"username"];
        if([usr isEqualToString:username]){
            return;
        }
        NSString *command = [d objectForKey:@"msg_type"];
        if([command isEqualToString:@"play"])
        {
            [[Player sharedPlayer] updatePlaylist];
            [[Player sharedPlayer] play];
        }else if([command isEqualToString:@"pause"])
        {
            [[Player sharedPlayer] updatePlaylist];
            [[Player sharedPlayer] play];
        }else if([command isEqualToString:@"skip"])
        {
            [[Player sharedPlayer] next];
        }else if([command isEqualToString:@"back"])
        {
            [[Player sharedPlayer] last];
        }else{
            NSLog(@"unlogged command returned from server!!!!!");
        }
    }];
    
    [static_socket on:@"return_get_playlist" callback:^(NSArray * data, void (^ack) (NSArray*)){
        NSDictionary *d = (NSDictionary*)data[0];
        NSArray* songs = [d objectForKey:@"playlist"];
        NSMutableDictionary *concat_dict = [[NSMutableDictionary alloc] init];
        int counter = 0;
        for(NSString *song in songs)
        {
            NSData *data = [song dataUsingEncoding:NSUTF8StringEncoding];
            NSDictionary *playlist_dict = [NSJSONSerialization JSONObjectWithData:data options:nil error:nil];
            [concat_dict setValue:playlist_dict forKey:[NSString stringWithFormat:@"%d", counter]];
            counter++;
        }
        
        [[Playlist sharedPlaylist] initWithDict:concat_dict];
        // may cause app to start playing music before right spot is reached (stop this!)
        [[Playlist sharedPlaylist] reloadPlayer];
        [SDSAPI getPlayerState:[Room currentRoom].room_number];
        // RE Show UI
    }];
    
    [static_socket on:@"add_song" callback:^(NSArray * data, void (^ack) (NSArray*)){
        NSDictionary *song = ((NSDictionary*) data[0]);
        if([[[NSUserDefaults standardUserDefaults] objectForKey:@"username"] isEqual:[song objectForKey:@"username"]]){
            return;
        }
        [[Playlist sharedPlaylist] addTrack: [[MediaItem alloc] initWIthDict:song] ];
        [[Playlist sharedPlaylist] reloadPlayer];
        NSLog(@"song received");
    }];
    
    [static_socket connect];
}

//Rewrite with Async timeout wait
+(void) createRoom:(NSString*)username{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        while(!static_socket.connected){
            //            NSLog(@"static_socket connected inside=%d", static_socket.connected);
            [NSThread sleepForTimeInterval:0.1f];
        }
        
        NSDictionary * postDictionary = [NSDictionary dictionaryWithObjects:@[username, username, [self getDictForPlayerState]]
                                                                    forKeys:@[@"username", @"room_name", @"player_state"]];
        
        NSData * jsonData = [NSJSONSerialization dataWithJSONObject:postDictionary options:NSJSONReadingMutableContainers error:nil];
        [static_socket emitObjc:@"create_room" withItems:@[jsonData]];
    });
}



+(void) aroundMe:(NSString*)username withID:(id)sender{
    
    [static_socket on: @"return_get_rooms_around_me" callback: ^(NSArray* data, void (^ack)(NSArray*)) {
        NSLog(@"get_rooms_around_me returned,%@", data[0]);
        NSDictionary* locationsDict =(NSDictionary*) data[0];
        NSArray* locationsArray = [locationsDict objectForKey:@"rooms"];
        [sender showRoomsScrollView:locationsArray];
    }];
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        while(!static_socket.connected){
            //			NSLog(@"static_socket connected inside=%d", static_socket.connected);
            [NSThread sleepForTimeInterval:0.1f];
        }
        
        NSDictionary * postDictionary = [NSDictionary dictionaryWithObjects:[NSArray arrayWithObjects: username, nil]
                                                                    forKeys:[NSArray arrayWithObjects:@"username", nil]];
        
        NSData * jsonData = [NSJSONSerialization dataWithJSONObject:postDictionary options:NSJSONReadingMutableContainers error:nil];
        [static_socket emitObjc:@"get_rooms_around_me" withItems:@[jsonData]];
    });
    
    
}

+(void)postLocation:(NSString*)username withLatitude:(float)latitude withLongitude:(float)longitude
{
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        while(!static_socket.connected)
        {
            //           NSLog(@"waiting to connect!");
            [NSThread sleepForTimeInterval:0.1f];
        }
        NSLog(@"username, latitude, longitude: %@, %f, %f", username, latitude, longitude);
        NSArray *objects = [NSArray arrayWithObjects:username, @(latitude), @(longitude), nil];
        NSArray *keys = [NSArray arrayWithObjects:@"username", @"latitude", @"longitude", nil];
        NSDictionary *postDictionary = [NSDictionary dictionaryWithObjects:objects forKeys:keys];
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:postDictionary options:NSJSONReadingMutableContainers error:nil];
        [static_socket emitObjc:@"post_location" withItems:@[jsonData]];
    });
}

+(void) sendMediaItemToServer:(MediaItem*)media_item
{
    media_item.room_number = [Room currentRoom].room_number;
    NSDictionary* item = [media_item serializeMediaItem];
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:item
                                                       options:nil
                                                         error:&error];
    
    if (! jsonData) {
        NSLog(@"Didnt work kid");
    } else {
        [static_socket emitObjc:@"add_song" withItems:@[jsonData]];
    }
    
    
}

+(void)leaveRoom
{
    NSString *username = [[NSUserDefaults standardUserDefaults] objectForKey:@"username"];
    NSDictionary *leaveDict  = [NSDictionary dictionaryWithObjects:@[[Room currentRoom].room_number, username] forKeys:@[@"room_number", @"username"]];
    NSData *leaveJson = [NSJSONSerialization dataWithJSONObject:leaveDict options:nil error:nil];
    [static_socket emitObjc:@"leave_room" withItems:@[leaveJson]];
}

+(void)joinRoom:(NSString*)new_room_number
{
    NSString *username = [[NSUserDefaults standardUserDefaults] objectForKey:@"username"];
    NSArray * obj = @[new_room_number, username];
    NSArray * ky = @[@"room_number", @"username"];
    NSDictionary *joinDict  = [NSDictionary dictionaryWithObjects:obj forKeys:ky];
    NSString *rn = [NSString stringWithFormat:@"%@",[Room currentRoom].room_number];
    NSLog(@"From Room: %@", [Room currentRoom].room_number);
    NSDictionary *leaveDict  = [NSDictionary dictionaryWithObjects:@[rn, username] forKeys:ky];
    NSData *joinJson = [NSJSONSerialization dataWithJSONObject:joinDict options:nil error:nil];
    NSData *leaveJson = [NSJSONSerialization dataWithJSONObject:leaveDict options:nil error:nil];
    NSLog(@"room number: %@ current Room: %@",new_room_number, [Room currentRoom].room_number);
    if([new_room_number isEqualToString:[Room currentRoom].room_number])
    {
        return;
    }else if([new_room_number isEqualToString:@"0"])
    {
        [static_socket emitObjc:@"join_room" withItems:@[joinJson]];
    }else{
        [static_socket emitObjc:@"leave_room" withItems:@[leaveJson]];
        if([Room currentRoom].is_owner)
        {
            [Room currentRoom].is_owner = NO;
            // query server and tell it I'm not the owner
        }
        [static_socket emitObjc:@"join_room" withItems:@[joinJson]];
    }
    [Room currentRoom].room_number = new_room_number;
    [[Room currentRoom] makeNotOwner];
    [SDSAPI getPlaylist:new_room_number];
}

+(void)getPlayerState:(NSString*)room_number
{
    NSDictionary *gps  = [NSDictionary dictionaryWithObjects:@[room_number] forKeys:@[@"room_number"]];
    NSData *json = [NSJSONSerialization dataWithJSONObject:gps options:nil error:nil];
    [static_socket emitObjc:@"get_player_status" withItems:@[json]];
}

+(void)getPlaylist:(NSString*)room_number
{
    NSDictionary *playlist_query = [NSDictionary dictionaryWithObjects:@[room_number] forKeys:@[@"room_number"]];
    NSData *json = [NSJSONSerialization dataWithJSONObject:playlist_query options:nil error:nil];
    [static_socket emitObjc:@"get_playlist" withItems:@[json]];
}

+ (void)play
{
    NSString *room_number = [Room currentRoom].room_number;
    NSString *username = [[NSUserDefaults standardUserDefaults] objectForKey:@"username"];
    if([room_number isEqualToString:nil])
    {
        room_number = @"0";
    }
    NSDictionary *play_query = [NSDictionary dictionaryWithObjects:@[username, room_number, @"play", [self getDictForPlayerState]] forKeys:@[@"username", @"room_number", @"msg_type", @"player_state"]];
    NSData *json = [NSJSONSerialization dataWithJSONObject:play_query options:nil error:nil];
    [static_socket emitObjc:@"player" withItems:@[json]];
}

+ (void)next
{
    NSString *room_number = [Room currentRoom].room_number;
    NSString *username = [[NSUserDefaults standardUserDefaults] objectForKey:@"username"];
    
    NSDictionary *play_query = [NSDictionary dictionaryWithObjects:@[username, room_number, @"next", [self getDictForPlayerState]] forKeys:@[@"username", @"room_number", @"msg_type", @"player_state"]];
    NSData *json = [NSJSONSerialization dataWithJSONObject:play_query options:nil error:nil];
    [static_socket emitObjc:@"player" withItems:@[json]];
}

+ (NSDictionary*) getDictForPlayerState
{
    NSString *elspd = [NSString stringWithFormat:@"%i",(int)CMTimeGetSeconds([Player sharedPlayer].avPlayer.currentTime)];
    if([elspd isEqual:[NSString stringWithFormat:@"%i",INT_MIN]])
    {
        elspd = @"0";
    }
    return [NSDictionary dictionaryWithObjects:@[ [NSString stringWithFormat:@"%i",[[Player sharedPlayer] isPlaying]], [NSString stringWithFormat:@"%i", [Player sharedPlayer].currentTrackIndex], elspd] forKeys:@[@"is_playing", @"playing_song_index", @"elapsed"]];
}

+(void) last
{
    NSString *room_number = [Room currentRoom].room_number;
    NSString *username = [[NSUserDefaults standardUserDefaults] objectForKey:@"username"];
    
    NSDictionary *play_query = [NSDictionary dictionaryWithObjects:@[username, room_number, @"last", [self getDictForPlayerState]] forKeys:@[@"username", @"room_number", @"msg_type", @"player_state"]];
    NSData *json = [NSJSONSerialization dataWithJSONObject:play_query options:nil error:nil];
    [static_socket emitObjc:@"player" withItems:@[json]];
}

+(void) updatePlayerState
{
    NSString *room_number = [Room currentRoom].room_number;
    NSDictionary *ps = [self getDictForPlayerState];
    
    NSDictionary *update_query = [NSDictionary dictionaryWithObjects:@[room_number, ps] forKeys:@[@"room_number", @"player_state"]];
    NSData *json = [NSJSONSerialization dataWithJSONObject:update_query options:nil error:nil];
    [static_socket emitObjc:@"update_player_state" withItems:@[json]];
}

+(void) sendText:(NSString*)textMessage
{
    NSString *room_number = [Room currentRoom].room_number;
    NSString *username = [[NSUserDefaults standardUserDefaults] objectForKey:@"username"];
    
    NSDictionary *textDict = [NSDictionary dictionaryWithObjects:@[room_number, textMessage, username] forKeys:@[@"room_number", @"textMessage", @"username"]];
    NSData *json = [NSJSONSerialization dataWithJSONObject:textDict options:nil error:nil];
    [static_socket emitObjc:@"send_text" withItems:@[json]];
}

+(void)userHitPlay
{
    NSLog(@"User Hit Play");
}

+(void)userHitPause
{
    NSLog(@"User Hit Pause");
}

+(void) seek
{
    
}
*/