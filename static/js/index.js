var app = angular.module("praesentationsApp", []);

app.controller("MainController", function($scope, $http) {
    //Middletext-object init
    $scope.middletext = {"text": "", "size": ""};
    $scope.scrolltext = {"text": "", "size": ""};

    $http.get("/current_values").success(function(data)  {
        $scope.middletext.text = data.middletext.text;
        $scope.middletext.size = data.middletext.fontsize;
        $scope.background = data.background;
        $scope.scrolltext = data.scrolltext.text;
        $scope.scrolltextsize = data.scrolltext.fontsize;
        setTimeout(function() {
            $(".marquee").marquee({duration: "10000", allowCss3Support: true});
        }, 100);
    });

    var source = new EventSource('/stream');
    source.addEventListener('message', function(event) {
        var data = JSON.parse(event.data);

        if(data.type == "middletext") {
            console.log(data.content);
            $scope.middletext.text = data.content.text;
            $scope.middletext.size = data.content.fontsize;
            $scope.$apply();
        } else if(data.type == "scrolltext") {
            $scope.scrolltext.text = data.content.text;
            $scope.$apply();
        } else if(data.type == "background") {
            $scope.background = data.background;
            $scope.$apply();
        }
    }, false);
    // $scope.background = "images/sample.jpg";
    // $scope.middletext = {"text": "random text", "size": "4em"};
    $scope.scrolltext = {"text": "This is a very long and unnediger text which is just here to demonstrate the scrolling feature", "size": "3em"};
});
