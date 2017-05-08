var app = angular.module("chatticaApp", []);

app.controller("MainController", function($scope, $http) {

    $http.get("/current_values").success(function(data)  {

    });

    var source = new EventSource('/stream');
    source.addEventListener('message', function(event) {
        var data = JSON.parse(event.data);
        console.log(data);
    }, false);

});
