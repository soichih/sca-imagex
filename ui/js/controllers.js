'use strict';

/*
 * Right now, we are going to have a single module for our app which contains
 * all controllers. In the future, we should refactor into multiple modules. When I do, don't forget
 * to add it to app.js's module list
 * */

app.controller('HeaderController', ['$scope', 'appconf', 'toaster', '$http', 'jwtHelper', 'serverconf', 'menu',
function($scope, appconf, toaster, $http, jwtHelper, serverconf, menu) {
    $scope.title = appconf.title;
    serverconf.then(function(_c) { $scope.serverconf = _c; });
    menu.then(function(_menu) { $scope.menu = _menu; });
}]);

app.controller('AboutController', ['$scope', 'appconf', 'toaster', '$http', 'jwtHelper', 'serverconf', 'menu', 'scaMessage',
function($scope, appconf, toaster, $http, jwtHelper, serverconf, menu, scaMessage) {
    $scope.title = appconf.title;
    serverconf.then(function(_c) { $scope.serverconf = _c; });
    menu.then(function(_menu) { $scope.menu = _menu; });
    scaMessage.show(toaster);
}]);

app.controller('ViewerController', ['$scope', 'appconf', 'toaster', '$http', '$cookies', '$location', 'jwt', '$timeout', 'scaMessage',
function($scope, appconf, toaster, $http, $cookies, $location, jwt, $timeout, scaMessage) {
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
            $("#tileviewer").tileviewer({
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

