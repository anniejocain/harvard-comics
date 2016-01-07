var myApp = angular.module('myApp', [
  'ngRoute',
  'comicsControllers'
]);

myApp.factory('sessionFilters', function() {
  return {
      english : '',
      sortOrder: 'pub_date',
      criticism: '&filter=-lcsh_keyword:criticism'
  };
});

myApp.config(function($locationProvider, $routeProvider, $httpProvider) {
  $routeProvider.
  when('/search', {
    templateUrl: 'partials/search.html',
    controller: 'SearchController'
  }).
  when('/details/:itemId', {
    templateUrl: 'partials/details.html',
    controller: 'DetailsController'
  }).
  otherwise({
    redirectTo: '/search'
  });
  
  // use the HTML5 History API
    //$locationProvider.html5Mode(true);
    
 //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
});