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

app.controller('M51Controller', ['$scope', 'appconf', 'toaster', '$http', '$cookies', '$location', 'jwt', 'scaMessage',
function($scope, appconf, toaster, $http, $cookies, $location, jwt, scaMessage) {
    scaMessage.show(toaster);
    $scope.title = "M51 collection";
    $scope.path = "/exobj/m51";

    
    //authorize and initialize seadragon
    $http({
        url: appconf.api+'/authorize',
        method: 'POST',
        data: {path: $scope.path}
    }).then(function(res) {
        var jwt = res.data.access_token;


        /*
        var images = {};
        function load_info(name) {
            //load info.json
            return $http.get(appconf.data_urls+$scope.path+"/"+name+"/info.json", {
                headers: {"Authorization":"Bearer "+jwt}
            }).then(function(res) {
                var info = res.data;
                var max_dim = Math.max(info.height, info.width);
                info.max_level = Math.ceil(Math.log2(max_dim/info.tilesize));
                if(!info.filetype) info.filetype = "png";
                images[name] = info;
                console.dir(info);
                return info;
            });
        }
        */


        /*
        load_info("20130512T003050.3_m51_g_odi_g.4556.fits.fz.png")
        .then(function() {
            return load_info("20130512T003050.4_m51_g_odi_g.4556.fits.fz.png");
        })
        .then(function() {
            return load_info("20130512T003050.5_m51_g_odi_g.4556.fits.fz.png");
        })
        .then(function() {
            return load_info("20130512T003050.6_m51_g_odi_g.4556.fits.fz.png");
        })
        .then(function() {
            console.dir(images);
        */

        var viewer = OpenSeadragon({
            id: "viewer",

            //debugMode: true,

            showNavigator: true,
            showRotationControl: true,

            //I can rotate the canvas!
            //degrees: 5,

            //make it a bit more snappy (default 1.2 sec)
            animationTime: 0.2,

            zoomPerScroll: 1.5, //increasing from default 1.2

            //TODO - this causes pixel aliasing... I need to disable like jquery-tileviewer
            maxZoomPixelRatio: 10,

            //prefix for openseadragon icons
            prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",

            //needed by plugins to access getImageData()
            crossOriginPolicy: 'Anonymous',

            sequenceMode: true,
            showReferenceStrip: true,
            /*
            collectionMode:       true,
            collectionRows:       1, 
            collectionTileSize:   1024,
            collectionTileMargin: 256,
            */
            tileSources: [
                appconf.data_urls+$scope.path+"/dzi/20130512T003050.3_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/20130512T003050.4_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/20130512T003050.5_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/20130512T003050.6_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,

                appconf.data_urls+$scope.path+"/dzi/m51_g.odi_g.4973.MEDIAN.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51_g.odi_g.4973.MEDIAN.weight.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51_g.odi_g.5043.MEDIAN.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51_g.odi_g.5044.MEDIAN.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51_g.odi_g.5073.MEDIAN.fits.fz.png.dzi?at="+jwt,

                appconf.data_urls+$scope.path+"/dzi/m51.odi_g.5769.WEIGHTED.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51.odi_g.5769.WEIGHTED.weight.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51.odi_r.5769.WEIGHTED.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51.odi_r.5769.WEIGHTED.weight.fits.fz.png.dzi?at="+jwt,

                appconf.data_urls+$scope.path+"/dzi/m51_uls.odi_g.4253.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51_uls.odi_g.4253.weight.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51_uls.odi_r.4253.fits.fz.png.dzi?at="+jwt,
                appconf.data_urls+$scope.path+"/dzi/m51_uls.odi_r.4253.weight.fits.fz.png.dzi?at="+jwt,
            ],
        });

        viewer.addHandler('page', function(event) {
            var page = event.page;
            console.log(page);
        });

        /*
        viewer.addTiledImage({
            tileSource: appconf.data_urls+$scope.path+"/dzi/20130512T003050.3_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,
        }); 
        viewer.addTiledImage({
            tileSource: appconf.data_urls+$scope.path+"/dzi/20130512T003050.4_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,
        }); 
        viewer.addTiledImage({
            tileSource: appconf.data_urls+$scope.path+"/dzi/20130512T003050.5_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,
        }); 
        viewer.addTiledImage({
            tileSource: appconf.data_urls+$scope.path+"/dzi/20130512T003050.6_m51_g_odi_g.4556.fits.fz.png.dzi?at="+jwt,
        }); 
        viewer.world.arrange();
        */

        /*
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

                //TODO - this causes pixel aliasing... I need to disable like jquery-tileviewer
                maxZoomPixelRatio: 10,

                //prefix for openseadragon icons
                prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",

                //needed by plugins to access getImageData()
                crossOriginPolicy: 'Anonymous',

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
                        return appconf.data_urls+$scope.path+"/main_tiles/level"+rlevel+"/"+tileid+"."+info.filetype+"?at="+jwt;
                    }
                }
            });
        }, function(err) {
            //failed to load info.json
            toaster.error(err);
        });
        */
    }, function(err) {
        toaster.error('Failed to authorize your access', data.statusText);
    });
}]);

