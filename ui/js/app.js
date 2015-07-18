'use strict';

var app = angular.module('app', [
    'app.config',
    'ngSanitize',
    'ngCookies',
    'toaster',
    'angular-jwt'
]);

/*
//show loading bar at the top
app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);
*/

app.factory('jwt', function(jwtHelper, appconf) {
    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt == null || jwtHelper.isTokenExpired(jwt)) {
        //localStorage.setItem('post_auth_redirect', next.originalPath);
        document.location = appconf.url.login+"?redirect="+encodeURIComponent(document.location);
    }
    return jwtHelper.decodeToken(jwt);
});

app.config(['appconf', '$httpProvider', 'jwtInterceptorProvider', 
function(appconf, $httpProvider, jwtInterceptorProvider) {
    //configure httpProvider to send jwt unless skipAuthorization is set in config (not tested yet..)
    jwtInterceptorProvider.tokenGetter = function(jwtHelper, config, $http) {
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
            console.log("token expired.");
            document.location = appconf.url.login+"?redirect="+encodeURIComponent(document.location);
        } else if(ttl < 3600*1000) {
            //jwt expring in less than an hour! refresh!
            //console.dir(config);
            //console.log("jwt expiring in an hour.. refreshing first");
            return $http({
                url: appconf.authapi+'/refresh',
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


