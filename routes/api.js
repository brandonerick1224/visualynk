/*
 * Serve JSON to our AngularJS client
 */

var neo4j = require('neo4j-js');
var async = require('async');
var neo4JUrl = 'http://localhost:7474/db/data/';
var passport = require('passport');
var jwt = require('jsonwebtoken');
var util = require('util');
var request = require('request');
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var fs = require('fs');
var mailconfFile = 'config/mailconfig.json';
var countriesconfFile = 'config/countries.json';
var path = require('path');
var url = require('url');
var http = require('http');

var neo4j_driver = require('neo4j-driver').v1;
var driver = neo4j_driver.driver("bolt://localhost", neo4j_driver.auth.basic("neo4j", "12345"));
var session = driver.session();

function readConfig(file){
    return JSON.parse(fs.readFileSync(file));
}
var mailConf = readConfig(mailconfFile);
var countries = readConfig(countriesconfFile);

var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: mailConf.username,
        pass: mailConf.password
    }
}));
var multer  = require('multer');
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('myimage');

exports.getCountries = function(req, res){
    res.json(countries);
}
exports.ngIconUpload = function(req,res){
    var filepath = req.body.filename;

    var milliseconds = new Date().getTime();
    filepath = milliseconds;

    if (!fs.existsSync("./uploads")){
        fs.mkdirSync("./uploads");
    }

    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }

        fs.readFile(req.files.filename.path, function(err, data) {
            var fext = path.extname(req.files.filename.originalFilename);
            newPath = "./uploads/" + filepath + fext;
            var file_name = filepath + fext;

            fs.writeFile(newPath, data, function (err) {
                res.json({filename:file_name});
            });

        });
    })
}
exports.twoDimentionModelUpload = function(req,res){
    var filepath = req.body.filename;

    /*var milliseconds = new Date().getTime();
    filepath = milliseconds;*/

    if (!fs.existsSync("./uploads")){
        fs.mkdirSync("./uploads");
    }

    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }

        fs.readFile(req.files.filename.path, function(err, data) {
            var fext = path.extname(req.files.filename.originalFilename);
            //var newPath = "./uploads/" + filepath + fext;
            var file_name = req.files.filename.originalFilename;
            var newPath = "./uploads/" + file_name;
            //var file_name = filepath + fext;

            fs.writeFile(newPath, data, function (err) {
                res.json({filename:file_name});
            });

        });
    })
}
exports.fileupload = function(req,res){
    console.log("upload function called");
    var filepath = req.body.fname;
    var nodename = req.body.nname;
    var itemname = req.body.iname;
    var newPath = '';
    var milliseconds = new Date().getTime();
    filepath = filepath + milliseconds;
    console.log("file path is =>" + filepath);
    console.log("node name is =>" + nodename);
    console.log("item name is =>" + itemname);
    var error = '';

    /* if the uploads directory does not exist create one*/
    /* node name is person check */
    if (!fs.existsSync("./uploads")){
        fs.mkdirSync("./uploads");
    }
    if(nodename == "PERSON"){
        var fname = itemname.split(" ")[0];
        var lname = itemname.split(" ")[1];
        var email = itemname.split(" ")[2];
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }
            fs.readFile(req.files.file.path, function(err, data) {
                var fext = path.extname(req.files.file.name);
                newPath = "./uploads/" + filepath + fext;
                var file_name = filepath + fext;
                fs.writeFile(newPath, data, function (err) {
                    console.log("Finished writing file..." + err);
                });
                /* insert the filepath to graph db */
                var query = ["MATCH (n:"+nodename+"{first_name:'"+fname+"',last_name:'"+lname+"',email:'"+email+"'}) set n.link='"+ file_name +"' RETURN n"].join('\n');
                session
                    .run(query)
                    .then(function(result){
                        var records = result.records;
                        var length = records.length;
                        if(length > 0){
                            error = null;
                            console.log("File is uploaded");
                            res.json({error_code:0,err_desc:error});
                        }
                        else{
                            console.log("nothing updated");
                            res.json({error_code:0,err_desc:error});
                        }
                        session.close();
                    });
            });
        })
    }
    else if(nodename == "Visualynk_Group"){
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }

            fs.readFile(req.files.file.path, function(err, data) {
                var fext = path.extname(req.files.file.name);
                newPath = "./uploads/" + filepath + fext;
                var file_name = filepath + fext;

                fs.writeFile(newPath, data, function (err) {
                    console.log("Finished writing file..." + err);
                    res.json({filename:file_name});
                });

            });
        })
    }
    else{
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }

            fs.readFile(req.files.file.path, function(err, data) {
                var fext = path.extname(req.files.file.name);
                newPath = "./uploads/" + filepath + fext;
                var file_name = filepath + fext;

                fs.writeFile(newPath, data, function (err) {
                    console.log("Finished writing file..." + err);
                });
                /* insert the filepath to graph db */
                var query = ["MATCH (n:"+nodename+"{name:'"+itemname+"'}) set n.link='"+ file_name +"' RETURN n"].join('\n');
                session
                    .run(query)
                    .then(function(result){
                        var records = result.records;
                        var length = records.length;
                        if(length > 0){
                            error = null;
                            console.log("File is uploaded");
                            res.json({error_code:0,err_desc:error});
                        }
                        else{
                            console.log("nothing updated");
                            res.json({error_code:0,err_desc:error});
                        }
                        session.close();
                    });
            });
        })
    }
}

exports.download = function(req,res){
    var filename = req.params.fname;
    console.log(util.inspect(req.params, {showHidden: false, depth: null}))
    console.log("file name => " + filename);
    var filepath = './uploads/'+ filename;
    console.log("downloading the " + filename);
    fs.stat(filepath, function(err,stat){
        if(err == null){
            console.log('File exists');
            res.download(filepath);
        }
        else if(err.code == 'ENOENT') {
            // file does not exist
            fs.writeFile('log.txt', 'Some log\n');
        } else {
            console.log('Some other error: ', err.code);
        }
    })

}

