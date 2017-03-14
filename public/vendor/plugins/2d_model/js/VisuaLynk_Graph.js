function selectInstance(t, e) {
    visualynk.graph.mainLabel = t, instanceData = {
        label: t,
        attributes: e
    }, visualynk.tools.reset(), instanceData = null
}
var aa, bb, cc, dd, ee, inputValueSystem,  inputValueGuid, companyId;

visualynk.rest.CYPHER_URL = "http://localhost:7474/db/data/transaction/commit", visualynk.rest.AUTHORIZATION = "Basic " + btoa("neo4j:meh_nam");

var instanceData, rootNodeListener = function(t) {
    instanceData && (t.value = {
        type: visualynk.graph.node.NodeTypes.VALUE,
        label: instanceData.label
    }, t.value.attributes = instanceData.attributes, t.immutable = !1)
};
function clickMenu(e){
    alert(e);
}
function download(e){
    /*alert(e);*/
    //download file
    console.log(e);
    /*$.ajax({
            method: "POST",
            url: "/download",
            data: { fname: e }
        })
        .done(function( msg ) {

        });*/
    /*window.location='/download/' + e;*/
    window.open('/files/' + e , '_blank');
}

function setNodeProviders() {
    var sel = '#panel-wrapper';
    $scope = angular.element(sel).scope();
    var companyId = $scope.user.usercompany;
    var userId = $scope.user.userId;

    if(companyId == "undefined")
        companyId = "";

    var child_node_groups = [];
    var child_node_groups_providers = [];

    visualynk.provider.nodeProviders = {};

    var reqInfo = {};
    reqInfo.companyId = companyId;
    reqInfo.userId = userId;
    
    $.ajax({
            method: "POST",
            url: "/getNodeGroups",
            data: {companyId: companyId, userId: userId},
            async: false
        })
        .done(function (data) {
            data.responseData.data.forEach(function (ngind) {
                var p = [];
                child_node_groups.push(ngind._fields[0].properties.name);
                if(ngind._fields[0].properties.properties !== undefined )
                    p = JSON.parse(ngind._fields[0].properties.properties);

                child_node_groups_providers.push({
                    name: ngind._fields[0].properties.name,
                    id: ngind._fields[0].identity.low,
                    icon: ngind._fields[0].properties.icon,
                    properties: p,
                    companyId: ngind._fields[0].properties.companyId
                })
            })
        });

    visualynk.provider.nodeProviders = {
        Visualynk: {
            children: child_node_groups,
            returnAttributes: ["name", "link"],
            constraintAttribute: "name",
            resultOrderByAttribute: "name",
            nodeId: -1,
            companyId: -1,
            displayResults: function (t) {
                var ele = t[0][0];
                var e = t.append("div").attr("style", "display: flex;");
                var n = e.append("div").attr("style", "font-size:12px;text-align:left;width:100%;overflow: hidden;text-overflow: ellipsis;").text(function (t) {
                    if (t.attributes.link != "") {
                        $(ele).find("div>div").css("color", "blue").css("cursor", "pointer").css("text-decoration", "underline");
                        $(ele).find("div>div").attr("onClick", "download('" + t.attributes.link + "')");
                    }
                    return t.attributes.name != "" ? t.attributes.name : " empty";
                });
                e.append("i").attr("class", "halflings-icon tasks").attr("onClick", "clickMenu('" + t[0][0].id + "')");
            },
            getDisplayType: function () {
                return visualynk.provider.NodeDisplayTypes.IMAGE
            },
            getImagePath: function (t) {
                return "vendor/plugins/2d_model/img/3DtoGraph.png"
            },
            getImageWidth: function () {
                return 50
            },
            getImageHeight: function () {
                return 50
            },
            getPredefinedConstraints: function () {
                var ret_val = [];
                ret_val.push('$identifier.is_full_show=true');

                if (companyId !== undefined && companyId != "")
                    ret_val.push('$identifier.companyId="' + companyId+'"');

                if (inputValueSystem)
                    ret_val.push("$identifier.name =~ '(?i).*" + inputValueSystem.replace("|", "\\\\|").replace("(", "\\\\(").replace(")", "\\\\)") + ".*'");

                return ret_val;
                //return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
            }
        }
    }

    child_node_groups_providers.forEach(function (group) {
        group.properties.push('name');

        visualynk.provider.nodeProviders[group.name] = {
            parent: "Visualynk",
            returnAttributes: group.properties,
            constraintAttribute: "name",
            resultOrderByAttribute: "name",
            nodeId: group.id,
            companyId: group.companyId,
            getDisplayType: function () {
                return visualynk.provider.NodeDisplayTypes.IMAGE
            },
            getImagePath: function () {
                return "/files/"+group.icon
            },
            displayResults: function (t) {
                if($scope.user.crudpermissions.p_ne_r) {
                    var e = t.append("div").attr("style", "display: flex;");
                    var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:0px;width:100%");

                    var table_tbody = n.append("table").attr("class", "tree-2 table-condensed").attr("style", "width:100%").append("tbody");
                    var table_tr = table_tbody.append("tr").attr("class", "treegrid-1");
                    var table_td = table_tr.append("td");
                    table_td.append("span").attr("class", "treegrid-expander halflings-icon plus");
                    var ele = t[0][0];
                    table_td.append("span").text(function (t) {
                        if (t.attributes.link != "") {
                            $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color", "blue").css("cursor", "pointer").css("text-decoration", "underline");
                            $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick", "download('" + t.attributes.link + "')");
                        }
                        return t.attributes.name;
                    });

                    if ($scope.user.crudpermissions.p_ne_d) {
                        table_td.append("span").attr("class", "halflings-icon remove pull-right").attr("ng-click", function (t) {
                            return "deleteNE($event," + t.attributes.id + ", '"+t.label+"')";

                        });
                    }

                    if ($scope.user.crudpermissions.p_ne_u) {
                        table_td.append("span").attr("class", "halflings-icon edit pull-right").attr("ng-click", function (t) {
                            return "openNEUpdate($event," + t.attributes.id + ")";
                        });
                    }

                    if ($scope.user.crudpermissions.p_ne_u) {
                        table_td.append("span").attr("class", "halflings-icon link pull-right").attr("ng-click", function (t) {
                            var d = visualynk.provider.getProvider(t.label);
                            var companyId = d.companyId;
                            return "openNERelations($event," + t.attributes.id + ", '"+t.attributes.name+"', '"+companyId+"')";
                        });
                    }

                    angular.element(document).injector().invoke(function ($compile, $rootScope) {
                        var scope = angular.element("#panel-wrapper").scope();
                        e.each(function (d, i) {
                            $compile(this)(scope);
                        });
                    });

                    group.properties.forEach(function (prop) {
                        if (prop != "name") {
                            var td1 = table_tbody.append("tr").attr("class", "treegrid-2 treegrid-parent-1").append("td");
                            var row_fluid1 = td1.append("div").attr("class", "row-fluid").attr("style", "width:calc(100% - 16px);float:right;");
                            row_fluid1.append("div").attr("class", "span5").attr("style", "text-align:right").text(function (t) {
                                return prop + ": ";
                            });

                            row_fluid1.append("div").attr("class", "span7").text(function (t) {
                                return t.attributes[prop];
                            });
                        }

                    })
                }
            },
            getImageWidth: function () {
                return 50
            },
            getImageHeight: function () {
                return 50
            },
            getPredefinedConstraints: function () {
                var ret_val = [];
                ret_val.push('$identifier.is_full_show=true');

                if (companyId !== undefined && companyId != "")
                    ret_val.push('$identifier.companyId="' + companyId+'"');

                if (inputValueSystem)
                    ret_val.push("$identifier.name =~ '(?i).*" + inputValueSystem.replace("|", "\\\\|").replace("(", "\\\\(").replace(")", "\\\\)") + ".*'");

                return ret_val;
                //return inputValueSystem ? ["$identifier.email =~ '(?i).*" + inputValueSystem.replace("|", "\\\\|").replace("(", "\\\\(").replace(")", "\\\\)") + ".*'"] : []
            }
        }
    });
}

