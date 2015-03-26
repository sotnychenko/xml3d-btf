Xflow.registerOperator("xflow.updateTexture", {
    outputs: [ {type: 'texture', name : 'output', customAlloc: true} ],
    params:  [ {type: 'int', source : 'texData'},
	           {type: 'int', source : 'imageBuffer'},
			   {type: 'int', source : 'iterComp'},
			   {type: 'int', source : 'texSize'},
			   {type: 'int', source : 'numComp'}],

		alloc: function(sizes,texData,imageBuffer,iterComp,texSize,numComp) {
	
			console.log("STARTED allocate image  ");
			    
			var width_ = texSize[0];	
			var height_ = texSize[0];
		
			var samplerConfig = new Xflow.SamplerConfig;			
			samplerConfig.setDefaults();
			sizes['output'] = {
				imageFormat : {width: width_, height :height_},
				samplerConfig : samplerConfig
			}				
		
    },
    evaluate: function(output, texData,imageBuffer,iterComp,texSize,numComp) {

     if(imageBuffer.length<2) return false;
	 
	 console.log('BUFFER EXECUTED');
	 if(iterComp[0] ==0){
	  texData = new Uint8Array(texSize[0]*texSize[0]*4);
	  for(var i =0; i<texData.length; i++) texData[i]=128;
	 }

      
	//	console.log('buffer size'+imageBuffer.length);
		console.log('comp num ' +(iterComp[0]).toString());
          for (var i = 0; i < imageBuffer.length; i++)  
	           texData[i*numComp[0]+iterComp[0]] =  imageBuffer[i]; 
	        			   
	     for (var i = 0; i < output.data.length; i++) 	
		      output.data[i] = texData[i];
		
  
		valueElement= document.getElementById("texDataId");
        valueElement.setScriptValue(texData); 
		var empty = new Uint8Array(1);
	    valueElement= document.getElementById("imageBufferId");
        valueElement.setScriptValue(empty); 
	   
	    valueElement= document.getElementById("iterCompId");
	    valueElement.textContent = (valueElement.value[0]+1).toString();
	   
        return true;
		
    }
});

