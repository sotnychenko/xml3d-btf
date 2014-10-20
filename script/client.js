	var iterComp;
	var texName;
	var numComp;
	var mainStream;
	var client; 

$(window).bind("load", function() {
 
    // Connect to Binary.js server
    client= new BinaryClient('ws://calm-reaches-6633.herokuapp.com'+'/path');
    // var client = new BinaryClient('ws://localhost:5000');

	 client.on('open', function(){
	 console.log("Connected to the  server!");
	 var file;
	 iterComp = document.getElementById("iterCompId");
     texName =  document.getElementById("texNameId").name; 
	 endStream = false;
	 var texData = new Uint8Array(3);
	 for(var i =0; i<texData.length; i++) texData[i]=128;
	     document.getElementById("texDataId").setScriptValue(texData);
	
     client.send(file,{name: texName, numComp: 'R' }); 
    });
	
    // Received new stream from server!
    client.on('stream', function(stream, meta){  
	mainStream	= stream;
   	console.log("Received new stream from server!");
		var progressbar = $('#progressbar'),
		max = progressbar.attr('max'),
		value = progressbar.val();

	
	if(iterComp.value[0]==-1){
    //init
	document.getElementById("LSizeId").textContent = meta.texSize;
	document.getElementById("RSizeId").textContent = meta.RSize;
	document.getElementById("texSizeId").textContent = meta.texSize;
	document.getElementById("imageSizeId").textContent = meta.imageSize;
	document.getElementById("numCompId").textContent = meta.numComp;
	document.getElementById("numCompBufferId").textContent = meta.numComp;
	document.getElementById("blockSizeId").textContent = meta.blockSize;
	document.getElementById("numDirectionsId").textContent = meta.numDirections;
	numComp = document.getElementById("numCompId").value[0];
	console.log("number of components: " + meta.numComp);
     }
	   value = Math.floor(((iterComp.value[0]+1)/(numComp+1))*100);
	 
	   progressbar.val(value);		        
       $('.progress-value').html(value + '%');
	
      // Buffer for parts
      var parts = [];
 
      stream.on('data', function(data){
               parts.push(data);	
      });
	 
       stream.on('end', function(){    
		console.log('all parts arrived');
       if(iterComp.value[0]==numComp-1)
	   {
	   progressbar.val(100);		        
       $('.progress-value').html(100 + '%');
	   }
	 
	    var file;	
		
		var curComp =iterComp.value[0];
		if(curComp==-1){	
		document.getElementById("iterCompId").textContent = '0';
	    document.getElementById("texRId").src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));		
		}
		else{
		var reader = new FileReader();
        reader.readAsArrayBuffer(new Blob(parts));
        reader.onload = function(event){
	    var bytes = event.target.result;
	    var pngReader = new PNGReader(bytes);
	      pngReader.parse(function(err, png){
		  if (err) throw err;
		//console.log('image is <' + png.width + ',' + png.height +'>');
		document.getElementById("imageBufferId").setScriptValue(png.pixels);
		 });
		 
       };  
	   }  
       if(curComp<numComp-1) client.send(file,{name: texName, numComp: curComp+1 }); 

      });
	  
	   });
	   
});