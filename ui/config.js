'use strict';

angular.module('app.config', [])
.constant('appconf', {
    title: 'ImageX Sample',
    api: '../api/imagex',

    data_urls: [
        '//portal-dev1.odi.iu.edu/ds/imagex', 
    ],

    //profile_api: '../api/profile',
    //profile_url: '../profile',

    //shared servive api and ui urls (for menus and stuff)
    shared_api: '../api/shared',
    shared_url: '../shared',

    auth_api: '../api/auth',
    auth_url: '../auth',

    jwt_id: 'jwt'
});

