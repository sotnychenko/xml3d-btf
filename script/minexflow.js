Xflow.registerOperator("xflow.updateTexture", {
    outputs: [ {type: 'texture', name : 'output', customAlloc: true} ],
    params:  [ {type: 'int', source : 'texData'},
	           {type: 'int', source : 'imageBuffer'},
			   {type: 'int', source : 'iter'},
			   {type: 'int', source : 'texSize'},
			   {type: 'int', source : 'numComp'}],

		alloc: function(sizes,texData,imageBuffer,iter,texSize,numComp) {
	
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
    evaluate: function(output, texData,imageBuffer,iter,texSize,numComp) {
      
     if(imageBuffer.length<2) return false;

	 
	 console.log('BUFFER EXECUTED');
	 if(iter[0] ==0){
	  texData = new Uint8Array(texSize[0]*texSize[0]*4);
	  for(var i =0; i<texData.length; i++) texData[i]=128;
	 }

      
	//	console.log('buffer size'+imageBuffer.length);
		console.log('comp num ' +(iter[0]).toString());
          for (var i = 0; i < imageBuffer.length; i++)  
	           texData[i*numComp[0]+iter[0]] =  imageBuffer[i]; 
	        			   
	     for (var i = 0; i < output.data.length; i++) 	
		      output.data[i] = texData[i];
		
  
		valueElement= sequenceList[iterComp].shader.getElementsByTagName("int").texData;
        valueElement.setScriptValue(texData); 
		var empty = new Uint8Array(1);
	    valueElement=sequenceList[iterComp].shader.getElementsByTagName("int").imageBuffer;
        valueElement.setScriptValue(empty); 
		
		valueElement=sequenceList[iterComp].shader.getElementsByTagName("int").iterComp;
	    valueElement.textContent = (valueElement.value[0]+1).toString();
	   
	     iterComp ++;
		  if(iterComp<totalNumOfComp) {
	    console.log("current comp: "+sequenceList[iterComp].compNum + " texName: " + sequenceList[iterComp].texName);
	
	     var file;
	     client.send(file,{name: sequenceList[iterComp].texName, numComp: sequenceList[iterComp].compNum });
       }	 
	   
        return true;
		
    }
});

