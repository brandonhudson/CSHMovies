function switchView(){
    $('.resultsContainer').show();
    $('.searchContainer').hide();
    
}
function returnNormalView(){
    
    window.location.href = "/";
    
}


function setGetParameter(paramName, paramValue)
{
    var url = window.location.href;
    if (url.indexOf(paramName + "=") >= 0)
    {
        var prefix = url.substring(0, url.indexOf(paramName));
        var suffix = url.substring(url.indexOf(paramName));
        suffix = suffix.substring(suffix.indexOf("=") + 1);
        suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
        url = prefix + paramName + "=" + paramValue + suffix;
    }
    else
    {
    if (url.indexOf("?") < 0)
        url += "?" + paramName + "=" + paramValue;
    else
        url += "&" + paramName + "=" + paramValue;
    }
    window.location.href = url;
}

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
};


//KEEP WORKING ON THIS!!

var app = angular.module('CSHMovies', []);

app.controller('searchController', function($scope,$http,$sce) {
    
    $scope.returnNormalView = function(){
        $scope.userQuery = "";
        returnNormalView();
        
    }
    $scope.stream = function(url){
        console.log("STREAM CALLED: "+url); //debug
        $scope.activeVideo = $sce.trustAsResourceUrl(url);
        
        
    }
    $scope.searchMovie = function(){
        
        var query = $scope.userQuery;
        $scope.lastSearch = $scope.userQuery;
        console.log(query); //debug
        setGetParameter("q",query);
        
    }
    
    $scope.location = function(){
        //console.log("test of location function"); //debug
        if ((window.innerWidth < 768))  {
            newUrl='plexapp://';
            
        }
        else{
            newUrl='http://app.plex.tv/web/app/';
        }
        document.location.href = newUrl;
        
    }
    $scope.init = function () {
        if(window.location.search.indexOf('q=') > -1 && getUrlParameter('q') != "" && getUrlParameter('q') != null){
            $('.resultsContainer').show();
            var query = getUrlParameter('q');
            $scope.lastSearch = query;
            console.log(query); //debug
            $scope.userQuery = query;
            $http.get('resources/api/api.php?query='+query)
        .success(function(data, status, headers, config) {   
            switchView();
            console.log(data) //debug
            $scope.data = data;
            
        })
        .error(function(data, status, headers, config) {             console.log(data); //debug
            //alert("ERROR: "+status); //debug
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        }
        else{
            $('.searchContainer').show();
        }
        
        
    };
    $scope.init();
    
});