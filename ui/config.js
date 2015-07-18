'use strict';

angular.module('app.config', [])
.constant('appconf', {
    version: '0.0.1',
    title: 'ImageX Sample',
    api: {
        imagex: 'https://soichi7.ppa.iu.edu/api/imagex',
        auth: 'https://soichi7.ppa.iu.edu/api/auth',
    },
    url: {
        login: 'https://soichi7.ppa.iu.edu/auth#/login', //?redirect=<url to redirect back>
        
        //I want to use https but I don't want to reconfigure apache / nginx, etc..
        data: 'https://portal-dev1.odi.iu.edu/ds/imagex', 
    },
    jwt_id: 'jwt'
});

