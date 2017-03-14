(function () {
    'use strict';

    var controllerId = 'PanelController';
    var xPos = 0;
    var middle_paneright = 0;
    var middle_paneleft = 0;
    var delta_middle = 0;
    var delta_offset_middle = 54.375;
    var last_paneright = 0;
    var last_paneleft = 0;
    var delta_last = 0;
    var delta_offset_last = 19.75;

    var b, c, d, uri, compName,isim, compGUID, clean_guid, comp_drumbeat,
        clean_compGUID,GUID,bGUID,clicked, about_to_select, about_to_click,
        clicked_for_drumbeat;
    var ck_filter = false;

    Dropzone.autoDiscover = false;

    var app = angular.module('app');

    app.controller(controllerId,
        ['$rootScope','$scope','$window', 'common', 'config','$route','UserService','ModelService','FlashService','$http','$log','$timeout', PanelController]);

    function PanelController($rootScope, $scope,$window, common, config ,route,UserService,ModelService,FlashService,$http,$log,$timeout) {
        $rootScope.loggedIn = false;
        var vm = this;

        $scope.is_ng_mng = false;
        $scope.newNGLabel = "";
        $scope.newNGIconPath = "";
        $scope.is_ne_create = false;
        $scope.is_ne_update = false;
        $scope.is_ne_relation = false;
        $scope.ng_properties = [];
        $scope.property = "";
        $scope.ne_properties_val = [];
        $scope.ne_properties = [];

        initController();
        panelSaveResize();

        function initController() {
            loadCurrentUser();
        }
        function loadCurrentUser() {
            $scope.user = $rootScope.globals.currentUser;

            if($scope.user.usercompany === "undefined")
                $scope.user.usercompany = "";
        }

        $scope.dzOptions = {
            url : '/ngIconUpload',
            method: 'post',
            paramName : 'filename',
            maxFilesize : '10',
            acceptedFiles : 'image/jpeg, images/jpg, image/png',
            addRemoveLinks : true,
            dictDefaultMessage: 'Drop files here to upload',
            maxFiles : 1
        };

        $scope.dzCallbacks = {
            'addedfile' : function(file){
                if(file.isMock){
                    $scope.myDz.createThumbnailFromUrl(file, file.serverImgUrl, null, true);
                }
                $scope.newFile = file;
            },
            'success' : function(file, xhr){
                $scope.newNGIconPath = xhr.filename;
            }
        };

        $scope.dzMethods = {};
        /*$scope.craetedropzone = $scope.dzMethods.getDropzone();
        console.log($scope.craetedropzone);*/

        UserService.GetNeedApprovalAssigns()
            .then(function (response) {

                var msg = response.data.msg;
                if (msg == "success" && response.data.responseData.length > 0) {
                    $scope.needapprovalassigns = JSON.parse(response.data.responseData[0]._fields[0].properties.assigns);
                }
                else {
                    $scope.needapprovalassigns = {};
                }
            });

        //call side bar
        var graph_height =  $(window).height()*0.75 + "px";
        $('#container_graph').css('height', graph_height);
        $scope.hoverInGraph = function(){
            $("#plandan_sola").hover(function() {
                var t, e = localStorage.getItem("normal_baglanti");
                var sola_name = {};
                sola_name.name = e;
                ModelService.get_plandan(sola_name)
                    .then(function (e){
                        var msg = e.data.responseData.msg;
                        if(msg != "empty"){
                            isim = e.data.responseData.msg.records[0]._fields[0].properties.name;
                            t = ("" + e.data.responseData.msg.records[0]._fields[1][0]).replace(/[\][]/g, "");
                            $("#plandan_sola").attr("onclick", "selectInstance('" + t + "',{name:'" + isim + "'})")
                        }

                    });
            });
        }
        $scope.filter = function(){
            //search key
            var valueSystem = d3.select("#constraint")[0][0].value;

            companyId = $scope.user.usercompany;
            
            //initialize
            var t = localStorage.getItem("graphGUID");
            inputValueGuid = t;
            d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
            if(valueSystem != ""){
                ck_filter = false;
                /*ModelService.person_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.email,valueSystem);
                            })
                        }

                    });
                ModelService.system_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'system_filter');
                            })
                        }

                    });
                ModelService.attribute_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'attribute_filter');
                            });
                        }

                    });
                ModelService.company_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'company_filter');
                            });
                        }
                    });
                ModelService.facility_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'facility_filter');
                            });
                        }
                    });
                ModelService.floor_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'floor_filter');
                            });
                        }
                    });
                ModelService.zone_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'zone_filter');
                            })
                        }
                    });
                ModelService.space_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'space_filter');
                            });
                        }
                    });
                ModelService.asset_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'asset_filter');
                            });
                        }
                    });
                ModelService.component_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'component_filter');
                            });
                        }
                    });
                ModelService.assembly_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'assembly_filter');
                            });
                        }
                    });
                ModelService.connection_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'connection_filter');
                            });
                        }
                    });
                ModelService.spare_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'spare_filter');
                            });
                        }
                    });
                ModelService.resource_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'resource_filter');
                            });
                        }
                    });
                ModelService.job_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'job_filter');
                            });
                        }
                    });
                ModelService.sevicereq_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.message,valueSystem,'sevicereq_filter');
                            });
                        }
                    });
                ModelService.doc_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'doc_filter');
                            });
                        }
                    });*/

                /*ModelService.ng_filter()
                    .then(function (e){
                        dd = e.data.responseData.msg;
                        if(dd != "empty"){
                            dd.records.forEach(function(e) {
                                config_func(e._fields[0].properties.name,valueSystem,'doc_filter');
                            });
                        }
                    });*/
            }
            else{
                inputValueSystem = "";
                d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                visualynk.taxonomy.createTaxonomyPanel();
            }/**/
            if(!ck_filter){
                inputValueSystem = valueSystem;
                d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                visualynk.taxonomy.createTaxonomyPanel();
                visualynk.graph.mainLabel = 'Visualynk';
            }
            visualynk.tools.reset();
        }
        $scope.hoverIn = function(){
            $("#panel-3-resize .portlet-title").attr("style","height:auto;")
        }
        $scope.hoverOut = function(){
            $("#panel-3-resize .portlet-title").attr("style","height:47px; overflow:hidden;")
            //$(".vslynk-container-query").attr("style","height:26px;");
        }
        /* enter key event */
        $("#constraint").enterKey(function () {
            $scope.filter();
        })
        // expand the Query Area
        $scope.exdQueryArea = function(){
            var content_height = parseInt($(window).height()) - 55 - 20;
            var panel_height = content_height - 40;
            var query_height = panel_height - 70;


            if($(".query-toggle").hasClass("arrow-down")){
                $("#panel-3-resize .portlet-title").removeClass("query-hidden");
                $(".query-toggle").removeClass("arrow-down");
                $(".query-toggle").addClass("arrow-up");
                $("#panel-3-resize .panel-item").css("overflow","auto");
                $(".vslynk-container-results").attr("style","overflow:initial;");
                $(".node-mng").attr("style","overflow:initial;");

            }
            else{
                $("#panel-3-resize .portlet-title").addClass("query-hidden");
                $(".query-toggle").removeClass("arrow-up");
                $(".query-toggle").addClass("arrow-down");
                $("#panel-3-resize .panel-item").css("overflow","initial");
                $(".vslynk-container-results").attr("style","overflow:auto;");
                $(".node-mng").css("height" ,query_height + "px" );
                $(".vslynk-container-results").attr("style","overflow:auto;");
                $(".node-mng").css("height" ,query_height + "px" );
            }
        }

        // node group management
        $scope.addNGProperty = function () {
            if($scope.property != undefined && $scope.property != "") {
                $scope.ng_properties.push($scope.property);
                $scope.property = "";
            }
        }
        $scope.deleteNGProperty = function (ind) {
            $scope.ng_properties.splice(ind, 1);
        };

        $scope.openNGCreate = function(){
            $scope.newNGLabel = "";
            $scope.newNGIconPath = "";
            $scope.ng_properties= [];
            $scope.is_ng_create = true;
            $scope.is_ng_update = false;
            $scope.is_ne_update = false;
            $scope.is_ne_create = false;
            $scope.dzMethods.removeAllFiles();
        }

        $scope.createNG = function() {
            if($scope.newNGLabel == ""){
                alert("Please input the Node Label");
            } else if($scope.newNGIconPath == ""){
                alert("Please input the Node Icon");
            }
            else{
                var ngInfo = {};
                ngInfo.label = $scope.newNGLabel;
                ngInfo.link = $scope.newNGIconPath;
                ngInfo.companyId = $scope.user.usercompany;
                ngInfo.properties = JSON.stringify($scope.ng_properties);
                ngInfo.creatorGroup = $scope.user.usergroup;
                ngInfo.parentGroup = "";

                for (var key in $scope.needapprovalassigns){
                    if($scope.needapprovalassigns[key].hasOwnProperty($scope.user.usergroup) && $scope.needapprovalassigns[key][$scope.user.usergroup].p_ng_c){
                        ngInfo.parentGroup = key;
                    }
                }

                UserService.CreateNodeGroup(ngInfo)
                    .then(function (response) {
                        var msg = response.data.msg;
                        if (msg == "success") {
                            $scope.is_ng_create = false;
                            $scope.newNGLabel = "";
                            $scope.newNGIconPath = "";
                            $scope.ng_properties = [];
                            d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                            setNodeProviders();
                            visualynk.taxonomy.createTaxonomyPanel();
                            visualynk.tools.reset();
                            visualynk.update();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }
        }

        $scope.cancelCreateNG = function () {
            $scope.is_ng_create = false;
            $scope.is_ng_update = false;
        }

        $scope.openNGUpdate = function (e, nodeId, label) {
            $scope.is_ng_update = true;
            $scope.is_ng_create = false;
            $scope.is_ne_update = false;
            $scope.is_ne_create = false;
            $scope.mockFiles = [];
            $scope.dzMethods.removeAllFiles();
            $scope.nodeId = nodeId;
            $scope.orgNGLabel = label;

            UserService.GetNodeGroup(nodeId)
                .then(function (response) {
                    var msg = response.data.responseData.msg;
                    if (msg == "success") {
                        $scope.newNGLabel = response.data.responseData.data[0]._fields[0].properties.name;
                        $scope.newNGIconPath = response.data.responseData.data[0]._fields[0].properties.icon;
                        if(response.data.responseData.data[0]._fields[0].properties.properties !== undefined)
                            $scope.ng_properties = JSON.parse(response.data.responseData.data[0]._fields[0].properties.properties);
                        else
                            $scope.ng_properties = [];

                        var demoThumbUrl = "/files/"+$scope.newNGIconPath;
                        $scope.mockFiles = [
                            {name:'mock_file_1', size : 5000, isMock : true, serverImgUrl : demoThumbUrl},
                        ];

                        $scope.myDz = null;

                        $timeout(function(){

                            // get dropzone instance to emit some events
                            $scope.myDz = $scope.dzMethods.getDropzone();
                            // emit `addedfile` event with mock files
                            // emit `complete` event for mockfile as they are already uploaded
                            // decrease `maxFiles` count by one as we keep adding mock file
                            // push mock file dropzone
                            $scope.mockFiles.forEach(function(mockFile){
                                $scope.myDz.emit('addedfile', mockFile);
                                $scope.myDz.emit('complete', mockFile);
                                //$scope.myDz.options.maxFiles = $scope.myDz.options.maxFiles - 1;
                                $scope.myDz.files.push(mockFile);
                            });
                        });

                    }
                    else {
                        FlashService.Error(msg);
                        $scope.dataLoading = false;
                    }
                });
            e.stopPropagation();
        }
        
        $scope.updateNG = function () {
            var ngInfo = {};
            ngInfo.label = $scope.newNGLabel;
            ngInfo.link = $scope.newNGIconPath;
            ngInfo.companyId = $scope.user.usercompany;
            ngInfo.nodeId = $scope.nodeId;
            ngInfo.properties = JSON.stringify($scope.ng_properties);
            ngInfo.orgLabel = $scope.orgNGLabel;

            ngInfo.parentGroup = "";

            for (var key in $scope.needapprovalassigns){
                if($scope.needapprovalassigns[key].hasOwnProperty($scope.user.usergroup) && $scope.needapprovalassigns[key][$scope.user.usergroup].p_ng_u){
                    ngInfo.parentGroup = key;
                }
            }

            UserService.UpdateNodeGroup(ngInfo)
                .then(function (response) {
                    var msg = response.data.msg;
                    if (msg == "success") {
                        $scope.is_ng_update = false;
                        $scope.newNGLabel = "";
                        $scope.newNGIconPath = "";
                        $scope.ng_properties = [];
                        $scope.orgNGLabel = "";
                        d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                        setNodeProviders();
                        visualynk.taxonomy.createTaxonomyPanel();
                        visualynk.tools.reset();
                        visualynk.update();
                    }
                    else {
                        FlashService.Error(msg);
                        $scope.dataLoading = false;
                    }
                });
        }

        $scope.deleteNG = function (e, nodeId, label) {
            $scope.is_ng_create = false;
            $scope.is_ng_update = false;
            
            var ngInfo = {};
            ngInfo.nodeId = nodeId;
            ngInfo.ngLabel = label;
            ngInfo.parentGroup = "";

            for (var key in $scope.needapprovalassigns){
                if($scope.needapprovalassigns[key].hasOwnProperty($scope.user.usergroup) && $scope.needapprovalassigns[key][$scope.user.usergroup].p_ng_d){
                    ngInfo.parentGroup = key;
                }
            }

            if(confirm("Are you really sure delete this Node Group?")) {
                UserService.DeleteNodeGroup(ngInfo)
                    .then(function (response) {
                        var msg = response.data.msg;
                        if (msg == "success") {
                            $scope.is_ng_update = false;
                            $scope.newNGLabel = "";
                            $scope.newNGIconPath = "";
                            $scope.ng_properties = [];
                            $scope.orgNGLabel = "";

                            d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                            setNodeProviders();
                            visualynk.taxonomy.createTaxonomyPanel();
                            visualynk.tools.reset();
                            visualynk.update();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }
            e.stopPropagation();
        }
        
        $scope.openNECreate = function (e, ngId, label, companyId) {
            if(ngId >0) {
                $scope.is_ne_create = true;
                $scope.is_ne_update = false;
                $scope.is_ne_relation = false;
                $scope.is_ng_update = false;
                $scope.is_ng_create = false;
                $scope.mng_ne_label = label;
                $scope.ne_label = "";
                $scope.ne_properties = [];
                $scope.ne_properties_val = [];
                $scope.ne_company_id = companyId;

                UserService.GetNodeGroup(ngId)
                    .then(function (response) {
                        var msg = response.data.responseData.msg;
                        if (msg == "success") {
                            if (response.data.responseData.data[0]._fields[0].properties.properties !== undefined)
                                $scope.ne_properties = JSON.parse(response.data.responseData.data[0]._fields[0].properties.properties);
                            else
                                $scope.ne_properties = [];
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
                e.stopPropagation();
            }
        }
        
        $scope.createNE = function () {
            var is_pass = true;
            if($scope.ne_label == ""){
                alert("Please input the Entity label");
                return false;
            }
            $scope.ne_properties.forEach(function(p,ind){
                if ($scope.ne_properties_val[ind] === undefined){
                    is_pass = false;
                }
            })

            if(!is_pass)
                alert("Please input the all property values!");
            else{
                var neInfo = {};
                neInfo.ne_properties = JSON.stringify($scope.ne_properties);
                neInfo.ne_properties_val = JSON.stringify($scope.ne_properties_val);
                neInfo.ng_name = $scope.mng_ne_label;
                neInfo.ne_name = $scope.ne_label;
                neInfo.companyId = $scope.ne_company_id;
                neInfo.creatorGroup = $scope.user.usergroup;
                neInfo.parentGroup = "";

                for (var key in $scope.needapprovalassigns){
                    if($scope.needapprovalassigns[key].hasOwnProperty($scope.user.usergroup) && $scope.needapprovalassigns[key][$scope.user.usergroup].p_ne_c){
                        neInfo.parentGroup = key;
                    }
                }

                UserService.CreateNodeEntity(neInfo)
                    .then(function (response) {
                        var msg = response.data.msg;
                        if (msg == "success") {
                            $scope.is_ne_create = false;
                            $scope.ne_properties = [];
                            $scope.ne_properties_val = [];
                            $scope.ne_company_id = "";

                            d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                            setNodeProviders();
                            visualynk.taxonomy.createTaxonomyPanel();
                            visualynk.tools.reset();
                            visualynk.update();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }

        }

        $scope.cancelCreateNE = function () {
            $scope.is_ne_create = false;
            $scope.is_ne_update = false;
            $scope.is_ng_update = false;
            $scope.is_ng_create = false;
            $scope.ne_properties = [];
            $scope.ne_properties_val = [];
            $scope.ne_company_id = "";
        }

        $scope.openNEUpdate = function (e, ngId) {
            $scope.is_ne_update = true;
            $scope.is_ne_create = false;
            $scope.is_ng_update = false;
            $scope.is_ng_create = false;
            $scope.ne_id = ngId;

            UserService.GetNodeGroup(ngId)
                .then(function (response) {
                    var msg = response.data.responseData.msg;
                    if (msg == "success") {
                        var pdata = response.data.responseData.data[0]._fields[0].properties
                        $scope.ne_properties = [];
                        $scope.ne_properties_val = [];
                        for(var p in pdata){
                            if(p != "name") {
                                $scope.ne_properties.push(p);
                                $scope.ne_properties_val.push(pdata[p]);
                            } else
                                $scope.ne_label = pdata.name
                        }
                        /*if (response.data.responseData.data[0]._fields[0].properties.properties !== undefined)
                            $scope.ne_properties = JSON.parse(response.data.responseData.data[0]._fields[0].properties.properties);
                        else
                            $scope.ne_properties = [];*/
                    }
                    else {
                        FlashService.Error(msg);
                        $scope.dataLoading = false;
                    }
                });
            e.stopPropagation();
            console.log('update ne')
        }

        $scope.updateNE = function () {
            var is_pass = true;
            if($scope.ne_label == ""){
                alert("Please input the Entity label");
                return false;
            }
            $scope.ne_properties.forEach(function(p,ind){
                if ($scope.ne_properties_val[ind] === undefined){
                    is_pass = false;
                }
            })

            if(!is_pass)
                alert("Please input the all property values!");
            else{
                var neInfo = {};
                neInfo.ne_properties = JSON.stringify($scope.ne_properties);
                neInfo.ne_properties_val = JSON.stringify($scope.ne_properties_val);
                neInfo.ng_name = $scope.mng_ne_label;
                neInfo.ne_name = $scope.ne_label;
                neInfo.ne_id = $scope.ne_id;
                neInfo.parentGroup = "";

                for (var key in $scope.needapprovalassigns){
                    if($scope.needapprovalassigns[key].hasOwnProperty($scope.user.usergroup) && $scope.needapprovalassigns[key][$scope.user.usergroup].p_ne_u){
                        neInfo.parentGroup = key;
                    }
                }

                UserService.UpdateNodeEntity(neInfo)
                    .then(function (response) {
                        var msg = response.data.msg;
                        if (msg == "success") {
                            $scope.is_ne_update = false;
                            $scope.ne_properties = [];
                            $scope.ne_properties_val = [];
                            $scope.ne_label = '';
                            $scope.ne_company_id = "";

                            d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                            setNodeProviders();
                            visualynk.taxonomy.createTaxonomyPanel();
                            visualynk.tools.reset();
                            visualynk.update();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }
        }
        
        $scope.deleteNE = function (e, neId, ngLabel) {
            var neInfo = {};

            neInfo.ngLabel = ngLabel;
            neInfo.nodeId = neId;
            neInfo.parentGroup = "";

            for (var key in $scope.needapprovalassigns){
                if($scope.needapprovalassigns[key].hasOwnProperty($scope.user.usergroup) && $scope.needapprovalassigns[key][$scope.user.usergroup].p_ne_u){
                    neInfo.parentGroup = key;
                }
            }

            if(confirm("Are you really sure delete this Node Entity?")) {
                UserService.DeleteNodeEntity(neInfo)
                    .then(function (response) {
                        var msg = response.data.msg;
                        if (msg == "success") {
                            $scope.is_ne_update = false;
                            $scope.ne_properties = [];
                            $scope.ne_properties_val = [];
                            $scope.ne_label = '';

                            d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                            setNodeProviders();
                            visualynk.taxonomy.createTaxonomyPanel();
                            visualynk.tools.reset();
                            visualynk.update();
                        }
                        else {
                            FlashService.Error(msg);
                            $scope.dataLoading = false;
                        }
                    });
            }
        }

        $scope.openNERelations = function (e, ngId, neLabel, companyId) {
            $scope.is_ne_relation = true;
            $scope.neRelations = [];
            $scope.newRelationStarterID = ngId;
            $scope.newRelationStarterLabel = neLabel;
            $scope.newRelationCompanyId = companyId;
            $scope.newRelationDirection = "->";
            $scope.newRelationName = "";
            $scope.newRelationEnders = [];
            $scope.newRelationEnder = "";

            UserService.GetNodeEntityRelations(ngId)
                .then(function (response) {

                    var msg = response.data.responseData.msg;
                    if (msg == "success") {
                        var relations_data = response.data.responseData.data;
                        relations_data.forEach(function(rel){
                            var tmp = {};
                            tmp["startNode"] = rel._fields[0].properties.name;
                            tmp['direction'] = "->";
                            tmp['relationName'] = rel._fields[2];
                            tmp['endNode'] = rel._fields[1].properties.name;
                            tmp['relationID'] = rel._fields[3].low;

                            $scope.neRelations.push(tmp);
                        })
                    }
                    else {
                        FlashService.Error(msg);
                        $scope.dataLoading = false;
                    }
                });

            var neInfo = {};
            neInfo.companyId = companyId;
            neInfo.nodeId = ngId;
            UserService.GetNewRelationEnders(neInfo)
                .then(function (response) {

                    var msg = response.data.msg;
                    if(msg == 'success'){
                        var enders = response.data.responseData;

                        enders.forEach(function(ender, ind){
                            console.log(ind)
                            var tmp={};
                            tmp.id = ender._fields[0].low;
                            tmp.name = ender._fields[1].properties.name;

                            $scope.newRelationEnders.push(tmp);
                        })
                    }
                });
        }

        $scope.cancelCreateNERelation = function () {
            $scope.is_ne_relation = false;
            $scope.neRelations = [];
            $scope.newRelationStarterID = "";
            $scope.newRelationStarterLabel = "";
            $scope.newRelationDirection = "->";
            $scope.newRelationName = "";
            $scope.newRelationEnders = [];
            $scope.newRelationEnder = "";
        }

        $scope.createNERelation = function () {
            if($scope.newRelationName == ""){
                alert("Please input the Relation name!");
                return false;
            }

            if($scope.newRelationEnder == ""){
                alert("Please select the end node!");
                return false;
            }

            var neRelInfo = {};
            neRelInfo.startId = $scope.newRelationStarterID;
            neRelInfo.direction = $scope.newRelationDirection;
            neRelInfo.relationName = $scope.newRelationName;
            neRelInfo.enderId = $scope.newRelationEnder;

            UserService.CreateNewNERelation(neRelInfo)
                .then(function (response) {

                    var msg = response.data.responseData.msg;
                    if(msg == 'success'){
                        
                        $scope.neRelations = [];
                        $scope.newRelationDirection = "->";
                        $scope.newRelationName = "";
                        $scope.newRelationEnder = "";

                        UserService.GetNodeEntityRelations($scope.newRelationStarterID)
                            .then(function (response) {

                                var msg = response.data.responseData.msg;
                                if (msg == "success") {
                                    var relations_data = response.data.responseData.data;
                                    relations_data.forEach(function(rel){
                                        var tmp = {};
                                        tmp["startNode"] = rel._fields[0].properties.name;
                                        tmp['direction'] = "->";
                                        tmp['relationName'] = rel._fields[2];
                                        tmp['endNode'] = rel._fields[1].properties.name;
                                        tmp['relationID'] = rel._fields[3].low;

                                        $scope.neRelations.push(tmp);
                                    })
                                }
                                else {
                                    FlashService.Error(msg);
                                    $scope.dataLoading = false;
                                }
                            });

                    }
                });
        }

        $scope.removeNERelation = function(ind){
            if(confirm("Are you sure remove this relationship?")){
                var relationID = $scope.neRelations[ind].relationID;
                UserService.DeleteNERelation(relationID)
                    .then(function (response) {

                        var msg = response.data.responseData.msg;
                        if(msg == "success"){
                            $scope.neRelations = [];
                            $scope.newRelationDirection = "->";
                            $scope.newRelationName = "";
                            $scope.newRelationEnders = [];
                            $scope.newRelationEnder = "";

                            UserService.GetNodeEntityRelations($scope.newRelationStarterID)
                                .then(function (response) {

                                    var msg = response.data.responseData.msg;
                                    if (msg == "success") {
                                        var relations_data = response.data.responseData.data;
                                        relations_data.forEach(function(rel){
                                            var tmp = {};
                                            tmp["startNode"] = rel._fields[0].properties.name;
                                            tmp['direction'] = "->";
                                            tmp['relationName'] = rel._fields[2];
                                            tmp['endNode'] = rel._fields[1].properties.name;
                                            tmp['relationID'] = rel._fields[3].low;

                                            $scope.neRelations.push(tmp);
                                        })
                                    }
                                    else {
                                        FlashService.Error(msg);
                                        $scope.dataLoading = false;
                                    }
                                });


                            var neInfo = {};
                            neInfo.companyId = $scope.newRelationCompanyId;
                            neInfo.nodeId = $scope.newRelationStarterID;
                            UserService.GetNewRelationEnders(neInfo)
                                .then(function (response) {

                                    var msg = response.data.msg;
                                    if(msg == 'success'){
                                        var enders = response.data.responseData;

                                        enders.forEach(function(ender, ind){

                                            var tmp={};
                                            tmp.id = ender._fields[0].low;
                                            tmp.name = ender._fields[1].properties.name;

                                            $scope.newRelationEnders.push(tmp);
                                        })
                                    }
                                });
                        }
                    });
            }
        }

        //initialize the panel
        App.init();

    };

    function config_func(t,valueSystem,provider) {
        var SystemData = [t];
        for ( var i = 0; i < SystemData.length; i++) {
            if(SystemData[i] == valueSystem){
                ck_filter = true;
                inputValueSystem = valueSystem;
                d3.select("#" + visualynk.taxonomy.containerId).selectAll("ul").data([]).exit().remove();
                visualynk.taxonomy.createTaxonomyPanel();
                break;
            }
        }
    }
    app.directive('resizer', function($document) {

        return function($scope, $element, $attrs) {

            $element.on('mousedown', function(event) {
                event.preventDefault();

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                var zero_position = $("#panel-1-resize").offset().left;
                if ($attrs.id == 'panel-1-resizer') {
                    // Handle vertical resizer
                    var x = event.pageX;
                    var resizerMax = $("#" + $attrs.id).attr("resizer-max");
                    var resizerMin = $("#" + $attrs.id).attr("resizer-min");
                    if (resizerMax && x > resizerMax) {
                        x = parseInt(resizerMax);
                    }
                    if (resizerMin && x < resizerMin){
                        x = parseInt(resizerMin);
                    }
                    $element.css({
                        left: x  + 'px'
                    });

                    $($attrs.resizerLeft).css({
                        width: x -zero_position+ 'px'
                    });
                    var left = x -zero_position;
                    $($attrs.resizerRight).css({
                        left: (x + parseInt($attrs.resizerWidth)) +  'px',
                        width : localStorage.getItem("middle_paneright") - x - parseInt($attrs.resizerWidth) + 'px'
                    });


                    localStorage.setItem("panel_1_width",$("#panel-1-resize").width());
                    localStorage.setItem("panel_2_width",$("#panel-2-resize").width());
                    localStorage.setItem("panel_3_width",$("#panel-3-resize").width());

                }
                if($attrs.id == 'panel-2-resizer'){
                    // Handle vertical resizer
                    var x = event.pageX;
                    var resizerMax = $("#" + $attrs.id).attr("resizer-max");
                    var resizerMin = $("#" + $attrs.id).attr("resizer-min");

                    if (resizerMax && x > resizerMax) {
                        x = parseInt(resizerMax);
                    }
                    if (resizerMin && x < resizerMin){
                        x = parseInt(resizerMin);
                    }
                    /*delta_last = localStorage.getItem("last_paneleft") - x - delta_offset_last;*/
                    $element.css({
                        left: x   + 'px'
                    });

                    $($attrs.resizerLeft).css({
                        width: x - $("#panel-2-resize").offset().left + 'px'
                    });
                    $($attrs.resizerRight).css({
                        left: (x  + parseInt($attrs.resizerWidth)) + 'px',
                        width: localStorage.getItem("last_paneright")  - (x  + parseInt($attrs.resizerWidth)) + 'px'
                    });
                    localStorage.setItem("panel_1_width",$("#panel-1-resize").width());
                    localStorage.setItem("panel_2_width",$("#panel-2-resize").width());
                    localStorage.setItem("panel_3_width",$("#panel-3-resize").width());
                    //set another panel width
                }
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
                panelSaveResize()
            }
        };
    });
    function panelSaveResize(){
        middle_paneright = $("#panel-2-resize").offset().left + $("#panel-2-resize").outerWidth();
        middle_paneleft = $("#panel-2-resize").offset().left;

        last_paneright = $("#panel-3-resize").offset().left + $("#panel-3-resize").outerWidth();
        last_paneleft = $("#panel-3-resize").offset().left;

        localStorage.setItem("middle_paneleft",middle_paneleft);
        localStorage.setItem("middle_paneright",middle_paneright);
        localStorage.setItem("last_paneleft",last_paneleft);
        localStorage.setItem("last_paneright",last_paneright);

        //save the range of resizer
        var min_1 = Math.floor($("#panel-1-resize").offset().left) + 50;
        var max_1 = Math.floor($("#panel-3-resize").offset().left) - 50;

        var min_2 = Math.floor($("#panel-2-resize").offset().left) + 50;
        var max_2 = last_paneright - 50;

        $("#panel-1-resizer").attr("resizer-min",min_1);
        $("#panel-1-resizer").attr("resizer-max",max_1);

        $("#panel-2-resizer").attr("resizer-min",min_2);
        $("#panel-2-resizer").attr("resizer-max",max_2);

    }
    $.fn.enterKey = function (fnc) {
        return this.each(function () {
            $(this).keypress(function (ev) {
                var keycode = (ev.keyCode ? ev.keyCode : ev.which);
                if (keycode == '13') {
                    fnc.call(this, ev);
                }
            })
        })
    }

})();