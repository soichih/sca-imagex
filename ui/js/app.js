'use strict';

var app = angular.module('app', [
    'app.config',
    'ngRoute',
    'ngCookies',
    'toaster',
    'angular-loading-bar',
    'angular-jwt',
    'sca-shared',
]);

/*
//show loading bar at the top
app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);
*/
//show loading bar at the top
app.config(['cfpLoadingBarProvider', '$logProvider', function(cfpLoadingBarProvider, $logProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);

app.factory('jwt', function(jwtHelper, appconf) {
    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt == null || jwtHelper.isTokenExpired(jwt)) {
        //localStorage.setItem('post_auth_redirect', next.originalPath);
        document.location = appconf.url.login+"?redirect="+encodeURIComponent(document.location);
    }
    return jwtHelper.decodeToken(jwt);
});

//configure route
app.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider.
    when('/', {
        templateUrl: 't/about.html',
        controller: 'AboutController',
    })
    .otherwise({
        template: '<div id="viewer"></div>',
        controller: 'SDViewerController',
        requiresLogin: true,
    });
    /*
    //assume it's business request
    .otherwise({
        template: '<div id="viewer"></div>',
        controller: 'ViewerController',
        requiresLogin: true,
    });
    */
    //console.dir($routeProvider);
}]).run(['$rootScope', '$location', 'toaster', 'jwtHelper', 'appconf', 'scaMessage',
function($rootScope, $location, toaster, jwtHelper, appconf, scaMessage) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        //console.log("route changed from "+current+" to :"+next);
        //redirect to /login if user hasn't authenticated yet
        if(next.requiresLogin) {
            var jwt = localStorage.getItem(appconf.jwt_id);
            if(jwt == null || jwtHelper.isTokenExpired(jwt)) {
                scaMessage.info("Please login first!");
                sessionStorage.setItem('auth_redirect', window.location.toString());
                window.location = appconf.auth_url;
                event.preventDefault();
            }
        }
    });
}]);

app.config(['appconf', '$httpProvider', 'jwtInterceptorProvider', 
function(appconf, $httpProvider, jwtInterceptorProvider) {
    //configure httpProvider to send jwt unless skipAuthorization is set in config (not tested yet..)
    jwtInterceptorProvider.tokenGetter = function(jwtHelper, config, $http, scaMessage) {
        //don't send jwt for template requests
        if (config.url.substr(config.url.length - 5) == '.html') {
            return null;
        }
        var jwt = localStorage.getItem(appconf.jwt_id);
        if(!jwt) return null; //don't have jwt

        var expdate = jwtHelper.getTokenExpirationDate(jwt);
        var ttl = expdate - Date.now();
        if(ttl < 0) {
            //expired already.. redirect to login form
            scaMessage.info("Your token has expired. Please re-sign!");
            sessionStorage.setItem("auth_redirect", document.location.toString());
            document.location = appconf.auth_url;
        } else if(ttl < 3600*1000) {
            //jwt expring in less than an hour! refresh!
            //console.dir(config);
            //console.log("jwt expiring in an hour.. refreshing first");
            return $http({
                url: appconf.auth_api+'/refresh',
                skipAuthorization: true,  //prevent infinite recursion
                headers: {'Authorization': 'Bearer '+jwt},
                method: 'POST'
            }).then(function(response) {
                var jwt = response.data.jwt;
                //console.log("got renewed jwt:"+jwt);
                localStorage.setItem(appconf.jwt_id, jwt);
                return jwt;
            });
        }
        return jwt;
    }
    $httpProvider.interceptors.push('jwtInterceptor');
}]);

//just a service to load all users from auth service
app.factory('serverconf', ['appconf', '$http', function(appconf, $http) {
    return $http.get(appconf.api+'/config')
    .then(function(res) {
        return res.data;
    });
}]);

/*
app.factory('menu', ['appconf', '$http', 'jwtHelper', '$sce', function(appconf, $http, jwtHelper, $sce) {
    var menu = { };

    return $http.get(appconf.shared_api+'/menu/top').then(function(res) {
        menu.top = res.data;
        //then load user profile (if we have jwt)
        var jwt = localStorage.getItem(appconf.jwt_id);
        if(!jwt)  return menu;
        var user = jwtHelper.decodeToken(jwt);//jwt could be invalid
        return $http.get(appconf.profile_api+'/public/'+user.sub);
    }, function(err) {
        console.log("failed to load menu");
    }).then(function(res) {
        //TODO - this function is called with either valid profile, or just menu if jwt is not provided... only do following if res is profile
        //if(res.status != 200) return $q.reject("Failed to load profile");
        menu._profile = res.data;
        return menu;
    }, function(err) {
        console.log("couldn't load profile");
    });
}]);
*/
app.factory('menu', ['appconf', '$http', 'jwtHelper', '$sce', 'scaMessage', 'scaMenu', '$q',
function(appconf, $http, jwtHelper, $sce, scaMessage, scaMenu, $q) {

    var jwt = localStorage.getItem(appconf.jwt_id);
    var menu = {
        header: {
            //label: appconf.title,
            //icon: $sce.trustAsHtml("<img src=\""+appconf.icon_url+"\">"),
            //url: "#/",
        },
        top: scaMenu,
        user: null, //to-be-loaded
        //_profile: null, //to-be-loaded
    };

    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt) menu.user = jwtHelper.decodeToken(jwt);
    /*
    if(menu.user) {
        $http.get(appconf.profile_api+'/public/'+menu.user.sub).then(function(res) {
            menu._profile = res.data;
            if(res.data) {
                //logged in, but does user has email?
                if(res.data.email) {
                    return menu; //TODO - return return to what?
                } else {
                    //force user to update profile
                    //TODO - do I really need to?
                    scaMessage.info("Please update your profile before using application.");
                    sessionStorage.setItem('profile_settings_redirect', window.location.toString());
                    document.location = appconf.profile_url;
                }
            } else {
                //not logged in.
                return menu; //TODO return to what?
            }
        });
    }
    */
    return menu;
}]);



