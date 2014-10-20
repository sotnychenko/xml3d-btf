Xflow.registerOperator("xflow.createTexture", {
    outputs: [ {type: 'texture', name : 'output', customAlloc: true} ],
    params:  [ {type: 'int', source : 'texData'}],
	alloc: function(sizes, texData) {
	
			console.log("STARTED allocate image  ");
			    
			var width_ = Math.sqrt(texData.length/4);	
			var height_ = width_;
			
		//	console.log("width "+width_);
		//	console.log("height "+height_);
  
			var samplerConfig = new Xflow.SamplerConfig;			
			samplerConfig.setDefaults();
			sizes['output'] = {
				imageFormat : {width: width_, height :height_},
				samplerConfig : samplerConfig
			}				
		
    },
    evaluate: function(output, texData) {
		if (texData.length < 5)
			return false;
				 console.log('TEXTURE EXECUTED');
        var size = texData.length;		
		
        var d = output.data;

            for (var i = 0; i < size; i++) 
			    d[i]= texData[i];
				      
        return true;
		
    }
});

Xflow.registerOperator("xflow.updateTexture", {
    outputs: [ {type: 'int', name : 'output', customAlloc: true} ],
    params:  [ {type: 'int', source : 'texData'},
	           {type: 'int', source : 'imageBuffer'},
			   {type: 'int', source : 'iterComp'},
			   {type: 'int', source : 'texSize'},
			   {type: 'int', source : 'numComp'}],
alloc: function(sizes,texData,imageBuffer,iterComp,texSize,numComp) {
        sizes['output'] = texSize[0]*texSize[0]*4;
		//console.log('buffer alloc'+texSize[0]*texSize[0]*4);
	
    },
    evaluate: function(output, texData,imageBuffer,iterComp,texSize,numComp) {

     if(imageBuffer.length<2) return false;
	 
	 console.log('BUFFER EXECUTED');
	 if(iterComp[0]==0){
	  texData = new Uint8Array(texSize[0]*texSize[0]*4);
	  for(var i =0; i<texData.length; i++) texData[i]=128;
	 }

       var index = 0; 

	//	console.log('buffer size'+imageBuffer.length);
		console.log('comp num ' +(iterComp[0]).toString());
          for (var i = 0; i < imageBuffer.length; i+=4) 
			  { 
		
			   var r = imageBuffer[i];
			   var g = imageBuffer[i+1];
			   var b = imageBuffer[i+2];
			   var a = imageBuffer[i+3];
 		  	  
	           texData[(index++)*numComp[0]+iterComp[0]] =  r; 
	           texData[(index++)*numComp[0]+iterComp[0]] =  g; 
	           texData[(index++)*numComp[0]+iterComp[0]] =  b; 
	           texData[(index++)*numComp[0]+iterComp[0]] =  a; 
		
			  }
			   
	     for (var i = 0; i < output.length; i++) 	
		      output[i] = texData[i];
			
  
		valueElement= document.getElementById("texDataId");
        valueElement.setScriptValue(texData); 
		var empty = new Uint8Array(1);
	    valueElement= document.getElementById("imageBufferId");
        valueElement.setScriptValue(empty); 
	   
	    valueElement= document.getElementById("iterCompId");
	    valueElement.textContent = (valueElement.value[0]+1).toString();
	   
        return texData;
		
    }
});

