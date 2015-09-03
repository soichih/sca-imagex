'use strict';

/*
 * Right now, we are going to have a single module for our app which contains
 * all controllers. In the future, we should refactor into multiple modules. When I do, don't forget
 * to add it to app.js's module list
 * */

app.controller('ImagexController', ['$scope', 'appconf', 'toaster', '$http', '$cookies', '$location', 'jwt', '$timeout', 
function($scope, appconf, toaster, $http, $cookies, $location, jwt, $timeout) {
    //console.dir(jwt);
    /* done via app.js
    //make sure we have good jwt
    var jwt = localStorage.getItem(appconf.jwt_id);
    var needlogin = false;
    if(!jwt) {
        needlogin = true;
    } else {
        var expdate = jwtHelper.getTokenExpirationDate(jwt);
        var ttl = expdate - Date.now();
        if(ttl < 0) {
            needlogin = true;
        }
    }

    if(needlogin) {
        console.log("user doesn't have valid jwt token - redirecting to login page");
        document.location = appconf.url.login+"?redirect="+encodeURIComponent(document.location);
        return;
    }
    */

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
            url: appconf.api.imagex+'/authorize',
            method: 'POST',
            data: {path: $scope.path}
        }).then(function(res) {
            //toaster.pop('note', 'title', 'how do you do?');
            //toaster.success('random message');
            var access_token = res.data.access_token; //we don't store this in local storage.. this is SOP only
            //initialize tileviewer
            $("#tileviewer").tileviewer({
                access_token: access_token,
                src: appconf.url.data+$scope.path+"/main_tiles"
            });
        }).catch(function(data) {
            toaster.error('Failed to authorize your access', data.statusText);
        });
    }
}]);

