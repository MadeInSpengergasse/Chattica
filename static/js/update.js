var app = angular.module("praesentationsApp", []);

app.controller("MainController", function ($scope, $http) {
    $http.get("/current_values").success(function (data) {
        $scope.middletext = data.middletext.text;
        $scope.middletext_fontsize = data.middletext.fontsize;
        //$scope.background = data.background;
        console.log(data.background);
    });

    $scope.submit = function (text, fontsize) {
        console.log(fontsize);
        if (text == undefined) {
            alert("Textarea is empty! Aborted.");
            return;
        }
        $http.post("/update_middletext", {"type": "middletext", "content": {"text": text, "fontsize": fontsize}})
    };

    $scope.submit_bg = function (base64) {
        console.log(base64);
        $http.post("/update_bg", {"background": base64})
    }
});

app.directive('appFilereader', function ($q) {
    /*
     made by elmerbulthuis@gmail.com WTFPL licensed
     */
    var slice = Array.prototype.slice;
    console.log("filereader");
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return;

            ngModel.$render = function () {
            };

            element.bind('change', function (e) {
                var element = e.target;
                if (!element.value) return;

                element.disabled = true;
                $q.all(slice.call(element.files, 0).map(readFile))
                    .then(function (values) {
                        if (element.multiple) ngModel.$setViewValue(values);
                        else ngModel.$setViewValue(values.length ? values[0] : null);
                        element.value = null;
                        element.disabled = false;
                    });

                function readFile(file) {
                    var deferred = $q.defer();

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        deferred.resolve(e.target.result);
                    };
                    reader.onerror = function (e) {
                        deferred.reject(e);
                    };
                    reader.readAsDataURL(file);

                    return deferred.promise;
                }

            }); //change

        } //link

    }; //return

}) //appFilereader
;