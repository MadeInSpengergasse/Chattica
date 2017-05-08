var app = angular.module("chatticaApp", ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: "/snippets/home.html"
    }).when('/:templatePath', {
        template: '<ng-include src="templatePath" />',
        controller: 'CatchAllCtrl'
    });
});

app.controller("CatchAllCtrl", function ($scope, $routeParams) {
    $scope.templatePath = "snippets/" + $routeParams.templatePath + ".html";
});

app.controller("MainController", function ($scope, $http, $location) {
    $scope.login = function (username, password) {
        $http.post("/login", {username: username, password: password}).then(function (response) {
            console.log(response.data);
            if (response.data.status === "success") {
                $location.path('/chat')
            } else {
                alert("There was a problem logging in: " + response.data.error_message);
            }
        });
    }
});

app.controller("ChatController", function ($scope, $http, $location) {
    console.log("CHATCONTROLLER");
    $scope.chatmessages_div = angular.element(document.querySelector('#chatmessages'));

    var source = new EventSource('/stream');
    source.addEventListener('message', function (event) {
        var data = JSON.parse(event.data);
        console.log("Got new message! " + JSON.stringify(data));

        $scope.chatmessages_div.append('<div class="message">' + data.newmessage + '</div>');
    }, false);

    $scope.sendMessage = function (message) {
        console.log("send message with text " + message);
        $http.post("/send_message", {"message": message}).then(function (response) {
            console.log(response.data);
            if (response.data.status === "error") {
                alert("There was an error sending your message.")
            }
            console.log("sent message");
        });
    };

    $scope.logout = function () {
        console.log("logging out.");
        $http.post('/logout').then(function (response) {
            console.log("was logged out.");
            $location.path('/')
        });
    }
});