exports.getNodeGroups = function(req,res){
    var companyId = req.body.companyId;
    var userId = req.body.userId;
    console.log(userId)

    var result = {'msg':''};
    var error = '';

    if(userId != ""){
        var squery = "START n=node("+userId+") return n";

        session
            .run(squery)
            .then(function(results) {
                var records = results.records;

                if(records[0]._fields[0].properties.hasOwnProperty("restrictGroups"))
                    var userRestricts = JSON.parse(records[0]._fields[0].properties.restrictGroups)
                else
                    var userRestricts = [];

                if(userRestricts.length > 0){
                    if(companyId != "")
                        var query = ["match (n:NODEGROUPS) where NOT ID(n) IN ["+userRestricts.join(",")+"] AND n.companyId = '"+companyId+"' AND n.is_full_show = true return n"].join('\n');
                    else
                        var query = ["match (n:NODEGROUPS) WHERE NOT ID(n) IN ["+userRestricts.join(",")+"] AND n.is_full_show = true return n"].join('\n');
                }
                else {
                    if (companyId != "")
                        var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' AND n.is_full_show = true return n"].join('\n');
                    else
                        var query = ["match (n:NODEGROUPS) WHERE n.is_full_show = true return n"].join('\n');
                }
                session
                    .run(query)
                    .then(function(results) {
                        var records = results.records;
                        result.msg = "success";
                        result.data = records;
                        res.json({
                            responseData: result,
                            error: error
                        });
                        session.close()
                    })
                session.close()
            })
    } else {
        if (companyId != "")
            var query = ["match (n:NODEGROUPS) where n.companyId = '" + companyId + "' AND n.is_full_show = true return n"].join('\n');
        else
            var query = ["match (n:NODEGROUPS) WHERE n.is_full_show = true return n"].join('\n');

        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.data = records;
                res.json({
                    responseData: result,
                    error: error
                });
                session.close()
            })
    }
}
exports.getNodeGroup = function(req,res){
    var nodeId = req.params.nodeId;

    var result = {'msg':''};
    var error = '';

    var query = "START n=node("+nodeId+") return n";
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}

exports.signin = function(req, res, next) {
    //check user exist on the neo4j db
	passport.authenticate('login', function(err, user, info) {
        /*console.log(util.inspect(user, {showHidden: false, depth: null}))*/
		if (err || !user) {
			res.status(400).send(info);
		} else {
			// Remove sensitive data before login
			//user.password = undefined;
			//user.salt = undefined;
			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);
				} else {
                  // We are sending the profile inside the token
                  var token = jwt.sign(user, 'secret-anne', { expiresInMinutes: 20 });

                  res.json({ token: token });
				}
			});
		}
	})(req, res, next);
};

exports.login = function(req, res, next) {
    //check user exist on the neo4j db
    var username = req.body.username;
    var password = req.body.password;
    var user_nodes = null;
    var error = '';
    var result = {'msg':'You are invalid user!','token':'','userCompany':'','userType':''};
    console.log("message : user login checking... ");
    var query;
    query = ["match (n:USERS) where n.username = '"+username+"' or n.emailaddress = '"+username+"' return n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                user_nodes = records;
                results.records.forEach(function(record) {
                    console.log(record._fields[0]);
                    var user = record._fields[0].properties.username;
                    var emailaddress = record._fields[0].properties.emailaddress;
                    if(user != undefined){
                        if(user == username || emailaddress == username){
                            var pass = record._fields[0].properties.password;
                            if(password == pass){
                                var token = jwt.sign(user, 'secret-anne', { expiresInMinutes: 20 });
                                result.msg = "success";
                                result.token = token;
                                result.userCompany = record._fields[0].properties.userCompany;
                                result.userType = record._fields[0].properties.userType;
                                result.userGroup = record._fields[0].properties.userGroup;
                                result.crudPermissions = {
                                    "p_ng_c" : record._fields[0].properties.p_ng_c,
                                    "p_ng_r" : record._fields[0].properties.p_ng_r,
                                    "p_ng_u" : record._fields[0].properties.p_ng_u,
                                    "p_ng_d" : record._fields[0].properties.p_ng_d,
                                    "p_ne_c" : record._fields[0].properties.p_ne_c,
                                    "p_ne_r" : record._fields[0].properties.p_ne_r,
                                    "p_ne_u" : record._fields[0].properties.p_ne_u,
                                    "p_ne_d" : record._fields[0].properties.p_ne_d
                                };
                                result.userId = record._fields[0].identity.low;
                            }
                            else{
                                result.msg = "Your password is wrong!";
                                result.token = '';
                            }
                        }
                    }
                });
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        })
        .catch(function(error) {
            console.log(error);
        });

};

var cnt = 0;
exports.getQueryResult = function(req, res){
    var url = "http://localhost:7474/db/data/transaction/commit";
    //console.log(util.inspect(req.body, {showHidden: false, depth: null}));
    console.log(req.body);
    request({
        url: url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: req.body
    }, function(err, resp, body) {
        /*console.log(util.inspect(resp, {showHidden: false, depth: null}));*/
        //console.log(resp);
        
        if (!err && resp.statusCode == 200) {
            res.json(body);
        }

    });
};
exports.getPlanDan = function(req,res,next){
    var name = req.body.name;
    console.log("getting the planDan according to " + name + "...");

    var error = '';
    var result = {'msg':'empty'};
        var query = ["MATCH (FM:Facility_Management {name:'" + name + "'})-[INCLUDES_DATESET]->(n) RETURN n, labels(n)"].join('\n');
        session
            .run(query)
            .then(function(results){
                var records = results.records;
                var length = records.length;
                if(length > 0){
                    error = null;
                    result.msg = results;
                }
                res.json({
                    responseData: result,
                    error: error
                });
                session.close();
            });
}
/* FILTERS*/
exports.systemfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SYSTEM) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.attributefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ATTRIBUTE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.companyfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:COMPANY) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.facilityfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:FACILITY) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.floorfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:FLOOR) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.zonefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ZONE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.spacefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SPACE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.assetfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ASSET) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.componentfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:COMPONENT) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.assemblyfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:ASSEMBLY) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.connectionfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:CONNECTION) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.sparefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SPARE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.resourcefilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:RESOURCE) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.jobfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:JOB) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.sevicereqfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:SERVICE_REQUEST) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.docfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:DOCUMENT) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
exports.personfilter = function(req,res,next){
    var error = '';
    var result = {'msg':'empty'};
    var query;
    query = ["MATCH (n:PERSON) RETURN n"].join('\n');
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            if(length > 0){
                error = null;
                result.msg = results;
            }
            res.json({
                responseData: result,
                error: error
            });
            session.close();
        });
}
    /**/
