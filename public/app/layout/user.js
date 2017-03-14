(function () {
    'use strict';

    var controllerId = 'UserController';

    var app = angular.module('app');
    var modalInstance = null;

    app.controller(controllerId,
        ['$rootScope','$scope', '$modal','$window', '$location', 'common', 'config','$route','UserService','ModelService','$http','$log','$timeout', 'DTOptionsBuilder', 'DTColumnDefBuilder', UserController]);

    function UserController($rootScope, $scope, $modal, $window, $location, common, config ,route,UserService,ModelService,$http,$log,$timeout, DTOptionsBuilder, DTColumnDefBuilder) {

        $rootScope.loggedIn = false;

        angular.element('body').removeClass("page-sidebar-closed");
        var vm = this;

        initController();

        function initController() {
            loadCurrentUser();
        }
        function loadCurrentUser() {
            $scope.user = $rootScope.globals.currentUser;
            if ($scope.user.usertype != "admin") {
                $location.path("/main");
            }
        }
        
        $scope.uservisibilities = {};

        $scope.tab = 1;

        $scope.setTab = function(newTab){
            $scope.tab = newTab;
        };

        $scope.isSet = function(tabNum){
            return $scope.tab === tabNum;
        };

        $rootScope.reload_user_list = function(){
            UserService.GetUsers().then(function(response){
                $scope.users = response.data.users;
            });
        }

        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
            $scope.companies.forEach(function(company,index){
                $scope.companies[index]._fields[0].properties.departments = JSON.parse($scope.companies[index]._fields[0].properties.departments);
            })
        });

        UserService.GetUsers().then(function(response){
            $scope.users = response.data.users;

            $scope.users.forEach(function (user, index) {

                if(user._fields[0].properties.hasOwnProperty("restrictGroups"))
                    var user_visibility = JSON.parse(user._fields[0].properties.restrictGroups);
                else
                    var user_visibility = [];

                $scope.uservisibilities[user._fields[0].identity.low] = {}

                for(var i=0; i<user_visibility.length; i++){
                    $scope.uservisibilities[user._fields[0].identity.low][user_visibility[i]] = true;
                }
            })

        });

        $scope.saveUserVisibilities = function (userId, ngId) {

            var userInfo = {};
            userInfo.userId = userId;

            var visibilities = [];
            for(var k in $scope.uservisibilities[userId]) {
                if($scope.uservisibilities[userId][k])
                    visibilities.push(k);
            }
            userInfo.restrictGroups = JSON.stringify(visibilities);

            UserService.SaveUserVisibility(userInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if (msg == "success") {

                    }
                    else {

                    }

                });
        }

        var ngInfo = {};
        ngInfo.companyId = "";
        ngInfo.userId = "";
        UserService.GetNodeGroups(ngInfo).then(function (response) {
            $scope.nodegroups = response.data.responseData.data;
        })

        $scope.open_new_user_modal = function() {
            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_user.html',
                controller : 'PopupCont_Manage_User',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        $scope.open_edit_user_modal = function(user_id){

            $rootScope.edit_user_id = user_id;
            $rootScope.is_user_edit = true;

            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'add_new_user.html',
                controller : 'PopupCont_Manage_User',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }

        $scope.open_delete_user_confirm_modal = function(company_id){
            $rootScope.delete_user_id = company_id;
            $rootScope.is_user_delete = true;

            $rootScope.initFlash = false;
            $scope.opts = {
                backdrop: true,
                backdropClick: true,
                dialogFade: false,
                keyboard: true,
                templateUrl : 'delete_user.html',
                controller : 'PopupCont_Delete_User',
                resolve: {} // empty storage
            };
            modalInstance = $modal.open($scope.opts);
        }
    };

    angular.module('app').controller('PopupCont_Manage_User', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('PopupCont_Delete_User', ['$scope','$modalInstance',function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

    angular.module('app').controller('AddUserCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',addUserProc]);
    function addUserProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService) {
        $scope.add_user_submit = addUserSubmit;

        modalInstance.result.finally(function(){
            $rootScope.edit_user_id = "";
            $rootScope.is_user_edit = false;

            $scope.title_text = "Add";
            $scope.firstName = '';
            $scope.lastName = '';
            $scope.username = '';
            $scope.userEmail = "";
            $scope.password = "";
            $scope.userCompany = "";
            $scope.userGroup = "";
        })

        if($rootScope.is_user_edit){
            $scope.title_text = "Update";
            var user_id = $rootScope.edit_user_id;

            var userInfo = {};
            userInfo.user_id = user_id;
            UserService.GetUser(userInfo).then(function(response){
                var user = response.data.user;

                $scope.firstName = user[0]._fields[0].properties.firstName;
                $scope.lastName = user[0]._fields[0].properties.lastName;
                $scope.username = user[0]._fields[0].properties.username;
                $scope.password = user[0]._fields[0].properties.password;
                $scope.userEmail = user[0]._fields[0].properties.emailaddress;
                $scope.userCompany = user[0]._fields[0].properties.userCompany;
                $scope.userGroup = user[0]._fields[0].properties.userGroup;

            });
        } else {
            $scope.title_text = "Add";
            $scope.firstName = '';
            $scope.lastName = '';
            $scope.username = '';
            $scope.userEmail = "";
            $scope.password = "";
            $scope.userCompany = "";
            $scope.userGroup = "";
        }

        UserService.GetCompanies().then(function(response){
            $scope.companies = response.data.companies;
        });

        function addUserSubmit() {
            $scope.dataLoading = true;
            var userInfo = {};
            userInfo.firstName = $scope.firstName;
            userInfo.lastName = $scope.lastName;
            userInfo.username = $scope.username;
            userInfo.password = $scope.password;
            userInfo.userEmail = $scope.userEmail;
            userInfo.userCompany = $scope.userCompany;
            userInfo.userGroup = $scope.userGroup;

            if ($rootScope.is_user_edit) {
                userInfo.user_id = $rootScope.edit_user_id;

                UserService.UpdateUser(userInfo)
                    .then(function (response) {
                        $rootScope.initFlash = true;
                        var msg = response.data.msg;
                        if (msg == "success") {
                            FlashService.Success('Registration successful', true);
                            $rootScope.is_user_edit = false;
                            $scope.dataLoading = false;
                            modalInstance.close();
                            $rootScope.reload_user_list();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            } else {
                UserService.Create(userInfo)
                    .then(function (response) {
                        $rootScope.initFlash = true;
                        var msg = response.data.msg;
                        if (msg == "success") {
                            FlashService.Success('Registration successful', true);

                            $scope.dataLoading = false;
                            modalInstance.close();
                            $rootScope.reload_user_list();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }
        };

    }

    angular.module('app').controller('DeleteUserCtrl', ['$rootScope','$scope','common', 'datacontext', '$window', '$location', 'FlashService', 'UserService',deleteUserProc]);
    function deleteUserProc($rootScope, $scope, common, datacontext, $window, $location, FlashService, UserService){
        $scope.delete_user_submit = deleteUserSubmit;

        function deleteUserSubmit(){

            var userInfo = {};
            userInfo.user_id = $rootScope.delete_user_id;

            UserService.DeleteUser(userInfo)
                .then(function (response) {
                    $rootScope.initFlash = true;
                    var msg = response.data.msg;
                    if (msg == "success") {
                        FlashService.Success('Delete successful', true);
                        $scope.dataLoading = false;
                        modalInstance.close();
                        $rootScope.reload_user_list();
                    }
                    else {
                        FlashService.Error(response.data.responseData.fields[0].message);
                        $scope.dataLoading = false;
                    }
                });
        }
    }
    
})();