//
var elapsed = 100;
var trackIndex = 0;
var timeOfReturn = 0;

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-27668159-4', 'auto');
  ga('send', 'pageview');
//end Google Analytics
//start Mixpanel

(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
mixpanel.init("3cc8de265eae4e9f76364871a4ae56e7", {
    loaded: function() {
        distinct_id = mixpanel.get_distinct_id();
    }
});

function clickBeta(){
        mixpanel.track("ISF to beta");
}

//Angular Module
var app = angular.module('ecstatic', 
	[  
    //List of Libraries imported into Angular      
	"ngSanitize",
    "plangular",
    "ngAnimate",
	]
)

//configure plangular
.config(function(plangularConfigProvider){
    plangularConfigProvider.clientId = '96c11abd04d7d34dc518d9f3ec10a2bc';
})

//the Main Controller, gets info from server, updates scope for index.jade
.controller('mainController',['$scope', '$http', function($scope, $http) {

        //query index.js
        $http.get('/appapi/upcomingEvents')
        .success(function(data) {

            //parse the data
            $scope.upcomingEvents = data;
            $scope.server_playlist = data.playlist;
           
            //call this function every second
            countdown(data.start_time, function(ts){
                console.log("ts.value="+ts.value);
                
                //every second
                if(!$scope.$$phase) {
                  console.log("$scope.trackIndex = trackIndex;"+trackIndex);
                  $scope.trackIndex = trackIndex;
                  $scope.$apply() 
                }

                //if there are less than 2 seconds left before the event, hide the join button
                if(ts.value < -2000){
                  $scope.showButton = "hidden";
                }

                //if the event has not started, hide a label and button 
                else{
                  $scope.currentlyPlaying = "hidden";
                  $scope.showButton = "asdfasdfsdf";
                }

                //update the countdown every second
                document.getElementById('seconds').innerHTML = ts.seconds.toString();
                document.getElementById('minutes').innerHTML = ts.minutes.toString();
                document.getElementById('hours').innerHTML = ts.hours.toString();
              }, 
          countdown.HOURS | countdown.MINUTES | countdown.SECONDS, 3);
      })
      .error(function(data) {
          console.log('Error: ' + data);
      });

      //query index.js
      $http.get('/appapi/sync')
      .success(function(data) {
          timeOfReturn = new Date().getTime();
          var json = JSON.parse(data);
          console.log("http.get('/app/api/sync'), timeOfReturn = "+ timeOfReturn);
          console.log("http.get('/app/api/sync'), json = "+ data);
          if(json.elapsedTime > 0){
            elapsed = json.elapsedTime;

            //FOR GETTING THE ACTUAL TRACK INDEX
            trackIndex = json.trackIndex;

            // updates the playlist's selected track
            console.log("trackIndex="+trackIndex);
            $scope.trackIndex = trackIndex;

            //FOR TESTING
            //trackIndex = 1;
          }
          else{
            console.log("event hasn't started");
          }
      })
      .error(function(data) {
          console.log('Error: ' + data);
      });

    $scope.update_selected_track = function(index){
        $scope.trackIndex = index;
        if(!$scope.$$phase) {
          $scope.$apply() 
        }
    }
}]);
