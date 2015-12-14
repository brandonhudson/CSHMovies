function switchView(){
    $('.resultsContainer').show();
    $('.searchContainer').hide();
    
}


//KEEP WORKING ON THIS!!

var app = angular.module('CSHMovie', []);

app.controller('searchController', function($window,$scope,$http,$location) {
    $scope.search = function(query){
        console.log(query); //debug
        $http.get('resources/api/api.php?q='+query)
        .success(function(data, status, headers, config) {
            switchView();
            console.log(data) //debug
            $scope.data = data;
            
        })
        .error(function(data, status, headers, config) {   
            alert('ERROR - 500 - Cannot Get Services.');
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        
    }
    
});