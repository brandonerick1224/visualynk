(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$http'];
    function UserService($http) {
        var service = {};

        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetCompanies = GetCompanies;
        service.GetCountries = GetCountries;
        service.AddCompany = AddCompany;
        service.UpdateCompany = UpdateCompany;
        service.DeleteCompany = DeleteCompany;
        service.GetCompany = GetCompany;

        service.GetUsers = GetUsers;
        service.GetUser = GetUser;
        service.UpdateUser = UpdateUser;
        service.UpdateUserPermission = UpdateUserPermission;
        service.DeleteUser = DeleteUser;
        service.UpdateUserGroupAssigns = UpdateUserGroupAssigns;
        service.UpdateNeedApprovalAssigns = UpdateNeedApprovalAssigns;
        service.GetUserGroupAssigns = GetUserGroupAssigns;
        service.GetNeedApprovalAssigns = GetNeedApprovalAssigns;

        service.CreateNodeGroup = CreateNodeGroup;
        service.UpdateNodeGroup = UpdateNodeGroup;
        service.GetNodeGroup = GetNodeGroup;
        service.GetNodeGroups = GetNodeGroups;
        service.DeleteNodeGroup = DeleteNodeGroup;

        service.CreateNodeEntity = CreateNodeEntity;
        service.UpdateNodeEntity = UpdateNodeEntity;
        service.GetNodeEntity = GetNodeEntity;
        service.DeleteNodeEntity = DeleteNodeEntity;
        service.GetNodeEntityRelations = GetNodeEntityRelations;
        service.GetNewRelationEnders = GetNewRelationEnders;
        service.CreateNewNERelation = CreateNewNERelation;
        service.DeleteNERelation = DeleteNERelation;

        service.GetWaitingApprovals = GetWaitingApprovals;
        service.UpdateNGPendingApprovals = UpdateNGPendingApprovals;
        service.CancelNGPendingApprovals = CancelNGPendingApprovals;

        service.SaveUserVisibility = SaveUserVisibility;
        service.Save2DModel = Save2DModel;
        service.Get2DModel = Get2DModel;

        return service;

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError('Error getting all users'));
        }

        function GetById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError('Error getting user by username'));
        }

        function Create(user) {
            return $http.post('/register', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function GetCompanies() {
            return $http.get('/getCompanies').success(function (response) {
                return response.companies;
            }).error(function (response) {

            });
        }

        function GetCompany(company_id) {
            return $http.post('/getCompany', company_id).success(function (response) {
                return response.company;
            }).error(function (response) {

            });
        }

        function GetCountries(){
            return $http.get('/getCountries').success(function (response) {
                return response.data;
            }).error(function (response) {

            });
        }

        function AddCompany(company) {
            return $http.post('/addCompany', company).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function UpdateCompany(company) {
            return $http.post('/updateCompany', company).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function DeleteCompany(company) {
            return $http.post('/DeleteCompany', company).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function GetUsers() {
            return $http.get('/getUsers').success(function (response) {
                return response.users;
            }).error(function (response) {

            });
        }

        function GetUser(user_id) {
            return $http.post('/getUser', user_id).success(function (response) {
                return response.user;
            }).error(function (response) {

            });
        }

        function UpdateUser(user) {
            return $http.post('/updateUser', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function DeleteUser(user) {
            return $http.post('/deleteUser', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function UpdateUserPermission(user) {
            return $http.post('/updateUserPermission', user).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function GetUserGroupAssigns() {
            return $http.get('/getUserGroupAssigns').success(function (response) {
                return response;
            }).error(function (response) {

            });
        }

        function GetNeedApprovalAssigns() {
            return $http.get('/getNeedApprovalAssigns').success(function (response) {
                return response;
            }).error(function (response) {

            });
        }

        function UpdateUserGroupAssigns(assigns) {
            return $http.post('/updateUserGroupAssigns', assigns).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function UpdateNeedApprovalAssigns(assigns) {
            return $http.post('/updateNeedApprovalAssigns', assigns).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
            }).error(function (response) {

            });
        }

        function CreateNodeGroup(ngInfo) {
            return $http.post('/createNodeGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function UpdateNodeGroup(ngInfo) {
            return $http.post('/updateNodeGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetNodeGroups(info){
            return $http.post('/getNodeGroups',info).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetNodeGroup(nodeId){
            return $http.get('/getNodeGroup/'+nodeId).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function DeleteNodeGroup(ngInfo){
            return $http.post('/deleteNodeGroup', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function CreateNodeEntity(neInfo) {
            return $http.post('/createNodeEntity', neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function UpdateNodeEntity(neInfo) {
            return $http.post('/updateNodeEntity', neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetNodeEntity(nodeId){
            return $http.get('/getNodeGroup/'+nodeId).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function DeleteNodeEntity(neInfo){
            return $http.post('/deleteNodeEntity',neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetNodeEntityRelations(nodeId) {
            return $http.get('/getNodeEntityRelations/'+nodeId).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetNewRelationEnders(neInfo) {
            return $http.post('/getNewRelationEnders',neInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function CreateNewNERelation(relInfo) {
            return $http.post('/createNewNERelationship', relInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function DeleteNERelation(relationID){
            return $http.get('/deleteNodeEntityRelations/'+relationID).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function GetWaitingApprovals(reqInfo) {
            return $http.post('/getWaitingApprovals', reqInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function UpdateNGPendingApprovals(ngInfo) {
            return $http.post('/updateNGPendingApprovals', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function CancelNGPendingApprovals(ngInfo) {
            return $http.post('/cancelNGPendingApprovals', ngInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function SaveUserVisibility(userInfo) {
            return $http.post('/saveUserVisibility', userInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function Save2DModel(modelInfo) {
            return $http.post('/saveTDModel', modelInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }

        function Get2DModel(modelInfo) {
            return $http.post('/getTDModels', modelInfo).success(function (response) {
                // If successful we assign the response to the global user model
                // And redirect to the index page
                return response;
            }).error(function (response) {

            });
        }





        function Update(user) {
            return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }

        function Delete(id) {
            return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(error) {
            return function () {
                return { success: false, message: error };
            };
        }
    }

})();