app.controller('SDViewerController', ['$scope', 'appconf', 'toaster', '$http', '$cookies', '$location', 'jwt', 'scaMessage',
function($scope, appconf, toaster, $http, $cookies, $location, jwt, scaMessage) {
    scaMessage.show(toaster);
    $scope.title = appconf.title;
    $scope.path = $location.path(); //like .."/exobj/48599";

    $scope.z_scale = "linear";

    $scope.level_min = 10;
    $scope.level_max = 100;

    function z_decode(context, cb) {
        var imgdata = context.getImageData(0,0,context.canvas.width, context.canvas.height);
        var pixels = imgdata.data; 

        //var value = 0;

        /*
        $scope.decoded_max = 0;
        $scope.decoded_min = 0;
        $scope.decoded.length = pixels.length/4;
        */
        
        ///////////////////////////////////////////////////////////////////////////////////////////
        // compute some constants for decoding
        var range = $scope.level_max - $scope.level_min;
        var min = $scope.level_min;
        var c1 = 255 / range;
        var c2 = min * 255 / range;
        switch($scope.z_scale){
        case "log":
            min = Math.max($scope.level_min,1);
            min = Math.log(min)/2.30258509299;
            range = Math.log($scope.level_max)/2.30258509299 - min;
            c1 = 255 / (2.30258509299 * range);
            c2 = min * 255 / range;
            break;
        case "sqrt":
            min = Math.max($scope.level_min,0);
            min = Math.sqrt(min);
            range = Math.sqrt($scope.level_max) - min; 
            c1 = 255 / range;
            c2 = min * 255 / range;
            break;
        case "squared":
            min = Math.pow(min,2);
            range = Math.pow($scope.level_max,2) - min;
            c1 = 255 / range;
            c2 = min * 255 / range;
            break;
        case "asinh":
            c1 = 1 / range;
            c2 = min;
        case "linear":
        default:
            console.error("unknown z_scale");
        }

        ///////////////////////////////////////////////////////////////////////////////////////////
        //invert colormap
        /* TODO.
        var colormap = this.colormap.slice();
        if(this.colormap_invert) {
            colormap.reverse();
        }
        */
        
        ///////////////////////////////////////////////////////////////////////////////////////////
        // compute some constants for decoding
        var tmp = 0;
        for(var i = 0;i < pixels.length;i += 4) {
            tmp = (pixels[i]<<8) + pixels[i+1];// + data[i+2]/256;
                
            
        }

        /*
        for(var i = 0;i < pixels.length;i += 4) {
            var r = pixels[i]; 
            var g = pixels[i+1];
            var b = pixels[i+2];
            var v = (r + g + b) / 3;
            pixels[i] = 255;
        }
        */
        context.putImageData(imgdata, 0, 0);
        cb();
    }
    
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

                //TODO - this causes pixel aliasing... I need to disable like jquery-tileviewer
                maxZoomPixelRatio: 10,

                //prefix for openseadragon icons
                prefixUrl: "bower_components/openseadragon/built-openseadragon/openseadragon/images/",

                //needed by plugins to access getImageData()
                crossOriginPolicy: 'Anonymous',

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
            /*
            viewer.setFilterOptions({
                filters: {
                    //processors: OpenSeadragon.Filters.THRESHOLDING(10)
                    processors: z_decode,
                },
            });
            */
        }, function(err) {
            //failed to load info.json
            toaster.error(err);
        });
        

    }, function(err) {
        toaster.error('Failed to authorize your access', data.statusText);
    });
}]);

