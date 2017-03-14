(function () {
    'use strict';
    
    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        //'ngDragDrop',
        'ngGrid','ngRoute', 'ngCookies', 'datatables'
        //'angularModalService'
        ,'thatisuday.dropzone'
    ]);
    
    // Handle routing errors and success events
    app.run(['$rootScope', '$location', '$window', '$cookieStore', '$http', '$route','AuthenticationService', function ($rootScope, $location, $window, $cookieStore, $http , $route,AuthenticationService) {
            // Include $route to kick start the router.
            // keep user logged in after page refresh
            $rootScope.globals = $cookieStore.get('globals') || {};
            $rootScope.globals.usergroups = ["PortfolioOwner", "ProjectAdmin", "CompanyAdmin", "ProjectTeamAdmin", "CompanyTeamAdmin", "User"];
            if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
            }

            $rootScope.$on('$locationChangeStart', function (event, next, current) {

                // redirect to login page if not logged in and trying to access a restricted page
                var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
                var logOutState = $.inArray($location.path(), ['/login']) === -1;
                if(!logOutState){
                    //logout
                    (function initController() {
                        // reset login status
                        AuthenticationService.ClearCredentials();
                    })();
                }

                //check the user exist
                var loggedIn = $rootScope.globals.currentUser;

                if (!loggedIn) {
                    if(restrictedPage)
                        $location.path('/');
                }
                else{
                    var loggedIn_user = loggedIn.username;
                    var loggedIn_pass = loggedIn.password;

                    AuthenticationService.Login(loggedIn_user, loggedIn_pass, function (response) {
                        if (response.responseData.msg == "success") {
                            //AuthenticationService.SetCredentials(response.responseData.username, response.responseData.password, response.responseData.userCompany, response.responseData.userType, response.responseData.userGroup);
                            /*if(response.responseData.userType == "user")
                                $location.path('/main');
                            else if(response.responseData.userType == "admin") {

                                if($location.path() == '/')
                                    $location.path('/admin/company');

                                if($location.path() == '/main')
                                    $location.path('/main');

                                if($location.path() == '/admin/company')
                                    $location.path('/admin/company');

                                if($location.path() == '/admin/users')
                                    $location.path('/admin/users');

                                if($location.path() == '/admin/permissions')
                                    $location.path('/admin/permissions');
                            }*/
                            var location_url = $location.path();
                            $location.path(location_url);
                        } else {
                            AuthenticationService.ClearCredentials();
                            $location.path('/');
                        }
                    });
                }
            });
        }]);
})();

