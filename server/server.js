var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');

// Start Binary.js server
var server = BinaryServer({port: process.env.PORT || 5000});
// Wait for new user connections
server.on('connection', function(client){

  console.log('connected client'); 

client.on('stream', function(stream, meta){
console.log('new request received');
console.log(meta.name);
console.log(meta.numComp);
 var file = fs.createReadStream(__dirname + '/SplitVersions/'+meta.name+'/'+meta.numComp+'.png');
 var info = (JSON.parse(fs.readFileSync(__dirname + '/SplitVersions/'+meta.name+'/meta.json', "utf8")));

 client.send(file,info); 
});
 
});