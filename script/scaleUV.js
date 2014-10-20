Xflow.registerOperator("xflow.scaleUV", {
	outputs: [	{type: 'float2', name: 'texcoord'}],
    params:  [  {type: 'float2', source: 'texcoord' },
                {type: 'float2', source: 'scaleUV' }],
    evaluate: function(newtexcoord, texcoord, scaleUV, info) {

		for(var i = 0; i < info.iterateCount; i++) {
			var offset = i*2;
            newtexcoord[offset] = texcoord[offset] * scaleUV[0];
			newtexcoord[offset+1] = texcoord[offset+1] * scaleUV[1];			
		}
	}
});