exports.createNode = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    var node = req.body;
    //var retValue = '', error = '';
    neo4j.connect(neo4JUrl, function (errors, graph) {

        graph.createNode(node, function (err, n) {
            //if (err) {
            //    //error = (err);
            //} else {
            //    //retValue = (JSON.stringify(n));
            //}
            res.json({
                responseData: n,
                error: err
            });
        });
    });
};
exports.getCompanies = function(req, res, next) {
    var retValue = '';
    var companies = {};

    var query = ["match (n:COMPANIES) return n,id(n) as id"].join('\n');

    session
        .run(query)
        .then(function(results) {
            res.json({
                companies: results.records,
                error: ''
            });
            session.close();
        })

};
exports.getCompany = function(req, res) {
    var company_id = req.body.company_id;

    var query = ["START n=node("+company_id+") return n"].join('\n');

    session
        .run(query)
        .then(function(results) {
            res.json({
                company: results.records,
                error: ''
            });
            session.close();
        })
};
exports.addCompany = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Add Company called");
    var companyname = req.body.companyname;
    var description = req.body.description;
    var departments = req.body.departments;
    var role = req.body.role;
    var email = req.body.email;
    var phone = req.body.phone;
    var street = req.body.street;
    var postalbox = req.body.postalbox;
    var zipcode = req.body.zipcode;
    var citytown = req.body.citytown;
    var state = req.body.state;
    var country = req.body.country;
    var works_for = req.body.works_for;

    var error = '';
    var result = {};

    console.log("message : add company data... ");
    /* check username duplication check */

    var query;
    var query = "CREATE (n:COMPANIES {companyname:'"+companyname+"',description:'"+description+"',departments:'"+departments+"',role:'"+role+"',email:'"+email+"',phone:'"+phone+"', street:'"+street+"', postalbox:'"+postalbox+"', zipcode:'"+zipcode+"', citytown:'"+citytown+"', state:'"+state+"', country:'"+country+"', works_for:'"+works_for+"'}) return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};
exports.updateCompany = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Update Company called");
    var companyname = req.body.companyname;
    var description = req.body.description;
    var departments = req.body.departments;
    var role = req.body.role;
    var email = req.body.email;
    var phone = req.body.phone;
    var street = req.body.street;
    var postalbox = req.body.postalbox;
    var zipcode = req.body.zipcode;
    var citytown = req.body.citytown;
    var state = req.body.state;
    var country = req.body.country;
    var works_for = req.body.works_for;
    var company_id = req.body.company_id;

    var error = '';
    var result = {};

    var query;
    var query = "START n=node("+company_id+") SET n.companyname='"+companyname+"',n.description='"+description+"',n.departments='"+departments+"',n.role='"+role+"',n.email='"+email+"',n.phone='"+phone+"', n.street='"+street+"', n.postalbox='"+postalbox+"', n.zipcode='"+zipcode+"', n.citytown='"+citytown+"', n.state='"+state+"', n.country='"+country+"', n.works_for='"+works_for+"' return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};
exports.deleteCompany = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Delete Company called");
    var company_id = req.body.company_id;

    var error = '';
    var result = {};

    var query;
    var query = "START n=node("+company_id+") DELETE n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};

exports.getUsers = function(req, res, next) {
    var retValue = '';
    var companies = {};

    var query = ["match (n:USERS) return n,id(n) as id"].join('\n');

    var users = [];
    session
        .run(query)
        .then(function(results) {
            users.users = results.records;
            res.json({
                users: results.records,
                error: ''
            });
            session.close();
        })

};
exports.getUser = function(req, res) {
        var user_id = req.body.user_id;

        var query = ["START n=node("+user_id+") return n"].join('\n');

        session
            .run(query)
            .then(function(results) {
                res.json({
                    user: results.records,
                    error: ''
                });
                session.close();
            })
    };
