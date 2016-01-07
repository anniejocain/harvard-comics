var comicsControllers = angular.module('comicsControllers', ['ngAnimate']);

comicsControllers.controller('SearchController', ['$scope', '$http', '$location', 'sessionFilters', function($scope, $http, $location, sessionFilters) {
  
    $scope.googleCovers = function() {
        angular.forEach($scope.comics, function(value, key) {
            value.google_thumbnail_exists = false;
            if(value.id_isbn) {
                $http.jsonp('https://www.googleapis.com/books/v1/volumes?q=isbn:' + value.id_isbn[0] + '&key=AIzaSyCVzNT0GpgPwl9K1rISlMCPV3HhDcTS2fU&callback=JSON_CALLBACK').success(function(google_data) {
                    if(google_data.totalItems > 0){
                        if(google_data.items[0].volumeInfo.imageLinks) {
                            value.google_thumbnail = google_data.items[0].volumeInfo.imageLinks.thumbnail;
                            value.google_thumbnail_exists = true;
                        }
                    }
            });
            }
        });
    };
    
    $scope.availability = function() {
        angular.forEach($scope.comics, function(value, key) {
            value.available = false;
            $http.get('api/availability.php', {
        params: {
            id: value.id_inst
        }
     }).success(function(availability_data) {
                if(availability_data.any_available) {
                    value.available = true;
                }
            });
        });
    };
    
  $scope.recent = function() {
    $location.search('q', null);
    $location.search('f', null);
      $http.get('js/recent.json').success(function(data) {
        $scope.comics = data.docs;
        $scope.keys = Object.keys($scope.comics);
        $scope.hits = data.num_found;
        $scope.label = 'Recently returned';
        //$scope.googleCovers();
        $scope.availability();
        });
    };
  
  $scope.search = function() {
    $location.search('q', $scope.searchTerm);
    $location.search('f', null);
      $http.jsonp('http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=(lcsh_keyword:(%22comic%20books%20strips%22%20OR%20%22graphic%20novels%22)%20OR%20call_num:([NC1300%20TO%20NC1766]%20OR%20[PN6700%20TO%20PN6790]))&search_type=collection&query=hollis_catalog&limit=12&sort=' + sessionFilters.sortOrder + '%20desc' + sessionFilters.criticism + '&filter=language:' + sessionFilters.english + '&filter=keyword:' + $scope.searchTerm + '&callback=JSON_CALLBACK').success(function(data) {
        $scope.comics = data.docs;
        $scope.keys = Object.keys($scope.comics);
        $scope.hits = data.num_found;
        $scope.label = 'Search for "' + $scope.searchTerm + '"';
        //$scope.googleCovers();
        $scope.availability();
        });
    };
    
    $scope.browse = function() {
      $location.search('f', $scope.browseTerm);
      $http.jsonp('http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=(lcsh_keyword:(%22comic%20books%20strips%22%20OR%20%22graphic%20novels%22)%20OR%20call_num:([NC1300%20TO%20NC1766]%20OR%20[PN6700%20TO%20PN6790]))&search_type=collection&query=hollis_catalog&limit=12&sort=' + sessionFilters.sortOrder + '%20desc' + sessionFilters.criticism + '&filter=language:' + sessionFilters.english + '&filter=' + $scope.browseTerm + '&callback=JSON_CALLBACK').success(function(data) {
        $scope.comics = data.docs;
        $scope.keys = Object.keys($scope.comics);
        $scope.hits = data.num_found;
        $scope.label = 'Browsing "' + $scope.browseTerm + '"';
        //$scope.googleCovers();
        $scope.availability();
        });
    };
    
    $scope.searchTerm = $location.search().q;
    $scope.browseTerm = $location.search().f;
    $scope.englishOnly = sessionFilters.english;
    $scope.sortOrder = sessionFilters.sortOrder;
    $scope.criticism = sessionFilters.criticism;
    
    $scope.getResults = function() {
        if($scope.searchTerm){
            $scope.search();
        }
        else if($scope.browseTerm) {
            $scope.browse();
        }
        else {
            $scope.recent();
        }
    };
    
    $scope.getResults();
    
    $scope.changeLanguage = function() {
        sessionFilters.english = $scope.englishOnly;
    }
    
    $scope.changeSort = function() {
        sessionFilters.sortOrder = $scope.sortOrder;
        $scope.getResults();
    }
    
    $scope.changeCriticism = function() {
        sessionFilters.criticism = $scope.criticism;
        $scope.getResults();
    }
    
    $scope.isIllustrtated = function(value) {
        if(value.indexOf('chiefly') != -1 || value.indexOf('ill.') != -1) {
            return true;
        }
        else {
            return false;
        }
    };
    
    $scope.showDetails = function() {
        $scope.selectedItem = $scope.comics[0];
    };
    
}]);

comicsControllers.controller('DetailsController', ['$scope', '$http','$routeParams', function($scope, $http, $routeParams) {
  $http.jsonp('http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=id:' + $routeParams.itemId + '&callback=JSON_CALLBACK').success(function(data) {
        $scope.comicsItem = data.docs[0];
        if(data.docs[0].id_isbn) {
            $http.get('api/added-info.php', {params: {isbn: data.docs[0].id_isbn[0]}
            }).success(function(info_data) {
                $scope.addedInfo = info_data;
            });
        }
        });
}]);

comicsControllers.filter('isbnConvert', function () {
    return function (isbn13) {
        if(isbn13) {
        if(isbn13.length == 10) {
            return isbn13;
        }
        else {
            var start = isbn13.substring(3, 12);
            var sum = 0;
            var mul = 10;
            var i;
            
            for(i = 0; i < 9; i++) {
                sum = sum + (mul * parseInt(start[i]));
                mul -= 1;
            }
            
            var checkDig = 11 - (sum % 11);
            if (checkDig == 10) {
                checkDig = "X";
            } else if (checkDig == 11) {
                checkDig = "0";
            }
            
            return start + checkDig;
        }
        }
    };
});

comicsControllers.filter('labelConvert', function () {
    return function (label) {
        if(label) {
            label = label.replace('_', ' ');
            label = label.replace(':', ' '); 
            label = label.replace('keyword', '');
            label = label.replace('lcsh', 'Genre');
            label = label.replace(/"/gi, '');
        
            return label;
        }
    };
});

