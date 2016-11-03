var checkLoginState = function () {
    console.log("checkLoginStatus");
    FB.getLoginStatus(function (response) {
        window.checkFB(response);
    });
}

angular.
    module('quizApp').
    component('navList', {
        templateUrl: 'nav-list/nav-list.template.html',

        controller: function NavListController($scope, $location, $route, Facebook, quizManager) {

            $scope.$watch(
                function () { return $scope.isLoggedIn },
                function (newVal, oldVal) { $scope.isLoggedIn = newVal }
            );
            var userIsConnected = false;

            quizManager.checkStatus = function () {
                Facebook.getLoginStatus(function (response) {
                    if (response.status == 'connected') {
                        userIsConnected = true;
                    }

                    console.log("userIsConnected?:" + userIsConnected);
                    $scope.statusChangeCallback(response);
                });
            };
            quizManager.checkStatus();

            $scope.modes = [
                { "path": "quizzes", "name": "Quiz List" },
                { "path": "cloze-quizzes", "name": "Cloze Quiz List" },
                { "path": "choice-quizzes", "name": "Choice Quiz List" },
                { "path": "not-choice-quizzes", "name": "Not Choice Quiz List" },
                { "path": "free-quizzes", "name": "Free Quiz List" }
            ];

            /**
             * IntentLogin
             */
            $scope.IntentLogin = function () {
                console.log("intentLogin:" + userIsConnected);
                if (!userIsConnected) {
                    $scope.login();
                }
            };
            /**
             * Watch for Facebook to be ready.
             * There's also the event that could be used
             */
            $scope.$watch(
              function () {
                  return Facebook.isReady();
              },
              function (newVal, oldVal) {
                  if (newVal) {
                      $scope.facebookReady = newVal;
                  }
              }
            );
            $scope.logout = function () {
                Facebook.logout(function () {
                    $scope.$apply(function () {
                        $scope.isLoggedIn = false;
                        $route.reload();
                    });
                });
            };

            var sandbox = {
                "kiiAppId": "6db83d12",
                "kiiAppKey": "df55dc77ffa451cb686cfda8f9e0fece",
                "facebookAppId": '816805231746029'
            };
            var production = {
                "kiiAppId": "d2e84a86",
                "kiiAppKey": "2c41dd084726f3a409c9963646fddc22",
                "facebookAppId": '576444712448750',
            }
            var keys = (document.location.hostname == "localhost") ? sandbox : production;

            var kiiInitialize = function () {
                console.log("Kii initialize");
                Kii.initializeWithSite(keys.kiiAppId, keys.kiiAppKey, KiiSite.JP);
            };

            function loggedIn(fbAccessToken) {
                console.log('Welcome!  Fetching your information.... ');
                $scope.$apply(function () {
                    console.log("logged in");
                    $scope.isLoggedIn = true;
                });
                FB.api('/me', function (response) {
                    console.log('Successful login for: ' + response.name);
                });
                console.log("facebook token:" + fbAccessToken);

                KiiSocialConnect.setupNetwork(KiiSocialNetworkName.FACEBOOK, keys.facebookAppId, null, { appId: "123" });

                var options = {
                    access_token: fbAccessToken
                };

                console.log("try to log in with KiiSocialConnect");
                KiiSocialConnect.logIn(KiiSocialNetworkName.FACEBOOK, options, quizManager.loginCallbacks);
            }
            // This is called with the results from from FB.getLoginStatus().
            $scope.statusChangeCallback = function (response) {
                console.log('statusChangeCallback');
                console.log(response);
                if (response.status === 'connected') {
                    console.log("kii initializing");
                    kiiInitialize();
                    loggedIn(response.authResponse.accessToken);
                } else if (response.status === 'not_authorized') {
                    console.log('Please log into this app.');
                } else {
                    console.log('Please log into this app.');
                }
            }

            /**
             * Login
             */
            $scope.login = function () {
                console.log("login");
                Facebook.login(function (response) {
                    if (response.status == 'connected') {
                        $scope.isLoggedIn = true;
                    }
                    $scope.statusChangeCallback(response);
                });
            };
        }
});
