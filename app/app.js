if (Meteor.isClient) {
    
    Session.setDefault('counter', 0);
    
    Template.hello.helpers({
	counter: function () {
	    return Session.get('counter');
	}
    });

    Template.hello.events({
	'click button': function () {
	    // increment the counter when button is clicked
	    Session.set('counter', Session.get('counter') + 1);
	}
    });

    // --- slingshot
    

    Template.SH_Upload.events({
	'click button': function (e,f) {
	    console.log(e,f);

	    var uploader = new Slingshot.Upload("PostFileUploads", {tname:f.data.name, xuya:78});
	    var filename = document.getElementById('input').files[0];

	    uploader.send(filename, function (error, downloadUrl) {
		//Meteor.users.update(Meteor.userId(), {$push: {"profile.files": downloadUrl}});
	    });
	}
    });


    Template.progressBar.helpers({
	progress: function () {
	    return Math.round(this.uploader.progress() * 100);
	}
    });

}


Slingshot.fileRestrictions("PostFileUploads", {
    allowedFileTypes: null, //["image/png", "image/jpeg", "image/gif"],
    maxSize: 10 * 1024 * 1024 * 1024 // 10 MB (use null for unlimited)
});



if (Meteor.isServer) {


    PostFile = {

	tablename : "TableName",
	skey      : "SecretKey",
	
	directiveMatch: {
	    bucketUrl: Match.OneOf(String, Function),	    	    
	    TableName: String,
	    SecretKey: String,
	    
	    key: Match.OneOf(String, Function),
	    
	    expire: Match.Where(function (expire) {
		check(expire, Number);	    
		return expire > 0;
	    }),
	    
	    cacheControl: Match.Optional(String),
	    contentDisposition: Match.Optional(Match.OneOf(String, null))
	},
	
	directiveDefault: { 
	    expire: 5 * 60 * 1000, //in 5 minutes
	    bucketUrl: "http://127.0.0.1:8000",
	    cacheControl: "No-cache"
	},
	
	
	/**
	 *
	 * @param {{userId: String}} method
	 * @param {Directive} directive
	 * @param {FileInfo} file
	 * @param {Object} [meta]
	 *
	 * @returns {UploadInstructions}
	 */
	
	upload: function (method, directive, file, meta) {
	    console.log ("UPL",meta);
	    var url = Npm.require("url"),

	    nonse = (new Date).getTime().toString() +','+ Random.secret(),
	    sign = hmac256(directive.SecretKey,nonse,"hex"),
	    
            policy = new Slingshot.StoragePolicy()
		.expireIn(directive.expire)
		.contentLength(0, Math.min(file.size, directive.maxSize || Infinity)),
	    
            payload = {
		key: _.isFunction(directive.key) ?
		    directive.key.call(method, file, meta) : directive.key,		
		"Content-Type": file.type,
		"Cache-Control"  : directive.cacheControl,
		"Content-Disposition": directive.contentDisposition || file.name &&
		    "inline; filename=" + quoteString(file.name, '"')
            },
	    
            url = _.isFunction(directive.bucketUrl) ?
		directive.bucketUrl(meta) :
		directive.bucketUrl;
	    
	    console.log(payload, url, directive.contentDisposition);

	    ret = {
		upload: url,
		download: url,
		postData: [
		    { name: "upload-validfrom", value: nonse},
		    { name: "upload-signature", value:sign}
		]

	    };

	    return ret
	}
    }
    
    /** Generate a AWS Signature Version 4
     *
     * @param {String} policy - Base64 encoded policy to sign.
     * @param {String} secretKey - AWSSecretAccessKey
     * @param {String} date - Signature date (yyyymmdd)
     * @param {String} region - AWS Data-Center region
     * @param {String} service - type of service to use
     * @returns {String} hex encoded HMAC-256 signature
     */
    
    
    function quoteString(string, quotes) {
	return quotes + string.replace(quotes, '\\' + quotes) + quotes;
    }
    
    function formatNumber(num, digits) {
	var string = String(num);	
	return Array(digits - string.length + 1).join("0").concat(string);
    }
    
    var crypto = Npm.require("crypto");
    
    function hmac256(key, data, encoding) {
	/* global Buffer: false */
	return crypto
	    .createHmac("sha256", key)
	    .update(new Buffer(data, "utf-8"))
	    .digest(encoding);
    }
    
    
    Slingshot.createDirective("PostFileUploads", PostFile, {
	TableName: "bbbaaa",
	SecretKey: "my little red car",
	allowedFileTypes: null,
	maxSize: 10*1024*1024*1024,
	
	authorize: function (file,meta) {
	    console.log("AUTH",file,meta);
	    //Deny uploads if user is not logged in.
	    if (!this.userId) {
		var message = "Please login before posting files";
		throw new Meteor.Error("Login Required", message);
	    }
	    
	    return true;
	},
	
	key: function (file,meta) {
	    //Store file into a directory by the user's username.
	    var user = Meteor.users.findOne(this.userId);
	    console.log("KEY",file,meta);
	    return user.username + "/" + file.name;
	}
    });
    
    Meteor.startup(function () {
	// code to run on server at startup
    });
}
