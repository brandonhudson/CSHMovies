/**
 * Switches view to display results
 * Params: None
 * Returns: None
 **/
function switchView() {
    $("#SmartBanner").css("display", "none");
    $('.resultsContainer').show();
    $('.searchContainer').hide();
}

/**
 * Returns to the normal search pagw
 * Params: None
 * Returns: None
 **/
function returnNormalView() {
    window.location.href = "/";
}

/**
 * Sets a URL parameter on the path
 * Params:
 *  - paramName - string - parameter key
 *  - paramValue - string - parameter value
 * Returns: None
 **/
function setGetParameter(paramName, paramValue) {
    var url = window.location.href;
    if (url.indexOf(paramName + "=") >= 0) {
        var prefix = url.substring(0, url.indexOf(paramName));
        var suffix = url.substring(url.indexOf(paramName));
        suffix = suffix.substring(suffix.indexOf("=") + 1);
        suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
        url = prefix + paramName + "=" + paramValue + suffix;
    }
    else {
        if (url.indexOf("?") < 0)
            url += "?" + paramName + "=" + paramValue;
        else
            url += "&" + paramName + "=" + paramValue;
    }
    window.location.href = url;
}


/**
 * Sets a URL parameter on the path
 * Params:
 *  - sParam - string - parameter key
 * Returns: sPrarameterName[1] - string - parameter
 *          value
 **/
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}


//KEEP WORKING ON THIS!!

var app = angular.module('CSHMovies', []);

app.controller('searchController', function ($scope, $http, $sce) {

    $scope.returnNormalView = function () {
        $scope.userQuery = "";
        returnNormalView();

    };

    $scope.stream = function (url) {
        console.log("STREAM CALLED: " + url); //debug
        $scope.activeVideo = $sce.trustAsResourceUrl(url);


    };

    $scope.searchMovie = function () {

        var query = $scope.userQuery;
        $scope.lastSearch = $scope.userQuery;
        console.log(query); //debug
        setGetParameter("q", query);

    };

    $scope.location = function (movie) {
        if ((window.innerWidth < 768)) {
            newUrl = 'plexapp://';
        } else {
            newUrl = 'https://app.plex.tv/web/app#!/server/' + movie.server_id + '/details/' + encodeURIComponent(movie.server_path);
        }
        document.location.href = newUrl;
    };

    $scope.init = function () {
        if (window.location.search.indexOf('q=') > -1 && getUrlParameter('q') != "" && getUrlParameter('q') != null) {
            $('.zone-loading').removeClass('hidden');
            $("#SmartBanner").css("display", "none");
            $('.resultsContainer').show();
            var query = getUrlParameter('q');
            $scope.lastSearch = query;
            console.log(query); //debug
            $scope.userQuery = query;
            $http.get('resources/api/api.php?query=' + query)
                .success(function (data, status, headers, config) {
                    $('.zone-loading').addClass('hidden');
                    switchView();
                    console.log(data) //debug
                    $scope.data = data;

                })
                .error(function (data, status, headers, config) {
                    console.log(data); //debug
                    //alert("ERROR: "+status); //debug
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        }
        else {
            $('.searchContainer').show();
        }


    };

    $scope.init();

});