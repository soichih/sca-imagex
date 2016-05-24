'use strict';

/*
 * Right now, we are going to have a single module for our app which contains
 * all controllers. In the future, we should refactor into multiple modules. When I do, don't forget
 * to add it to app.js's module list
 * */

app.controller('HeaderController', ['$scope', 'appconf', 'toaster', '$http', 'jwtHelper', 'menu',
function($scope, appconf, toaster, $http, jwtHelper, menu) {
    $scope.title = appconf.title;
    //serverconf.then(function(_c) { $scope.serverconf = _c; });
    $scope.menu = menu;
}]);

app.controller('AboutController', ['$scope', 'appconf', 'toaster', '$http', 'jwtHelper', 'scaMessage',
function($scope, appconf, toaster, $http, jwtHelper, scaMessage) {
    $scope.title = appconf.title;
    //serverconf.then(function(_c) { $scope.serverconf = _c; });
    //menu.then(function(_menu) { $scope.menu = _menu; });
    scaMessage.show(toaster);
}]);

app.controller('ViewerController', ['$scope', 'appconf', 'toaster', '$http', '$cookies', '$location', 'jwt', 'scaMessage',
function($scope, appconf, toaster, $http, $cookies, $location, jwt, scaMessage) {
    scaMessage.show(toaster);
    
    $scope.title = appconf.title;
    //console.dir(jwt);
    //toaster.pop('error', 'title', 'Hello there');
    //toaster.pop('success', 'title', 'Hello there');
    //toaster.pop('wait', 'title', 'Hello there');
    //toaster.pop('warning', 'title', 'Hello there');
    //toaster.pop('note', 'title', 'Hello there');
    //toaster.success('title', 'Hello there');
    //toaster.error('title', 'Hello there');

    $scope.path = $location.path(); //like .."/exobj/48599";
    if($scope.path == "") {
        /*
        //some reason, I can't display toaster message during the init phase of controller
        $timeout(function() {
            toaster.pop('error', '', 'Please specify path for the image to display.');
        }, 0);
        */
    } else {
        //authorize and initialize tileviewer
        $http({
            url: appconf.api+'/authorize',
            method: 'POST',
            data: {path: $scope.path}
        }).then(function(res) {
            $("#viewer").tileviewer({
                access_token: res.data.access_token,
                //TODO - make it so that tileviewer can take array of URLs - for load balancing
                src: appconf.data_urls+$scope.path+"/main_tiles"
            });
        }, function(err) {
            console.dir(err);
            toaster.error('Failed to authorize your access', data.statusText);
        });
    }
}]);

app.controller('SDViewerController', ['$scope', 'appconf', 'toaster', '$http', '$cookies', '$location', 'jwt', 'scaMessage',
function($scope, appconf, toaster, $http, $cookies, $location, jwt, scaMessage) {
    scaMessage.show(toaster);
    $scope.title = appconf.title;
    $scope.path = $location.path(); //like .."/exobj/48599";
    
    //authorize and initialize seadragon
    $http({
        url: appconf.api+'/authorize',
        method: 'POST',
        data: {path: $scope.path}
    }).then(function(res) {
        var jwt = res.data.access_token;
        
        //load info.json
        $http.get(appconf.data_urls+$scope.path+"/main_tiles/info.json", {
            headers: {"Authorization":"Bearer "+jwt}
        }).then(function(res) {
            var info = res.data;
            //{"width": 8000, "filetype": "jpg", "tilesize": 512, "height": 7590}

            var max_dim = Math.max(info.height, info.width);
            var max_level = Math.ceil(Math.log2(max_dim/info.tilesize));

            if(!info.filetype) info.filetype = "png";
            
            //now.. initialize seadragon
            var viewer = OpenSeadragon({
                id: "viewer",
                //debugMode: true,
                showNavigator: true,
                showRotationControl: true,

                //prefix for openseadragon icons
                prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",
                tileSources:   {
                    height: info.height,
                    width:  info.width,
                    tileSize: info.tilesize,
                    maxLevel: max_level,
                    //minLevel: min_level,
                    getTileUrl: function( level, y, x ){
                        var rlevel = max_level-level;
                        var tilenum = Math.floor(info.width / (info.tilesize*Math.pow(2,rlevel)))+1;
                        var tileid = x*tilenum + y;
                        //console.log([rlevel, x, y, tileid, tilenum]);
                        return appconf.data_urls+$scope.path+"/main_tiles/level"+rlevel+"/"+tileid+"."+info.filetype+"?at="+jwt;
                        //return "https://s3.amazonaws.com/com.modestmaps.bluemarble/" + (level-8) + "-r" + y + "-c" + x + ".jpg";
                    }
                }
            });
        }, function(err) {
            //failed to load info.json
            toaster.error(err);
        });
        

    }, function(err) {
        toaster.error('Failed to authorize your access', data.statusText);
    });
}]);

