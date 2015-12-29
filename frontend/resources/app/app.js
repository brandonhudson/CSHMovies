function switchView(){
    $('.resultsContainer').show();
    $('.searchContainer').hide();
    
}
function returnNormalView(){
    $('.resultsContainer').hide();
    $('.searchContainer').show();
    
}


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
    
    $scope.location = function(){
        console.log("test of location function"); //debug
        if ((window.innerWidth < 768))  {
            newUrl='plexapp://';
            
        }
        else{
            newUrl='http://app.plex.tv/web/app/';
        }
        document.location.href = newUrl;
        
    }
    
});