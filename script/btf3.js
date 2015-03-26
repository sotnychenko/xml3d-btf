
// made for buddha, here fragTexCoord are flipped, everything else is the same
XML3D.shaders.register("btf", {

    vertex : [
        "attribute vec3 position;",
        "attribute vec3 normal;",
        "attribute vec3 color;",
        "attribute vec2 texcoord;",
        "attribute vec3 tangent;",
		"attribute vec3 binormal;",
		
        "varying vec3 fragNormal;",
        "varying vec3 fragVertexPosition;",
        "varying vec3 fragEyeVector;",
		"varying vec3 fragLightVector;",
        "varying vec2 fragTexCoord;",
        "varying vec3 fragVertexColor;",

		
        "uniform mat4 modelViewProjectionMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 eyePosition;",
		
        "uniform vec3 pointLightPosition[MAX_POINTLIGHTS];",
		
        "void main(void) {",
		
        "    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);",
        "    fragNormal = normalize(normalMatrix * normal);",
        "    fragVertexPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;",
        "    fragEyeVector = -1.0*normalize(fragVertexPosition);",
        "    fragTexCoord.x = texcoord.y;",
		"    fragTexCoord.y = texcoord.x;",
	    "    vec4 lPosition = modelViewMatrix * vec4(pointLightPosition[0], 1.0);",
        "    fragLightVector = normalize(lPosition.xyz - fragVertexPosition);",
        "}"
    ].join("\n"),

    fragment : [
	    "#extension GL_OES_standard_derivatives : enable",
	    "#ifndef numSteps",
		"#define numSteps 10", //number of sample intervals
		"#endif",
		"#ifndef RADIAN",
		"#define RADIAN 0.0174",
		"#endif",
		"#ifndef PI",
		"#define PI 3.14159",
		"#endif",
		"#ifndef EPS",
		"#define EPS 0.001",
		"#endif",
		"#ifndef degree",
		"#define degree 57.296",
		"#endif",
		"#ifndef numOfIter",
		"#define numOfIter 2", // numComp/4
		"#endif",
		"varying vec3 fragLightVector;",
	
		       
        "precision highp float;",
        "varying vec3 fragNormal;",
        "varying vec2 fragTexCoord;",
        "varying vec3 fragEyeVector;",
        "varying vec3 fragTangent;",
        "varying vec3 fragBinormal;",
        "varying vec3 fragVertexPosition;",
		
        "uniform mat4 viewMatrix;",
        "uniform sampler2D textureL;",
        "uniform sampler2D textureR;",
		"uniform sampler2D mapDirections;",
        "uniform sampler2D mapInterp;",
        "uniform float numDirections;",
        "uniform float blockSize;",
        "uniform float numComp;",
        "uniform float imageSize;",
		"uniform float LSize;",
		"uniform float RSize;",
		"uniform float ambient;",

		
	    "float composeSigma(vec2 s){", 	
	    "return (s[0]*255.0)*10.0 + (s[1]*255.0)*0.1;",
	    "}",
		
		//decompressTexture
        "vec4 decompressTexture(float imageN) {",
        "     float numFrames = numDirections * blockSize;",
        "     float blockN =floor(imageN/numFrames);",
        "     vec4 vecL=vec4(0.0);",
        "     vec4 vecR=vec4(0.0);",
        "     vec4 color = vec4(0.0,0.0,0.0,1.0);",
        "     vec4 sig= vec4(1.0);",
        "     float comp = numComp/4.0;",
        "     float j = floor(fract(fragTexCoord[0])*(imageSize-1.0)+.5);",
        "     float i = floor(fract(fragTexCoord[1])*(imageSize-1.0)+.5);",
        "     float indexL = ((blockN)*(imageSize*imageSize)+ (i*imageSize+j))*(comp)-1.0;",
		"     float temp = imageN*3.0*(comp)-1.0;",
		"     vec3 indexR = vec3(temp,temp+comp,temp+2.0*comp);",
		"     float lastBlock = floor(numDirections/blockSize - floor(numDirections/blockSize) +0.5);",
		"     float indexS =floor((comp)*3.0*numFrames*(floor(numDirections/blockSize)+lastBlock)+(blockN*numComp)/2.0 - 0.5);",
		"     vec4 s=vec4(1.0);",
		"     float x,y;", 
        "     for(int k=0; k< numOfIter; k++) {", // 8/4 - 8 stands for number of components
        "         indexL+=1.0;",
        "         x = floor(indexL/LSize);",
        "         y = indexL-x*LSize; ",
        "         vecL =texture2D(textureL, vec2(0.5+y,LSize-0.5-x)/LSize);",
        "         vecL =vecL*2.0-1.0;",
  
		"         indexS+=1.0;",
		"         x = floor(indexS/RSize);",
		"	      y = indexS-x*RSize;",
		"         s=texture2D(textureR,vec2(0.5+y,RSize-0.5-x)/RSize);",
		
		"         sig[0] = composeSigma(s.rg);",
		"         sig[1] = composeSigma(s.ba);",
		
		"         indexS+=1.0;",
		"         x = floor(indexS/RSize);",
		"	      y += 1.0;",
		"         s=texture2D(textureR,vec2(0.5+y,RSize-0.5-x)/RSize);",	
	
		"         sig[2] = composeSigma(s.rg);",
		"         sig[3] = composeSigma(s.ba);",
	    
		"         vecL*=sig;",
		"         indexR+=1.0;",
	    "         x = floor(indexR.x/RSize);",
		"         y = indexR.x-x*RSize;", 
		"         vecR=texture2D(textureR,vec2(0.5+y,RSize-0.5-x)/RSize);  ",
        "         vecR =vecR*2.0-1.0;",
		"         color.x+=dot(vecL,vecR);",
		
	    "         x = floor(indexR.y/RSize);",
		"         y = indexR.y-x*RSize;", 
		"         vecR=texture2D(textureR,vec2(0.5+y,RSize-0.5-x)/RSize);  ",
        "         vecR =vecR*2.0-1.0;",
		"         color.y+=dot(vecL,vecR);",
		
		"         x = floor(indexR.z/RSize);",
		"         y = indexR.z-x*RSize;", 
		"         vecR=texture2D(textureR,vec2(0.5+y,RSize-0.5-x)/RSize);  ",
        "         vecR =vecR*2.0-1.0;",
		"         color.z+=dot(vecL,vecR);",		      
		"    }",
		"return color;",
        "}",
		
        //computeAngles
	    "vec3 computeDirections(vec2 xy){",

		"xy +=1.0;",
		"xy /=2.0;",
		"xy*=512.0;",
		"xy = (floor(xy)+0.5)/512.0;",
	    "       vec3  result =texture2D(mapDirections,xy).rgb;",
		"return vec3(result);",
	    "}",
		 "vec3 computeInterp(vec2 xy){",
		
		"xy +=1.0;",
		"xy /=2.0;",
		"xy*=512.0;",
	    "xy = (floor(xy)+0.5)/512.0;",
	   
	    "       vec3  result =texture2D(mapInterp,xy).rgb;",
		"return vec3(result);",
	    "}",
		 "vec2 computeAngles(vec3 vector,vec3 normal,vec3 X, vec3 Y){",
	    "     float x = dot(vector,X);",
	    "     float y = dot(vector,Y);",	
        "     float z = dot(vector,normal);",
        " vec3 prj= normalize(vec3(x,y,z));",		
	    "return prj.xy;",
	    "}",
	 
		//getColor
	    "vec3 getColor(vec3 camDir,float lightIndex,vec3 coef){",
		" vec3 resultColor = vec3(0.0);",
		
		"     if(coef.r>EPS) resultColor.xyz+=coef.r*decompressTexture( (camDir.r-1.0)*numDirections+(lightIndex-1.0)).xyz;",
        "     if(coef.g>EPS) resultColor.xyz+=coef.g*decompressTexture( (camDir.g-1.0)*numDirections+(lightIndex-1.0)).xyz;",
        "    if(coef.b>EPS)  resultColor.xyz+=coef.b*decompressTexture( (camDir.b-1.0)*numDirections+(lightIndex-1.0)).xyz;",
			
		"return resultColor;",
	    "}",
		
		  
        "void main(void){",
	
		"	 vec2 camDir = vec2(0.0,0.0);",
	    "    vec2 lightDir = vec2(0.0,0.0);",
		"    vec4 resultColor = vec4(0.0,0.0,0.0,1.0);",
	
	    "    float atten = dot(fragLightVector,fragNormal);",
		"    vec3 p_dx = dFdx(fragVertexPosition);",
        "    vec3 p_dy = dFdy(fragVertexPosition);",
		"    vec2 tc_dx = dFdx(fragTexCoord);",
        "    vec2 tc_dy = dFdy(fragTexCoord);",
		"    vec3 t = normalize( (tc_dy.y * p_dx - tc_dx.y * p_dy ));",
        "    vec3 b = normalize( (tc_dy.x * p_dx - tc_dx.x * p_dy )); ",
		"    vec3 x = cross(fragNormal, t);",
        "    t = cross(x, fragNormal);",
        "    t = normalize(t);",
		"    x = cross(b, fragNormal);",
        "    b = cross(fragNormal, x);",
        "    b = normalize(b);",
		
		" vec2 eyeVec = computeAngles(fragEyeVector,fragNormal,t,b);",
		
		" vec2 lightVec= computeAngles(fragLightVector,fragNormal,t,b);",
		"    vec3 cameraIndex =computeDirections(eyeVec);",
        "    vec3 lightIndex =computeDirections(lightVec);",
        "    vec3 cameraInterp =computeInterp(eyeVec);",
        "    vec3 lightInterp =computeInterp(lightVec);",
		

 
	
	    " cameraIndex*=255.0;",
		" lightIndex*=255.0;",
        
        "    if(lightInterp.r>EPS)  resultColor.xyz+=lightInterp.r*getColor(cameraIndex, lightIndex.r,cameraInterp);",
        "   if(lightInterp.g>EPS)  resultColor.xyz+=lightInterp.g*getColor(cameraIndex, lightIndex.g,cameraInterp);",
        "   if(lightInterp.b>EPS)  resultColor.xyz+=lightInterp.b*getColor(cameraIndex, lightIndex.b,cameraInterp);",
					
		//"    resultColor.xyz*=1.5;",

		
		"	 gl_FragColor = resultColor;", 
        "}"
	
    ].join("\n"),

    addDirectives: function(directives, lights, params) {
        var pointLights = lights.point ? lights.point.length : 0;
        var directionalLights = lights.directional ? lights.directional.length : 0;
        var spotLights = lights.spot ? lights.spot.length : 0;
        directives.push("MAX_POINTLIGHTS " + pointLights);
        directives.push("MAX_DIRECTIONALLIGHTS " + directionalLights);
        directives.push("MAX_SPOTLIGHTS " + spotLights);
    },
    hasTransparency: function(params) {
        return params.transparency && params.transparency.getValue()[0] > 0.001;
    },
    uniforms: {
		numDirections   : 0.0,
		blockSize       : 0.0,
		numComp         : 0.0,
		imageSize       : 0.0,
		LSize           : 0.0,
		RSize           : 0.0,
		ambient         : 0.0
    },
    samplers: {
		textureR : null,
		textureL : null,
		mapDirections : null,
		mapInterp : null
    },
	attributes: {
        normal : {
            required: true
        },
        texcoord: null,
		color: null
    }
});