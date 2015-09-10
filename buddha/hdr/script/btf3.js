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
		"varying vec3 fragTangent;",

		
        "uniform mat4 modelViewProjectionMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 eyePosition;",
		
        "uniform vec3 pointLightPosition[MAX_POINTLIGHTS];",
		
        "void main(void) {",
		
        "    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);",
        "    fragNormal = normalize(normalMatrix * normal);",
		"	 fragTangent  = normalize( normalMatrix * tangent);",
        "    fragVertexPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;",
        "    fragEyeVector = -1.0*normalize(fragVertexPosition);",
        "    fragTexCoord.x = texcoord.x;",
		"    fragTexCoord.y = texcoord.y;",
	    "    vec4 lPosition = modelViewMatrix * vec4(pointLightPosition[0], 1.0);",
        "    fragLightVector = normalize(lPosition.xyz - fragVertexPosition);",
        "}"
    ].join("\n"),

    fragment : [
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
		"#define numOfIter 1", // numComp/3
		"#endif",
		
		
        "precision highp float;",
		"varying vec3 fragLightVector;",
	
		       
 
        "varying vec3 fragNormal;",
        "varying vec2 fragTexCoord;",
        "varying vec3 fragEyeVector;",
        "varying vec3 fragTangent;",
        "varying vec3 fragBinormal;",
        "varying vec3 fragVertexPosition;",
		
        "uniform mat4 viewMatrix;",
        "uniform sampler2D textureLr;",
        "uniform sampler2D textureRr;",
		"uniform sampler2D textureLg;",
        "uniform sampler2D textureRg;",
		"uniform sampler2D textureLb;",
        "uniform sampler2D textureRb;",
		"uniform sampler2D mapDirections;",
        "uniform sampler2D mapInterp;",
        "uniform float numDirections;",
        "uniform float blockSize;",
        "uniform float numComp;",
        "uniform float imageSize;",
		"uniform float LSizeW;",
		"uniform float LSizeH;",
		"uniform float RSizeW;",
		"uniform float RSizeH;",
		"uniform float ambient;",

		
	    "float composeSigma(vec2 s){", 	
	    "return (s[0]*255.0)*10.0 + (s[1]*255.0)*0.1;",
	    "}",





"vec2 rgbe2float( vec4 rgbeNormalized )",
"{",
"vec2 result;",
"vec4 rgbe = floor( rgbeNormalized * 255. + 0.5 );",
"float e = rgbe.g - ( 128. + 8. );",
"result.x= rgbe.r * exp2( e );",
" e = rgbe.a - ( 128. + 8. );",
"result.y= rgbe.b * exp2( e );",
"return result;",
"}",

"vec2 sampleTexture( sampler2D sampler, float index, vec2 size )",
"{",
	    "         float x,y;", 
        "         x = floor(index/size.y);",
        "         y = index-x*size.y; ",
        "  return rgbe2float(texture2D(sampler, vec2((0.5+y)/size.y,(size.x-0.5-x)/size.x)));",
"}",

"vec2 rgba2low( vec4 rgbeNormalized )",
"{",
"vec2 result;",
"result.x =  (floor(( rgbeNormalized.r)*255.0+.5) +  floor((rgbeNormalized.g)*255.0+.5)*256.0)/65535.0;",
"result.y =  (floor(( rgbeNormalized.b)*255.0+.5) +  floor((rgbeNormalized.a)*255.0+.5)*256.0)/65535.0;",
" return result;",
"}",

"vec2 sampleTex( sampler2D sampler, float index, vec2 size )",
"{",
	    "         float x,y;", 
        "        x = floor(index/size.y);",
        "        y = index-x*size.y; ",
        "  return rgba2low(texture2D(sampler, vec2((0.5+y)/size.y,(size.x-0.5-x)/size.x)));",
"}",



        
      


		//decompressTexture
        "highp vec4 decompressTexture(float imageN) {",
	
        "     float numFrames = numDirections * blockSize;",
        "     float blockN =floor(imageN/numFrames);",
		"     float numBlocks = ceil(numDirections/blockSize);",
        "     highp vec2 vecL=vec2(0.0);",
        "     highp vec2 vecR=vec2(0.0);",
        "     highp vec4 color = vec4(0.0,0.0,0.0,1.0);",
        "     float comp = numComp/2.0;",
        "     float i = floor(fract(fragTexCoord[0])*(imageSize-1.0)+.5);",
        "     float j = floor(fract(fragTexCoord[1])*(imageSize-1.0)+.5);",
        "     float indexL = ((blockN)*(imageSize*imageSize)+ (j*imageSize+i))*(comp);",
		"     float indexR = numBlocks+imageN*(comp);",
		"     vec2 shiftR_maxfR=sampleTexture(textureRr,blockN,vec2(RSizeH,RSizeW));",
		"     vec2 shiftG_maxfG=sampleTexture(textureRg,blockN,vec2(RSizeH,RSizeW));",
		"     vec2 shiftB_maxfB=sampleTexture(textureRb,blockN,vec2(RSizeH,RSizeW));",
        "     for(int k=0; k< numOfIter; k++) {", // 2/2 - 2 stands for number of components
        "         vecL=sampleTex(textureLr,indexL+float(k),vec2(LSizeH,LSizeW));",
		"         vecR=sampleTex(textureRr,indexR+float(k),vec2(RSizeH,RSizeW));  ",
		"         vecL*=shiftR_maxfR.y;",
		"         vecL-=shiftR_maxfR.x;",
		"         vecR*=2.0;",
		"         vecR-=1.0;",
		"         color.r+=dot(vecL,vecR);",

        "         vecL=sampleTex(textureLg,indexL+float(k),vec2(LSizeH,LSizeW));",
		"         vecR=sampleTex(textureRg,indexR+float(k),vec2(RSizeH,RSizeW));  ",
		"         vecL*=shiftG_maxfG.y;",
		"         vecL-=shiftG_maxfG.x;",
		"         vecR*=2.0;",
		"         vecR-=1.0;",
		"         color.g+=dot(vecL,vecR);",	
		
		"         vecL=sampleTex(textureLb,indexL+float(k),vec2(LSizeH,LSizeW));",
		"         vecR=sampleTex(textureRb,indexR+float(k),vec2(RSizeH,RSizeW));  ",
		"         vecL*=shiftB_maxfB.y;",
		"         vecL-=shiftB_maxfB.x;",
		"         vecR*=2.0;",
		"         vecR-=1.0;",
		"         color.b+=dot(vecL,vecR);",	
	    
		"    }",
		"return color;",
        "}",
		
        //computeAngles
	    "vec3 computeDirections(vec2 xy){",

		"xy +=1.0;",
		"xy /=2.0;",
		"xy*=512.0;",
		"xy = (floor(xy+.5)+0.5)/512.0;",
		//"xy.y=1.0-xy.y;",
		
	    "       vec3  result =texture2D(mapDirections,xy).rgb;",
		"return vec3(result);",
	    "}",
		 "vec3 computeInterp(vec2 xy){",
		
		"xy +=1.0;",
		"xy /=2.0;",
		"xy*=512.0;",
		
	    "xy = (floor(xy+.5)+0.5)/512.0;",
	 //  "xy.y=1.0-xy.y;",
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
	    "highp vec3 getColor(vec3 camDir,float lightIndex,vec3 coef){",
		" highp vec3 resultColor = vec3(0.0);",
		"     resultColor.xyz+=coef.r*decompressTexture( (lightIndex-1.0)*numDirections+(camDir.r-1.0)).xyz;",
        "     resultColor.xyz+=coef.g*decompressTexture( (lightIndex-1.0)*numDirections+(camDir.g-1.0)).xyz;",
        "     resultColor.xyz+=coef.b*decompressTexture( (lightIndex-1.0)*numDirections+(camDir.b-1.0)).xyz;",
			
			
		"return resultColor;",
	    "}",
		
		  
        "void main(void){",
	
		"	 vec2 camDir = vec2(0.0,0.0);",
	    "    vec2 lightDir = vec2(0.0,0.0);",
		"    highp vec4 resultColor = vec4(0.0,0.0,0.0,1.0);",
	
	    "    float atten = dot(fragLightVector,fragNormal);",
        "    vec3 b = normalize(cross(fragNormal, fragTangent));",
        "    vec3 t = normalize(fragTangent);",
		
		" vec2 eyeVec = computeAngles(fragEyeVector,fragNormal,t,b);",
		"eyeVec*=0.55;",
		" vec2 lightVec= computeAngles(fragLightVector,fragNormal,t,b);",
		"lightVec*=0.75;",
		"    vec3 cameraIndex =computeDirections(eyeVec);",
        "    vec3 lightIndex =computeDirections(lightVec);",
        "    vec3 cameraInterp =computeInterp(eyeVec);",
        "    vec3 lightInterp =computeInterp(lightVec);",
		

 
	
	    " cameraIndex=floor(cameraIndex*255.0+.5);",
		" lightIndex=floor(lightIndex*255.0+.5);",
        
        "    resultColor.xyz+=cameraInterp.r*getColor(lightIndex, cameraIndex.r,lightInterp);",
        "    resultColor.xyz+=cameraInterp.g*getColor(lightIndex, cameraIndex.g,lightInterp);",
        "    resultColor.xyz+=cameraInterp.b*getColor(lightIndex, cameraIndex.b,lightInterp);",
					
		   "    resultColor.xyz+=ambient;",
          "    resultColor.xyz*=atten;",
         "    resultColor.xyz*=1.15;",
		
		
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
		LSizeW          : 0.0,
		LSizeH          : 0.0,
		RSizeW          : 0.0,
		RSizeH          : 0.0,
		ambient         : 0.0
    },
    samplers: {
	    textureLr : null,
		textureRr : null,
		textureLg : null,
		textureRg : null,
		textureLb : null,
		textureRb : null,
		mapDirections : null,
		mapInterp : null
    },
	attributes: {
        normal : {
            required: true
        },
        texcoord: null,
		tangent: null,
		color: null
    }
});