setNodeProviders();

visualynk.graph.on(visualynk.graph.Events.NODE_ROOT_ADD, rootNodeListener), visualynk.provider.nodeProviders1 = {
    Facility_Management: {
        children: ["PERSON", "COMPANY", "FACILITY", "FLOOR", "ZONE", "SPACE", "ASSET","COMPONENT","SYSTEM", "ASSEMBLY", "CONNECTION", "SPARE", "RESOURCE", "JOB", "SERVICE_REQUEST", "DOCUMENT", "ATTRIBUTE"],
        returnAttributes: ["name","link"],
        constraintAttribute: "name",
        resultOrderByAttribute: "name",
        displayResults : function(t){
            var ele = t[0][0];
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;width:100%;overflow: hidden;text-overflow: ellipsis;").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name != "" ?  t.attributes.name:" empty";
            });
            e.append("i").attr("class","halflings-icon tasks").attr("onClick","clickMenu('"+t[0][0].id+"')");
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/3DtoGraph.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            var ret_val = [];
            if(companyId !== undefined && companyId != "")
                ret_val.push("$identifier.companyid="+companyId);

            if(inputValueSystem)
                ret_val.push("$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'");

            return ret_val;
            //return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    PERSON: {
        parent: "Facility_Management",
        returnAttributes: ["email", "first_name", "last_name","created_on","link"],
        constraintAttribute: "email",
        resultOrderByAttribute: "email",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/email.png"
        },
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var ele = t[0][0];
            var p_state = "none";
            if ($('body').hasClass("page-sidebar-closed")) {
                p_state = "block"
            }
            e.append("img").attr("class","person").attr("style", "width:60px;display:"+p_state+"; height:60px; border-radius: 50% !important; margin:5px 5px 5px 0px;overflow: hidden;text-overflow: ellipsis;").attr("src", function(t) {
                return (t.attributes.last_name != "")?"vendor/plugins/2d_model/img/" + t.attributes.last_name + ".jpg":"vendor/plugins/2d_model/img/no-images.png"
            });
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");
            n.append("p").append("i").attr("class","icon-user").attr("style","font-family:FontAwesome !important;").text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div").attr("onClick","download('"+t.attributes.link+"')");
                }
                return " " + t.attributes.first_name + " " + t.attributes.last_name
            });
            n.append("p").append("i").attr("class","icon-envelope").attr("style","font-family:FontAwesome !important;").append("span").attr("style","display: inline-block;width: 135px;margin-left:3px;vertical-align: middle;cursor:default;overflow: hidden;text-overflow: ellipsis;")
                .text(function(t) {
                    if(t.attributes.link!=""){
                        $(ele).find("div>div").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                        $(ele).find("div>div").attr("onClick","download('"+t.attributes.link+"')");
                    }
                    return " " + t.attributes.email
                });
            /* created on */
            n.append("p").append("i").attr("class","icon-calendar").attr("style","font-family:FontAwesome !important;").append("span").attr("style","display: inline-block;width: 135px;margin-left:3px;vertical-align: middle;cursor:default;overflow: hidden;text-overflow: ellipsis;")
                .text(function(t) {
                    if(t.attributes.link!=""){
                        $(ele).find("div>div").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                        $(ele).find("div>div").attr("onClick","download('"+t.attributes.link+"')");
                    }
                    return " " + t.attributes.created_on.replace("T"," ");
                });
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.email =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    COMPANY: {
        parent: "Facility_Management",
        returnAttributes: ["country","name", "department", "organization_code","town","phone","address_street","state","postal_box","postal_code","link"],
        constraintAttribute: "name",
        resultOrderByAttribute: "name",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/company.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            /*n.append("p").append("span").attr("style","display: inline-block;width: 135px;margin-left:3px;vertical-align: middle;cursor:default;overflow: hidden;text-overflow: ellipsis;")
                .text(function(t) {
                    return " " + t.attributes.name
                });*/
            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            var ele = t[0][0];
            table_td.append("span").text(function(t){

                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "country: ";
            });
            row_fluid1.append("div").attr("class","span7").text(function(t){
                return t.attributes.country;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "town: ";
            });
            row_fluid2.append("div").attr("class","span7").text(function(t){
                return t.attributes.town;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "phone: ";
            });
            row_fluid3.append("div").attr("class","span7").text(function(t){
                return t.attributes.phone;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "address: ";
            });
            row_fluid4.append("div").attr("class","span7").text(function(t){
                return t.attributes.address_street;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "state: ";
            });
            row_fluid5.append("div").attr("class","span7").text(function(t){
                return t.attributes.state;
            });

            var td6 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid6 = td6.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid6.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "postal_box: ";
            });
            row_fluid6.append("div").attr("class","span7").text(function(t){
                return t.attributes.postal_box;
            });

            var td7 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid7 = td7.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid7.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "department: ";
            });
            row_fluid7.append("div").attr("class","span7").text(function(t){
                return t.attributes.department;
            });

            var td8 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid8 = td8.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid8.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "postal_code: ";
            });
            row_fluid8.append("div").attr("class","span7").text(function(t){
                return t.attributes.postal_code;
            });

            var td9 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid9 = td9.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid9.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "organization: ";
            });
            row_fluid9.append("div").attr("class","span7").text(function(t){
                return t.attributes.organization_code;
            });

        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }


    },
    FACILITY: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link","phase","area","site_desc","facility_desc","length"
        ,"project_name","project_desc","volumn","sitename","created","name","currency","category"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/facility.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            var ele = t[0][0];
            table_td.append("span").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "phase: ";
            });
            row_fluid1.append("div").attr("class","span7").text(function(t){
                return t.attributes.phase;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "area: ";
            });
            row_fluid2.append("div").attr("class","span7").text(function(t){
                return t.attributes.area;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "site_desc: ";
            });
            row_fluid3.append("div").attr("class","span7").text(function(t){
                return t.attributes.site_desc;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "facility_desc: ";
            });
            row_fluid4.append("div").attr("class","span7").text(function(t){
                return t.attributes.facility_desc;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "length: ";
            });
            row_fluid5.append("div").attr("class","span7").text(function(t){
                return t.attributes.length;
            });

            var td6 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid6 = td6.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid6.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "project_name: ";
            });
            row_fluid6.append("div").attr("class","span7").text(function(t){
                return t.attributes.project_name;
            });

            var td7 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid7 = td7.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid7.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "project_desc: ";
            });
            row_fluid7.append("div").attr("class","span7").text(function(t){
                return t.attributes.project_desc;
            });

            var td8 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid8 = td8.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid8.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "volumn: ";
            });
            row_fluid8.append("div").attr("class","span7").text(function(t){
                return t.attributes.volumn;
            });

            var td9 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid9 = td9.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid9.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "site_name: ";
            });
            row_fluid9.append("div").attr("class","span7").text(function(t){
                return t.attributes.site_name;
            });

            var td10 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid10 = td10.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid10.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "created: ";
            });
            row_fluid10.append("div").attr("class","span7").text(function(t){
                return t.attributes.created_on;
            });

            var td11 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid11 = td11.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid11.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "currency: ";
            });
            row_fluid11.append("div").attr("class","span7").text(function(t){
                return t.attributes.currency;
            });

            var td12 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid12 = td12.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid12.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "category: ";
            });
            row_fluid12.append("div").attr("class","span7").text(function(t){
                return t.attributes.category;
            });


        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    FLOOR: {
      parent: "Facility_Management",
      returnAttributes: ["name", "link","elevation","created_on","description","category","height"],
      constraintAttribute: "name",
      URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            var ele = t[0][0];
            table_td.append("span").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "elevation: ";
            });
            row_fluid1.append("div").attr("class","span7").text(function(t){
                return t.attributes.elevation;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "created: ";
            });
            row_fluid2.append("div").attr("class","span7").text(function(t){
                return t.attributes.created_on;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "description: ";
            });
            row_fluid3.append("div").attr("class","span7").text(function(t){
                return t.attributes.description;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "category: ";
            });
            row_fluid4.append("div").attr("class","span7").text(function(t){
                return t.attributes.category;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "height: ";
            });
            row_fluid5.append("div").attr("class","span7").text(function(t){
                return t.attributes.height;
            });
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/floor.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    ZONE: {
      parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/zone.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    SPACE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link","gross_area","created_on","room_tag","description","category","height","net_area"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            var ele = t[0][0];
            table_td.append("span").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span6").attr("style","text-align:right").text(function(t){
                return "gross_area: ";
            });
            row_fluid1.append("div").attr("class","span6").text(function(t){
                return t.attributes.gross_area;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span6").attr("style","text-align:right").text(function(t){
                return "created: ";
            });
            row_fluid2.append("div").attr("class","span6").text(function(t){
                return t.attributes.created_on;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span6").attr("style","text-align:right").text(function(t){
                return "room_tag: ";
            });
            row_fluid3.append("div").attr("class","span6").text(function(t){
                return t.attributes.room_tag;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span6").attr("style","text-align:right").text(function(t){
                return "description: ";
            });
            row_fluid4.append("div").attr("class","span6").text(function(t){
                return t.attributes.description;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span6").attr("style","text-align:right").text(function(t){
                return "category: ";
            });
            row_fluid5.append("div").attr("class","span6").text(function(t){
                return t.attributes.category;
            });

            var td6 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid6 = td6.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid6.append("div").attr("class","span6").attr("style","text-align:right").text(function(t){
                return "usable_height: ";
            });
            row_fluid6.append("div").attr("class","span6").text(function(t){
                return t.attributes.usable_height;
            });

            var td7 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid7 = td7.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid7.append("div").attr("class","span6").attr("style","text-align:right").text(function(t){
                return "net_area: ";
            });
            row_fluid7.append("div").attr("class","span6").text(function(t){
                return t.attributes.net_area;
            });
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/space.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    ASSET: {
        parent: "Facility_Management",
        returnAttributes: ["name","color","expected_life","model_reference","replacement_cost",
            "description","features","accessibility_perf","asset_type","finish",
            "nominal_height","model_number","shape","code_perf","nominal_width"
            ,"duration_unit","nominal_length","material","size",
            "created_on","sustainability_perf","grade","category","constituents"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            var ele = t[0][0];
            table_td.append("span").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "color: ";
            });
            row_fluid1.append("div").attr("class","span5").text(function(t){
                return t.attributes.color;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "expected_life: ";
            });
            row_fluid2.append("div").attr("class","span5").text(function(t){
                return t.attributes.expected_life;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "model_reference: ";
            });
            row_fluid3.append("div").attr("class","span5").text(function(t){
                return t.attributes.model_reference;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "replacement_cost: ";
            });
            row_fluid4.append("div").attr("class","span5").text(function(t){
                return t.attributes.replacement_cost;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "description: ";
            });
            row_fluid5.append("div").attr("class","span5").text(function(t){
                return t.attributes.description;
            });

            var td6 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid6 = td6.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid6.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "features: ";
            });
            row_fluid6.append("div").attr("class","span5").text(function(t){
                return t.attributes.features;
            });

            var td7 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid7 = td7.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid7.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "accessibility_perf: ";
            });
            row_fluid7.append("div").attr("class","span5").text(function(t){
                return t.attributes.accessibility_perf;
            });

            var td8 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid8 = td8.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid8.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "asset_type: ";
            });
            row_fluid8.append("div").attr("class","span5").text(function(t){
                return t.attributes.asset_type;
            });

            var td9 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid9 = td9.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid9.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "finish: ";
            });
            row_fluid9.append("div").attr("class","span5").text(function(t){
                return t.attributes.finish;
            });

            var td10 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid10 = td10.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid10.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "nominal_height: ";
            });
            row_fluid10.append("div").attr("class","span5").text(function(t){
                return t.attributes.nominal_height;
            });

            var td11 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid11 = td11.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid11.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "model_number: ";
            });
            row_fluid11.append("div").attr("class","span5").text(function(t){
                return t.attributes.model_number;
            });

            var td12 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid12 = td12.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid12.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "shape: ";
            });
            row_fluid12.append("div").attr("class","span5").text(function(t){
                return t.attributes.shape;
            });

            var td13 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid13 = td13.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid13.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "code_perf: ";
            });
            row_fluid13.append("div").attr("class","span5").text(function(t){
                return t.attributes.code_perf;
            });

            var td14 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid14 = td14.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid14.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "nominal_width: ";
            });
            row_fluid14.append("div").attr("class","span5").text(function(t){
                return t.attributes.nominal_width;
            });


            var td15 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid15 = td15.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid15.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "duration_unit: ";
            });
            row_fluid15.append("div").attr("class","span5").text(function(t){
                return t.attributes.duration_unit;
            });

            var td16 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid16 = td16.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid16.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "nominal_length: ";
            });
            row_fluid16.append("div").attr("class","span5").text(function(t){
                return t.attributes.nominal_length;
            });

            var td17 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid17 = td17.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid17.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "material: ";
            });
            row_fluid17.append("div").attr("class","span5").text(function(t){
                return t.attributes.material;
            });

            var td18 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid18 = td18.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid18.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "size: ";
            });
            row_fluid18.append("div").attr("class","span5").text(function(t){
                return t.attributes.size;
            });

            var td19 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid19 = td19.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid19.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "created_on: ";
            });
            row_fluid19.append("div").attr("class","span5").text(function(t){
                return t.attributes.created_on;
            });

            var td20 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid20 = td20.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid20.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "sustainability_perf: ";
            });
            row_fluid20.append("div").attr("class","span5").text(function(t){
                return t.attributes.sustainability_perf;
            });

            var td21 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid21 = td21.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid21.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "grade: ";
            });
            row_fluid21.append("div").attr("class","span5").text(function(t){
                return t.attributes.grade;
            });

            var td22 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid22 = td22.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid22.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "category: ";
            });
            row_fluid22.append("div").attr("class","span5").text(function(t){
                return t.attributes.category;
            });

            var td23 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid23 = td23.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid23.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "constituents: ";
            });
            row_fluid23.append("div").attr("class","span5").text(function(t){
                return t.attributes.constituents;
            });

        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/asset.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    COMPONENT: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link","warranty_start","installation_date","created_on",
        "asset_identifier","tag_number","description","serial_number","barcode"],
        constraintAttribute: "name",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            var ele = t[0][0];
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/component.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        },
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            table_td.append("span").text(function(t){
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "description: ";
            });
            row_fluid1.append("div").attr("class","span5").text(function(t){
                return t.attributes.description;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "warranty_start: ";
            });
            row_fluid2.append("div").attr("class","span5").text(function(t){
                return t.attributes.warranty_start;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "installation_date: ";
            });
            row_fluid3.append("div").attr("class","span5").text(function(t){
                return t.attributes.installation_date;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "created: ";
            });
            row_fluid4.append("div").attr("class","span5").text(function(t){
                return t.attributes.created_on;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "asset_identifier: ";
            });
            row_fluid5.append("div").attr("class","span5").text(function(t){
                return t.attributes.asset_identifier;
            });

            var td6 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid6 = td6.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid6.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "tag_number: ";
            });
            row_fluid6.append("div").attr("class","span5").text(function(t){
                return t.attributes.tag_number;
            });

            var td7 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid7 = td7.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid7.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "serial_number: ";
            });
            row_fluid7.append("div").attr("class","span5").text(function(t){
                return t.attributes.serial_number;
            });

            var td8 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid8 = td8.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid8.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "barcode: ";
            });
            row_fluid8.append("div").attr("class","span5").text(function(t){
                return t.attributes.barcode;
            });

        }
    },
    SYSTEM: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link","created_on","description","category"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            var ele = t[0][0];
            table_td.append("span").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "description: ";
            });
            row_fluid1.append("div").attr("class","span5").text(function(t){
                return t.attributes.description;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "created: ";
            });
            row_fluid2.append("div").attr("class","span5").text(function(t){
                return t.attributes.created_on;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "category: ";
            });
            row_fluid3.append("div").attr("class","span5").text(function(t){
                return t.attributes.category;
            });
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/system.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    ASSEMBLY: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            var ele = t[0][0];
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/assembly.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    CONNECTION: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            var ele = t[0][0];
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/connection.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    SPARE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            var ele = t[0][0];
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/spare.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    RESOURCE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            var ele = t[0][0];
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/resource.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    JOB: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("id", "row1");
            var ele = t[0][0];
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/job.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    SERVICE_REQUEST: {
        parent: "Facility_Management",
        returnAttributes: ["message", "id", "link"],
        constraintAttribute: "message",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("table").attr("class", "result-table"),
                n = e.append("tr").attr("message", "row1");
            var ele = t[0][0];
            n.append("td").append("p").append("a").attr("href", function(t) {
                return t.attributes.link ? t.attributes.link : "#"
            }).text(function(t) {
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.message
            })
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/stage.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.message =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    DOCUMENT: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link","stage","created_on","approval_status","file_name"
        ,"description","category","directory"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/document.png"
        },
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            var ele = t[0][0];
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            table_td.append("span").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "description: ";
            });
            row_fluid1.append("div").attr("class","span5").text(function(t){
                return t.attributes.description;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "stage: ";
            });
            row_fluid2.append("div").attr("class","span5").text(function(t){
                return t.attributes.stage;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "approval_status: ";
            });
            row_fluid3.append("div").attr("class","span5").text(function(t){
                return t.attributes.approval_status;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "created: ";
            });
            row_fluid4.append("div").attr("class","span5").text(function(t){
                return t.attributes.created_on;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "file_name: ";
            });
            row_fluid5.append("div").attr("class","span5").text(function(t){
                return t.attributes.file_name;
            });

            var td6 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid6 = td6.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid6.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "category: ";
            });
            row_fluid6.append("div").attr("class","span5").text(function(t){
                return t.attributes.category;
            });

            var td7 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid7 = td7.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid7.append("div").attr("class","span7").attr("style","text-align:right").text(function(t){
                return "directory: ";
            });
            row_fluid7.append("div").attr("class","span5").text(function(t){
                return t.attributes.directory;
            });

        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
    ATTRIBUTE: {
        parent: "Facility_Management",
        returnAttributes: ["name", "link","unit","created_on","description","category","value"],
        constraintAttribute: "name",
        URLlinkAttribute: "link",
        displayResults: function(t) {
            var e = t.append("div").attr("style", "display: flex;");
            var n = e.append("div").attr("style", "font-size:12px;text-align:left;margin-left:10px;");

            var table_tbody = n.append("table").attr("class","tree-2 table-condensed").append("tbody");
            var table_tr = table_tbody.append("tr").attr("class","treegrid-1");
            var table_td = table_tr.append("td");
            table_td.append("span").attr("class","treegrid-expander halflings-icon plus");
            var ele = t[0][0];
            table_td.append("span").text(function(t){
                if(t.attributes.link!=""){
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").css("color","blue").css("cursor", "pointer").css("text-decoration","underline");
                    $(ele).find("div>div .treegrid-1 td span:nth-child(2)").attr("onClick","download('"+t.attributes.link+"')");
                }
                return t.attributes.name;
            })

            var td1 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid1 = td1.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid1.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "description: ";
            });
            row_fluid1.append("div").attr("class","span7").text(function(t){
                return t.attributes.description;
            });

            var td2 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid2 = td2.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid2.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "unit: ";
            });
            row_fluid2.append("div").attr("class","span7").text(function(t){
                return t.attributes.unit;
            });


            var td3 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid3 = td3.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid3.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "category: ";
            });
            row_fluid3.append("div").attr("class","span7").text(function(t){
                return t.attributes.category;
            });

            var td4 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid4 = td4.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid4.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "created: ";
            });
            row_fluid4.append("div").attr("class","span7").text(function(t){
                return t.attributes.created_on;
            });

            var td5 = table_tbody.append("tr").attr("class","treegrid-2 treegrid-parent-1").append("td");
            var row_fluid5 = td5.append("div").attr("class","row-fluid").attr("style","width:calc(100% - 16px);float:right;");
            row_fluid5.append("div").attr("class","span5").attr("style","text-align:right").text(function(t){
                return "value: ";
            });
            row_fluid5.append("div").attr("class","span7").text(function(t){
                return t.attributes.value;
            });
        },
        getDisplayType: function() {
            return visualynk.provider.NodeDisplayTypes.IMAGE
        },
        getImagePath: function() {
            return "vendor/plugins/2d_model/img/attribute.png"
        },
        getImageWidth: function() {
            return 50
        },
        getImageHeight: function() {
            return 50
        },
        getPredefinedConstraints: function() {
            return inputValueSystem ? ["$identifier.name =~ '(?i).*" + inputValueSystem.replace("|","\\\\|").replace("(","\\\\(").replace(")","\\\\)") + ".*'"] : []
        }
    },
}, visualynk.graph.LINK_DISTANCE = 80, visualynk.graph.node.BACK_CIRCLE_R = 30, visualynk.graph.node.TEXT_Y = -30, visualynk.graph.node.NODE_MAX_CHARS = 60, visualynk.result.onTotalResultCount(function(t) {
    d3.select("#rescount").text(function() {
        return "(" + t + ")"
    })
}),

    visualynk.query.RESULTS_PAGE_SIZE = 1e3;
    visualynk.logger.LEVEL = visualynk.logger.LogLevels.INFO;

visualynk.start("Visualynk");
//visualynk.start("Facility_Management");
