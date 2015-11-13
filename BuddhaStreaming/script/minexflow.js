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
      


	 
	 console.log('BUFFER EXECUTED');

	  
	    var index =0;
	      while(index<output.data.length)
      {
	  output.data[index]=255;
	   index++;
	    output.data[index]=127;
	    index++;
	     output.data[index]=255;
	    index++;
	     output.data[index]=255; //-<alpha, if you change to 127, as it should be for blank values.
	    index++;   
	  }
	
	
	 

      
	
	

        return true;
		
    }
});