exports.register = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("CreateNode Called");
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = req.body.password;
    var userEmail = req.body.userEmail;
    var userCompany = req.body.userCompany;
    var userGroup = req.body.userGroup;

    var error = '';
    var result = {};

    console.log("message : user duplication checking... ");
    /* check username duplication check */

    var query;
    query = ["match (n:USERS) where n.username = '"+username+"' or n.emailaddress='"+userEmail+"' return n"].join('\n');

    session
        .run(query)
        .then(function(results){
            var pass = 0;
            console.log("message : get all nods status ");
            console.log("message : all nods results as below ");
            console.log("counts : " + results.records.length);
            /*console.log(util.inspect(results, {showHidden: false, depth: null}));*/
            var records = results.records;
            var length = records.length;
            if(length > 0){
                results.records.forEach(function(record) {
                    var user = record._fields[0].properties.username;
                    var emailaddress = record._fields[0].properties.emailaddress;

                    if(user != undefined){
                        if (user == username || emailaddress == userEmail) {/* user exist */
                            result.msg = "The User is already taken!";
                            result.responseData = null;
                        }
                        else{
                            result.msg = "PassUser";
                            result.responseData = null;
                            pass = 1;
                        }
                    }
                })
            }
            else{
                pass = 1;
            }
            if(pass == 1){
                if(username == "admin")
                    var query = "CREATE (n:USERS {firstName:'"+firstName+"',lastName:'"+lastName+"',username:'"+username+"',password:'"+password+"',emailaddress:'"+userEmail+"',userCompany:'"+userCompany+"',userGroup:'"+userGroup+"', userType:'admin'}) return n";
                else
                    var query = "CREATE (n:USERS {firstName:'"+firstName+"',lastName:'"+lastName+"',username:'"+username+"',password:'"+password+"',emailaddress:'"+userEmail+"',userCompany:'"+userCompany+"',userGroup:'"+userGroup+"', userType:'user'}) return n";

                var is_created = false;
                var created_user_id = "";
                session
                    .run(query)
                    .then(function(results){
                        result.msg = "success";
                        result.responseData = results.records;
                        console.log("RESULT : " + result.msg);
                        is_created = true;
                        created_user_id = results.records[0]._fields[0].identity.low;

                        if(userCompany != undefined) {
                            var rquery = "START u=node(" + created_user_id + "), c=node(" + userCompany + ") CREATE (u)-[r:WORKS_AT{username:u.username, companyname:c.companyname}]->(c) return r";
                            session
                                .run(rquery)
                                .then(function (results) {
                                    res.json(result);
                                })
                        } else
                            res.json(result);

                    });
            }
            else{
                console.log("RESULT : " + result.msg);
                res.json(result);
            }
            session.close();
        })
        .catch(function(error) {
            console.log(error);
        });



};
exports.updateUser = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Update User called");
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var username = req.body.username;
    var password = req.body.password;
    var userEmail = req.body.userEmail;
    var userCompany = req.body.userCompany;
    var userGroup = req.body.userGroup;

    if(userCompany == undefined)
        userCompany = 0;

    var user_id = req.body.user_id;

    var error = '';
    var result = {};

    var query;
    query = ["match (n:USERS) where (n.username = '"+username+"' or n.emailaddress='"+userEmail+"') and ID(n)<>"+user_id+"  return n"].join('\n');

    session
        .run(query)
        .then(function(results) {
            var pass = 0;

            var records = results.records;
            var length = records.length;
            if (length > 0) {
                results.records.forEach(function (record) {
                    var user = record._fields[0].properties.username;
                    var emailaddress = record._fields[0].properties.emailaddress;

                    if (user != undefined) {
                        if (user == username || emailaddress == userEmail) {/* user exist */
                            result.msg = "The User is already taken!";
                            result.responseData = null;
                        }
                        else {
                            result.msg = "PassUser";
                            result.responseData = null;
                            pass = 1;
                        }
                    }
                })

                res.json(result);
            }
            else {
                pass = 1;
            }

            if (pass == 1) {

                var query;
                var query = [
                    "START n=node(" + user_id + ") MATCH (n)-[r:WORKS_AT]->(x) DELETE r",
                    "START n=node(" + user_id + ") SET n.firstName='" + firstName + "',n.lastName='" + lastName + "',n.username='" + username + "',n.password='" + password + "',n.emailaddress='" + userEmail + "',n.userCompany='" + userCompany + "',n.userGroup='"+userGroup+"'",
                    "START u=node(" + user_id + "), c=node(" + userCompany + ") CREATE (u)-[r:WORKS_AT{username:u.username, companyname:c.companyname}]->(c) return r"
                ];

                for(var i=0; i<query.length; i++) {
                    console.log(i);
                    session
                        .run(query[i])
                        .then(function (results) {
                            result.msg = "success";
                            result.responseData = results.records;

                            if( results.records.length > 0) {
                                res.json(result);
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                            result.msg = "error";
                            result.responseData = error;
                            res.json(result);
                        });
                }

            }

            session.close();
        })
    };
