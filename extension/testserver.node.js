


var port=8000;

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var ext = /[\w\d_-]+\.[\w\d]+$/;
var util = require("util");


//todo move this all to a wrapFs module

var functionExists = function(f) {
    return (typeof f === 'function');
};

var isEmptyObject = function(o) {
    return ( Object.keys(o).length == 0 );
};

var noFsCheck = function(typeOfCheck) {
    if (!isEmptyObject(fs)) return;
    if (typeOfCheck != 'fatal') return;

    console.log("err:empty fs obj!!");
    process.exit(-4762);
};
noFsCheck('fatal');

//this is dumb dumb dumb should be a utility module or something
var fsExists = (function() {
    if ( functionExists( fs.exists ) ) 
	return fs.exists;
    if ( functionExists( fs.access ) )
	return function(filePath,callback) {
	    fs.access(  filePath, fs.R_OK,  function(err){ callback(!err); }  ); 
	};


    return function(filePath,callback) {
	debugger;
	fs.open(filePath, 'r', function(err, fd) {
	    if (err) {
		callback(false);
	    } else {
		callback(true);
	    }
	});

    }
    
})();





		 

Object.prototype.startsWith = function (sought) {
    return (this.substr(0,sought.length)==sought);
}


Object.prototype.endsWith = function (sought) {
    return (this.substr(this.length-sought.length)==sought);
}



Object.prototype.removeStart = function (start) {
    return (this+"").substr(start.length);
}


Object.prototype.contains = function (sought) {
    return ( (this+"").indexOf(""+sought) >= 0 );
}


var dump=util.inspect;



function getContentType(someFile) {
    someFile = ""+someFile;
    if (someFile.endsWith('.html')) return  'text/html';
    if (someFile.endsWith('.htm' )) return 'text/html';
    if (someFile.endsWith('.js'  )) return 'script/javascript';
    if (someFile.endsWith('.svg' )) return 'image/svg+xml';
	return 'text/plain';
}


function getFilePath(relPath) {
    return "."+relPath;
}

	

function writeNormalHead(res)  {   //response; 
    res.writeHead(200, {'Content-Type': 'application/json'});
}




function doStaticBase(filePath, res) {
    fsExists(filePath, function (exists) {
	if (exists) {
	    console.log("found:"+filePath);
	    res.writeHead(200, {'Content-Type': getContentType(filePath)});
            fs.createReadStream(filePath).pipe(res);
        } else {
	    console.log("lost:"+filePath);
            res.writeHead(404, {'Content-Type': 'text/html'});
	    res.end("404 error:"+filePath);
        }
    });
}


function doStatic(req,res) {

    if (!ext.test(req.url))  {
	res.end("err257a");
	return;
    }

    var filePath = path.join(__dirname, req.url);
    return doStaticBase(filePath,res);
}



function mainHandler (req, res) {

    var path=""+req.url;

    return doStatic(req,res);
}
//    } else {
//	console.log("err320:"+req.connection.remoteAddress+" "+path);  //these tend to become static redir

	// res.writeHead(200, {'Content-Type': 'text/plain'});
	// res.end('Hello World---base\n');
	// return;
//    }





/*
 from letsEncrypt.... 
   All generated keys and issued certificates can be found in
      /etc/letsencrypt/live/$domain
   Rather than copying, please point your (web) server 
   configuration directly to those files (or create symlinks).
   During the renewal, 
      /etc/letsencrypt/live is updated with the latest necessary files.
*/



http.createServer(mainHandler).listen(port);  //http
console.log('started http:');


// var keyPath   = '/etc/letsencrypt/live/ayvexllc.com/privkey.pem';
// var chainPath = '/etc/letsencrypt/live/ayvexllc.com/fullchain.pem';

// try {
//     const tlsOptions = {
// 	key:  fs.readFileSync(keyPath),
// 	cert: fs.readFileSync(chainPath)
//     };
//     https.createServer(tlsOptions,mainHandler).listen(443);  //https
//     console.log('started httpSSS');
// } catch (ex) {
//     console.log('SKIPPING https-->'+ex);
// }  




