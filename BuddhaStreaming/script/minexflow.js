Xflow.registerOperator("xflow.updateTexture", {
    outputs: [ {type: 'texture', name : 'output',customAlloc: true} ],
    params:  [ {type: 'int', source : 'texData'},
	           {type: 'int', source : 'imageBuffer'},
			   {type: 'int', source : 'iter'},
			     {type: 'int', source : 'texSizeW'},
			   {type: 'int', source : 'texSizeH'},
			   {type: 'int', source : 'numComp'},
			    {type: 'int', source : 'numChannel'}],

		alloc: function(sizes,texData,imageBuffer,iter,texSizeW,texSizeH,numComp,numChannel) {
	
			console.log("STARTED allocate image  ");
			    
			var width_ = texSizeW[0];	
			var height_ = texSizeH[0];
		
			var samplerConfig = new Xflow.SamplerConfig;			
			samplerConfig.setDefaults();
			sizes['output'] = {
				imageFormat : {width: width_, height :height_},
				samplerConfig : samplerConfig
			}				
		
    },
    evaluate: function(output, texData,imageBuffer,iter,texSizeW,texSizeH,numComp,numChannel) {
      
     if(imageBuffer.length<2) return false;

	 
	 console.log('BUFFER EXECUTED');
	 if(iter[0] ==0){
	  texData = new Uint8Array(texSizeW[0]*texSizeH[0]*4);
	 // for(var i =0; i<texData.length; i++) texData[i]=128;
	  
	    var index =0;
	      while(index<texData.length)
      {
	   texData[index]=255;
	   index=index+1;
	     texData[index]=127;
	   index=index+1;
	     texData[index]=255;
	   index=index+1;
	     texData[index]=255; //-<alpha, if you change to 127, as it should be for blank values.
	    index=index+1;
	   
	  }
	
	 }
	 

      
	//	console.log('buffer size'+imageBuffer.length);
		console.log('comp num ' +(iter[0]).toString());
      
	   var index =0;
	  var ind = iter[0]*2;
	     

                 while( ind < texData.length &&index<imageBuffer.length)  
	          { 			  
			//texData[ind] =  imageBuffer[index];  // comment this out to load the texture data
			   if(index%2==0) {ind+=1;  }
			  else{ ind+=numComp[0]*2-1;}	   
                	 index++;
			  }
	        			   
	     for (var i = 0; i < output.data.length; i++) 	
		     output.data[i] = texData[i];
	
  

	   

	   
	
	   
	   
  	   valueElement=sequenceList[iterComp].shader.getElementsByTagName("data")[numChannel[0]].getElementsByTagName("int").texData;
        valueElement.setScriptValue(texData); 
		var empty = new Uint8Array(1);
	    valueElement=sequenceList[iterComp].shader.getElementsByTagName("data")[numChannel[0]].getElementsByTagName("int").imageBuffer;
        valueElement.setScriptValue(empty); 
		
		valueElement=sequenceList[iterComp].shader.getElementsByTagName("data")[numChannel[0]].getElementsByTagName("int").iterComp;
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