exports.updateUserPermission = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Update User Permission called");
    var permission_type = req.body.permission_type;
    var permission_value = req.body.permission_value;

    var user_id = req.body.user_id;

    var error = '';
    var result = {};

    var query;

        var query = "START n=node(" + user_id + ") SET n."+permission_type+"=" + permission_value;

    session
        .run(query)
        .then(function (results) {
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function (error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};
exports.deleteUser = function (req, res) {
    //JSON. stringify is only available in mordern browers.....
    console.log("Delete User called");
    var user_id = req.body.user_id;

    var error = '';
    var result = {};

    var query;
    var query = "START n=node("+user_id+") MATCH (n)-[r:WORKS_AT]->(x) DELETE r,n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
};

exports.updateUserGroupAssigns = function(req, res){
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query;
    var query = "MATCH (n:USERGROUPASSIGNS) DELETE n";

    session
        .run(query)
        .then(function(results){

            var squery = "CREATE (n:USERGROUPASSIGNS {assigns: '"+assigns+"'}) return n";
            session
                .run(squery)
                .then(function(results){

                    result.msg = "success";
                    result.responseData = results.records;
                    console.log("RESULT : " + result.msg);
                    res.json(result);

                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });

            session.close();
        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.getUserGroupAssigns = function(req, res){
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query;
    var query = "MATCH (n:USERGROUPASSIGNS) return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            console.log("RESULT : " + result.msg);
            res.json(result);

            session.close();

        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.getNeedApprovalAssigns = function(req, res){
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query;
    var query = "MATCH (n:NEEDAPPROVALASSIGNS) return n";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();

        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.updateNeedApprovalAssigns = function (req, res) {
    var assigns = req.body.assigns;

    var error = '';
    var result = {};

    var query = "MATCH (n:NEEDAPPROVALASSIGNS) DELETE n";

    session
        .run(query)
        .then(function(results){

            var squery = "CREATE (n:NEEDAPPROVALASSIGNS {assigns: '"+assigns+"'}) return n";
            session
                .run(squery)
                .then(function(results){
                    result.msg = "success";
                    result.responseData = results.records;

                    res.json(result);

                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });

            session.close();
        })
        .catch(function(error) {
            console.log('delete error')
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}

exports.createNodeGroup = function(req, res){
    var companyId = req.body.companyId;
    var ngLabel = req.body.label;
    var ngIcon = req.body.link;
    var ngProperties = req.body.properties;
    var creatorGroup = req.body.creatorGroup;
    var parentGroup = req.body.parentGroup;

    var error = '';
    var result = {};

    if(parentGroup != "")
        var query = "MERGE (ng:NODEGROUPS {name:'"+ngLabel+"', companyId:'"+companyId+"', icon:'"+ngIcon+"', properties:'"+ngProperties+"', creatorGroup:'"+creatorGroup+"', parentGroup:'"+parentGroup+"', is_full_show:false, need_create_approval:true}) return ng";
    else
        var query = "MERGE (ng:NODEGROUPS {name:'"+ngLabel+"', companyId:'"+companyId+"', icon:'"+ngIcon+"', properties:'"+ngProperties+"', creatorGroup:'"+creatorGroup+"', is_full_show:true}) return ng";

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();
}
exports.updateNodeGroup = function(req, res){
    var companyId = req.body.companyId;
    var ngLabel = req.body.label;
    var ngOrgLabel = req.body.orgLabel;
    var ngIcon = req.body.link;
    var nodeId = req.body.nodeId;
    var ngProperties = req.body.properties;
    var parentGroup = req.body.parentGroup;

    var error = '';
    var result = {};

    if(parentGroup != "") {
        var aquery = ["START n=node(" + nodeId + ") SET n.name='" + ngLabel + "', n.icon='" + ngIcon + "', n.properties='" + ngProperties + "', n.parentGroup = '" + parentGroup + "', n.is_full_show=false, n.need_update_approval=true", "WITH n MATCH (ng:" + ngOrgLabel + ") REMOVE ng:" + ngOrgLabel + " SET ng:" + ngLabel];
        aquery.push("WITH n MATCH (ng:"+ngLabel+")-[r]-(m:Visualynk) SET m.is_full_show=false RETURN n");
        var query = aquery.join('\n');
    }
    else {
        var aquery = ["START n=node(" + nodeId + ") SET n.name='" + ngLabel + "', n.icon='" + ngIcon + "', n.properties='" + ngProperties + "', n.is_full_show=true, n.need_update_approval=false", "WITH n MATCH (ng:" + ngOrgLabel + ") REMOVE ng:" + ngOrgLabel + " SET ng:" + ngLabel];
        aquery.push("WITH n MATCH (ng:"+ngLabel+")-[r]-(m:Visualynk) SET m.is_full_show=false RETURN n");
        var query = aquery.join('\n');
    }

    session
        .run(query)
        .then(function(results){

            result.msg = "success";
            result.responseData = results.records;
            res.json(result);
            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();

}
exports.deleteNodeGroup = function (req, res) {
    var nodeId = req.body.nodeId;
    var label = req.body.ngLabel;
    var parentGroup = req.body.parentGroup;

    var error = '';
    var result = {};

    //var query = "MATCH (n:"+label+")-[r]-(m:Visualynk) delete r,n,m";
    var aquery = [];
    aquery.push("START ng=node(" + nodeId + ") SET ng.need_delete_approval = true, ng.is_full_show = false, ng.parentGroup='" + parentGroup + "'");
    aquery.push("WITH ng MATCH (n:"+label+")-[r]-(m:Visualynk) SET m.is_full_show=false return ng");
    var query = aquery.join('\n');
console.log(query)
    session
        .run(query)
        .then(function(results){

            /*var squery = "START n=node("+nodeId+") DELETE n";
            session
                .run(squery)
                .then(function(results){*/
                    result.msg = "success";
                    result.responseData = results.records;
                    res.json(result);
                /*})
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });*/

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

}
exports.updateNGPendingApprovals = function (req, res) {
    var reqType = req.body.reqType;
    var parentGroup = req.body.parentGroup;
    var nodeId = req.body.nodeId;
    var ngLabel = req.body.ngLabel;

    var result = {'msg':''};
    var error = '';

    var query = "";

    if(reqType == "ng_create") {
        if(parentGroup == "")
            var query = "START n=node(" + nodeId + ") SET n.need_create_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
        else
            var query = "START n=node(" + nodeId + ") SET n.need_create_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ng_update") {
        if(parentGroup == "")
            var query = "START n=node(" + nodeId + ") SET n.need_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
        else
            var query = "START n=node(" + nodeId + ") SET n.need_update_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ng_delete"){
        if(parentGroup == "") {

            var dquery = "MATCH (n:" + ngLabel + ")-[r]-(m:Visualynk) delete r,n,m";

            session
                .run(dquery)
                .then(function (results) {

                    var squery = "START n=node(" + nodeId + ") DELETE n";
                    session
                        .run(squery)
                        .then(function (results) {
                            result.msg = "success";
                            result.responseData = results.records;
                            res.json(result);
                        })
                        .catch(function (error) {
                            console.log(error);
                            result.msg = "error";
                            result.responseData = error;
                            res.json(result);
                        });

                    session.close();
                })
                .catch(function (error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });
        } else {
            var query = "START n=node(" + nodeId + ") SET n.need_delete_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' return n";
        }
    }
    else if(reqType == "ne_create"){
        if(parentGroup == "") {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_create_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
            var query = queries.join('\n');
        }
        else {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_create_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
            var query = queries.join('\n');
        }
    }
    else if(reqType == "ne_update"){
        if(parentGroup == "") {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
            var query = queries.join('\n');
        }
        else {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_update_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
            var query = queries.join('\n');
        }
    } else if(reqType == "ne_delete"){
        if(parentGroup == ""){
            var query = "MATCH (n)-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m";
            session
                .run(query)
                .then(function(results){
                    result.msg = "success";
                    result.responseData = results.records;
                    res.json(result);

                    session.close();
                })
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });
        } else {
            var queries = [];
            queries.push("START n=node(" + nodeId + ") SET n.need_ne_delete_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
            queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
            var query = queries.join('\n');
        }
    }


    if(query != "") {
        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.responseData = records;
                res.json(result);
                session.close()
            })
            .catch(function (error) {
                console.log(error);
                result.msg = "error";
                result.responseData = error;
                res.json(result);
            });
    } else {
        result.msg = "error";
        result.responseData = "No approval types";
        res.json(result);
    }
}
exports.cancelNGPendingApprovals = function (req, res) {
    var reqType = req.body.reqType;
    var parentGroup = req.body.parentGroup;
    var nodeId = req.body.nodeId;
    var ngLabel = req.body.ngLabel;

    var result = {'msg':''};
    var error = '';

    var query = "";

    if(reqType == "ng_create") {
        var query = "START n=node(" + nodeId + ") DELETE n";
    }
    else if(reqType == "ng_update") {
        var query = "START n=node(" + nodeId + ") SET n.need_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ng_delete"){
        var query = "START n=node(" + nodeId + ") SET n.need_delete_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' return n";
    }
    else if(reqType == "ne_create"){
/*
        var queries = [];
        queries.push("START n=node(" + nodeId + ") SET n.need_ne_create_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
        var query = queries.join('\n');
*/

        var query = "MATCH (n)-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m"
    }
    else if(reqType == "ne_update"){
        var queries = [];
        queries.push("START n=node(" + nodeId + ") SET n.need_ne_update_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n");
        var query = queries.join('\n');
    } else if(reqType == "ne_delete"){
        var queries = [];
        queries.push("START n=node(" + nodeId + ") SET n.need_ne_delete_approval = false, n.is_full_show = true, n.parentGroup='" + parentGroup + "' ");
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n")
        var query = queries.join('\n');

        //var query = "MATCH (n)-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m"
    }


    if(query != "") {
        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.responseData = records;
                res.json(result);
                session.close()
            })
            .catch(function (error) {
                console.log(error);
                result.msg = "error";
                result.responseData = error;
                res.json(result);
            });
    } else {
        result.msg = "error";
        result.responseData = "No approval types";
        res.json(result);
    }
}

exports.createNodeEntity = function(req, res){
    var neProperties = JSON.parse(req.body.ne_properties);
    var nePropertiesVal = JSON.parse(req.body.ne_properties_val);
    var ngLabel = req.body.ng_name;
    var neLabel = req.body.ne_name;
    var companyId = req.body.companyId;
    var creatorGroup = req.body.creatorGroup;
    var parentGroup = req.body.parentGroup;

    //var vi_label = ngLabel + ":" + neLabel;
    var vi_label = neLabel;

    var error = '';
    var result = {};

    if(parentGroup != "") {
        var query = "MERGE (ng:" + ngLabel + " {`name`:'" + neLabel + "', `companyId`:'" + companyId + "', `is_full_show`:false, `need_ne_create_approval`:true, `creatorGroup`:'" + creatorGroup + "', `parentGroup`:'" + parentGroup + "', ";
        neProperties.forEach(function (ele, ind) {
            query += "`" + ele + "`:'" + nePropertiesVal[ind] + "',";
        })
        query = query.substring(0, query.length - 1);
        query += "}) ";
    } else {
        var query = "MERGE (ng:" + ngLabel + " {`name`:'" + neLabel + "', `companyId`:'" + companyId + "', `is_full_show`:true, `need_ne_create_approval`:false, `creatorGroup`:'" + creatorGroup + "', `parentGroup`:'" + parentGroup + "', ";
        neProperties.forEach(function (ele, ind) {
            query += "`" + ele + "`:'" + nePropertiesVal[ind] + "',";
        })
        query = query.substring(0, query.length - 1);
        query += "}) ";
    }

    var queries = [];
    queries.push(query);

    if(parentGroup != "")
        queries.push("MERGE (vi:Visualynk {name:'"+vi_label+"', companyId:'"+companyId+"', `is_full_show`:false}) ");
    else
        queries.push("MERGE (vi:Visualynk {name:'"+vi_label+"', companyId:'"+companyId+"', `is_full_show`:true}) ");

    queries.push("MERGE (ng)-[:CATEGORIZED_IN]->(vi) ");
    queries.push("MERGE (vi)-[:INCLUDES_DATASET]->(ng) return ng");

    query = queries.join('\n');

    session
        .run(query)
        .then(function(results){
            console.log(JSON.stringify(results.records))
            var created_ne_id = results.records[0]._fields[0].identity.low;
            created_ne_id += "_"+ngLabel;
            var squery = "MERGE (vi:Visualynk {name:'"+created_ne_id+"'}) return n";

            /*session
                .run(squery)
                .then(function(results){*/
                    result.msg = "success";
                    result.responseData = results.records;
                    res.json(result);

                    session.close();
                /*})
                .catch(function(error) {
                    console.log(error);
                    result.msg = "error";
                    result.responseData = error;
                    res.json(result);
                });

            session.close();*/
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

    session.close();
}
exports.updateNodeEntity = function(req, res){
    var nodeId = req.body.ne_id;
    var neProperties = JSON.parse(req.body.ne_properties);
    var nePropertiesVal = JSON.parse(req.body.ne_properties_val);
    var neLabel = req.body.ne_name;
    var parentGroup = req.body.parentGroup;

    var error = '';
    var result = {};

    if(parentGroup != "") {
        var queries = [];
        var query = "START n=node(" + nodeId + ") SET n.name='" + neLabel + "', n.is_full_show=false, n.need_ne_update_approval=true, n.parentGroup='"+parentGroup+"', ";
        neProperties.forEach(function (ele, ind) {
            if(ele != "is_full_show" && ele != "need_ne_update_approval" && ele != "parentGroup" && ele != "need_ne_create_approval" && ele != "need_ne_delete_approval" && ele != "companyId" && ele != "creatorGroup")
                query += "n." + ele + "='" + nePropertiesVal[ind] + "',";
        })
        query = query.substring(0, query.length - 1);
        //query += "return n";
        queries.push(query);
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
        query = queries.join('\n');
    } else {
        var queries = [];
        var query = "START n=node(" + nodeId + ") SET n.name='" + neLabel + "', n.is_full_show=true, n.need_ne_update_approval=false, n.parentGroup='"+parentGroup+"', ";
        neProperties.forEach(function (ele, ind) {
            query += "n." + ele + "='" + nePropertiesVal[ind] + "',";
        })
        query = query.substring(0, query.length - 1);
        //query += "return n";
        queries.push(query);
        queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=true return n")
        query = queries.join('\n');
    }

    session
        .run(query)
        .then(function(results){
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

}
exports.deleteNodeEntity = function (req, res) {
    var nodeId = req.body.nodeId;
    var ngLabel = req.body.ngLabel;
    var parentGroup = req.body.parentGroup;

    var error = '';
    var result = {};

    //var query = "MATCH (n:"+ngLabel+")-[r]-(m:Visualynk) where id(n)="+nodeId+" delete r,n,m";
    var queries = [];
    queries.push("START n=node(" + nodeId + ") SET n.need_ne_delete_approval = true, n.is_full_show = false, n.parentGroup='" + parentGroup + "' ");
    queries.push("WITH n MATCH (ng)-[r]-(m:Visualynk) where id(ng)="+nodeId+" SET m.is_full_show=false return n")
    var query = queries.join('\n');

    session
        .run(query)
        .then(function(results){
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });

}
exports.getNodeEntityRelations = function (req, res) {
    var nodeId = req.params.nodeId;

    var result = {'msg':''};
    var error = '';

    var query = "START n=node("+nodeId+") MATCH (n)-[r]-(x) return startnode(r) as starter, endnode(r) as ender, type(r) as relationName, id(r) as relationID";
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}
exports.getNewRelationEnders = function (req, res) {
    var nodeId = req.body.nodeId;
    var companyId = req.body.companyId;

    var error = '';
    var result = {};

    if(companyId != "")
        var query = "MATCH (n:Visualynk {companyId:'"+companyId+"'})-[r]-(x) WHERE ID(x)<>"+nodeId+" RETURN DISTINCT(ID(x)) as id,x";
    else
        var query = "MATCH (n:Visualynk)-[r]-(x) WHERE n.companyId IS NULL AND ID(x)<>"+nodeId+" RETURN DISTINCT(ID(x)) as id,x";

    console.log(query)
    session
        .run(query)
        .then(function(results){
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.createNewNERelationship = function (req, res) {
    var startNodeId = req.body.startId;
    var endNodeId = req.body.enderId;
    var relationshipName = req.body.relationName;
    var direction = req.body.direction;

    var result = {'msg':''};
    var error = '';

    var query = ['START n=node(' + startNodeId + '), m=node(' + endNodeId + ')'];

    if(direction == "->")
        query.push('CREATE UNIQUE (n)-[:' + relationshipName + ']->(m) return n');
    else
        query.push('CREATE UNIQUE (n)<-[:' + relationshipName + ']-(m) return n');

    query = query.join('\n');
    console.log(query)
    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}
exports.deleteNodeEntityRelations = function (req, res) {
    var relationId = req.params.relationId;

    var result = {'msg':''};
    var error = '';

    var query = "start r=rel("+relationId+") delete r";

    session
        .run(query)
        .then(function(results) {
            var records = results.records;
            result.msg = "success";
            result.data = records;
            res.json({
                responseData: result,
                error: error
            });
            session.close()
        })
}

exports.getWaitingApprovals = function (req, res) {
    var reqType = req.body.reqType;
    var parentGroup = req.body.userGroup;

    var result = {'msg':''};
    var error = '';

    var query = "";

    if(reqType == "ng_create")
        var query = "MATCH (n:NODEGROUPS) WHERE n.need_create_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ng_update")
        var query = "MATCH (n:NODEGROUPS) WHERE n.need_update_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ng_delete")
        var query = "MATCH (n:NODEGROUPS) WHERE n.need_delete_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ne_create")
        var query = "MATCH (n) WHERE n.need_ne_create_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ne_update")
        var query = "MATCH (n) WHERE n.need_ne_update_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";
    else if(reqType == "ne_delete")
        var query = "MATCH (n) WHERE n.need_ne_delete_approval = true AND n.is_full_show = false AND n.parentGroup='"+parentGroup+"' return n";

    if(query != "") {
        session
            .run(query)
            .then(function (results) {
                var records = results.records;
                result.msg = "success";
                result.responseData = records;
                res.json(result);
                session.close()
            })
            .catch(function (error) {
                console.log(error);
                result.msg = "error";
                result.responseData = error;
                res.json(result);
            });
    } else {
        result.msg = "error";
        result.responseData = "No approval types";
        res.json(result);
    }
}
exports.saveUserVisibility = function (req, res) {
    var userId = req.body.userId;
    var restrictGroups = req.body.restrictGroups;

    var error = '';
    var result = {};

    var query = ["START n=node("+userId+") SET n.restrictGroups = '"+restrictGroups+"' return n"].join('\n');

    var users = [];
    session
        .run(query)
        .then(function(results) {
            users.users = results.records;
            res.json({
                users: results.records,
                error: ''
            });
            session.close();
        })
}
exports.saveTDModel = function (req, res){
    var companyId = req.body.companyId;
    var filename = req.body.filename;

    var error = '';
    var result = {};

    var query = "MERGE (n:TDMODELS {`companyId`:'"+companyId+"', `filename`:'"+filename+"'}) return n";

    session
        .run(query)
        .then(function(results) {
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}
exports.getTDModels = function (req, res) {
    var companyId = req.body.companyId;
    var filename = req.body.filename;

    var error = '';
    var result = {};

    if(companyId != "")
        var query = "MERGE (n:TDMODELS) WHERE n.companyId='"+companyId+"' return n";
    else
        var query = "MERGE (n:TDMODELS) return n";

    session
        .run(query)
        .then(function(results) {
            result.msg = "success";
            result.responseData = results.records;
            res.json(result);

            session.close();
        })
        .catch(function(error) {
            console.log(error);
            result.msg = "error";
            result.responseData = error;
            res.json(result);
        });
}

exports.getNode = function(req, res) {
    var retValue = '';
    var nodeId = req.body.nodeId;
    neo4j.connect(neo4JUrl, function(errors, graph) {
        if (err) {
            retValue = err;
            return;
        }

        graph.getNode(nodeId, function(err, result) {
            retValue = result;
        });
        res.json({
            responseDate: retValue
        });
    });


};
exports.sendMail = function(req, res){
    var data = req.body;

    var text =  data.contactName + " has sent you message...\n\n";
    text += "the message is follow as below.\n\n";
    text += data.contactMsg + "\n";
    text += "please contact to us"  + "\n";
    text += "Phone Number : " +  data.contactPhone + "\n";
    text += "E-mail : " + data.contactEmail + "\n";
    text += "Company Name : " + data.contactCompany + "\n";
    transporter.sendMail({
        from : data.contactEmail,
        to : "admin@visualynk.com",
        subject : "Message from " + data.contactName,
        text : text
    },function(error, response){
        if(error){
            console.log(error);
            res.json({result:"fail",msg:error});
        }
        else{
            console.log('Message sent');
            res.json({result:"success",msg:''});
        }
    });


}
exports.updateNode = function (req, res) {
    var nodeId = req.body.nodeId;
    var newNodeValues = req.body.node;
    var retValue = '';
   
    neo4j.connect(neo4JUrl, function (errors, graph) {

         async.series({
            one: function (callback) {
                graph.getNode(nodeId, function (err, result) {
                    if (err) {
                        callback(err, result);
                    }
                    else {
                        node = result;
                        callback(null, result);
                    }
                });
            },
            two: function (callback) {
                node.replaceAllProperties(newNodeValues, function(err, n) {
                    if (err) {
                        retValue = (err);
                        callback(err, n);
                    } else {
                        retValue = (JSON.stringify(n));
                        callback(null, n);
                    }

                });
            }
        },
        function (err, results) {
            // results is now equal to: {one: 1, two: 2}
            res.json({
                responseData:  {
                    level: results.level,
                    price: results.price,
                    name: results.name,
                    description: results.description,
                    id:nodeId
                }
            });
        });

        
    });

};

exports.deleteNode = function (req, res) {

    var nodeId = req.body.nodeId;
    var retValue = '';

    neo4j.connect(neo4JUrl, function (errors, graph) {
        // find out if the node has any active relationships.
        // if it does, delete relationship first and then delete node.
        var query = [
            'START n=node(' + nodeId + ' ) ',
            'MATCH n-[r]-()  ',
            'DELETE r'
        ].join('\n');


        async.series({
            one: function (callback) {
                graph.query(query, null, function (err, results) {
                    if (err) {
                        callback(err, results);
                    }
                    else {
                        callback(null, results);
                    }
                });
            },
            two: function (callback) {
                graph.deleteNode(nodeId, function (err, n) {
                    if (err) {
                        retValue = (err);
                        callback(err, n);
                    } else {
                        retValue = n;
                        callback(null, n);
                    }
                });
            }
        },
        function (err, results) {
            // results is now equal to: {one: 1, two: 2}
            res.json({
                responseData: null
        });
        });



    });


};
exports.runAdhocQuery = function (req, res) {
    var retValue = '', error = undefined;
    var query = req.body.query;
    session
        .run(query)
        .then(function(results){
            var records = results.records;
            var length = records.length;
            retValue = results;
            res.json({
                responseData: retValue,
                error: error
            });
            session.close();
        });

};

exports.runQuery = function(query, callback) {

    neo4j.connect(neo4JUrl, function (err, graph) {
        if (err)
            callback(err, null);

        graph.query(query, null, function (error, results) {
            if (error) {
                callback(error, null);
            }
            else {
                callback(null, results);
            }
            
        });

    });

};

exports.runParallelQueries = function(req, res) {

    var queries = req.body.queries;

    async.map(queries, exports.runQuery, function(err, result) {

        res.json({
            responseData: result,
            error: err
        });
    });

};


exports.createRelationship = function (req, res) {
    var startNodeId = req.body.startNodeId;
    var endNodeId = req.body.endNodeId;
    var relationshipName = req.body.relationshipName;
    var retValue = '';

    neo4j.connect(neo4JUrl, function (err, graph) {
        if (err)
            throw err;
        var query = [
            'START n=node(' + startNodeId + '), m=node(' + endNodeId + ')',
            'CREATE UNIQUE (n)-[:' + relationshipName + ']->(m)'
        ].join('\n');

        graph.query(query, null, function (error, results) {
            if (error) {
                retValue = err;
            }
            else {
                retValue = results;
            }
            res.json({
                responseData: retValue
            });
        });

    });


};
exports.deleteRelationship = function (req, res) {
    var realtionshipId = req.body.realtionshipId;
    var retValue = '';
    neo4j.connect(neo4JUrl, function (err, graph) {
        if (err)
            throw err;

        graph.deleteRelationship(realtionshipId, function (error, results) {
            if (error) {
                retValue = error;
            } else {
                retValue = results;
            }
            res.json({
                responseData: retValue
            });
        });
    });


};

/*exports.getAllNodes = function(req, res) {

     var retValue;

    neo4j.connect(neo4JUrl, function(err, graph) {
        if (err)
            throw err;
        var query;
       
            query = [
                     'MATCH (n)  ',
                     'WHERE n.tag=\'drugs\'',
                     'RETURN n'
                        ].join('\n');
        graph.query(query, null, function(err, results) {
            if (err) {
                retValue = err;
            } else {
                retValue = results;
            }

            res.json({
                responseData: retValue
            });
        });
    });

};*/
    exports.getAllNodes = function(req, res) {

        var retValue;
        var query;

        query = [
            'MATCH (n)  ',
            'WHERE n.tag=\'drugs\'',
            'RETURN n'
        ].join('\n');
        session
            .run(query)
            .then(function(results){
                var records = results.records;
                var length = records.length;
                if(length > 0){
                    retValue = results;
                }
                res.json({
                    responseData: retValue
                });
                session.close();
            });
    };

