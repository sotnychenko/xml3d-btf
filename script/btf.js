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
        "varying vec2 fragTexCoord;",
        "varying vec3 fragVertexColor;",
        "varying vec3 fragTangent;",
		"varying vec3 fragBinormal;",
		
        "uniform mat4 modelViewProjectionMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 eyePosition;",

        "void main(void) {",
		
        "    gl_Position = modelViewProjectionMatrix * vec4(position, 1.0);",
        "    fragNormal = normalize(normalMatrix * normal);",
        "    fragVertexPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;",
        "    fragEyeVector = -1.0*normalize(fragVertexPosition);",
        "    fragTexCoord = texcoord;",
      //"    fragVertexColor = color;",

      /*"    vec3 c1 = cross(fragNormal, vec3(0.0, 0.0, 1.0));", 
        "    vec3 c2 = cross(fragNormal, vec3(0.0, 1.0, 0.0));",
        "    if (length(c1) > length(c2))   fragTangent = c1;",	
        "    else",           
        "        fragTangent = c2;",	
        "    fragTangent = normalize(fragTangent);",
        "    fragBinormal = normalize(cross(fragNormal, fragTangent)); ",*/
	    "    fragTangent  = normalize(normalMatrix * tangent);",
	    "    fragBinormal = normalize(normalMatrix * binormal);",
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
		"#ifndef tettaStep",
		"#define tettaStep 15.0",
		"#endif",
		"#ifndef degree",
		"#define degree 57.296",
		"#endif",
		"#ifndef numOfIter",
		"#define numOfIter 2", // numComp/4
		"#endif",
		"#if MAX_POINTLIGHTS > 0",
        "uniform vec3 pointLightAttenuation[MAX_POINTLIGHTS];",
        "uniform vec3 pointLightPosition[MAX_POINTLIGHTS];",
        "uniform vec3 pointLightIntensity[MAX_POINTLIGHTS];",
        "uniform bool pointLightOn[MAX_POINTLIGHTS];",
        "#endif",
		"#if MAX_DIRECTIONALLIGHTS > 0",
        "uniform vec3 directionalLightDirection[MAX_DIRECTIONALLIGHTS];",
        "uniform vec3 directionalLightIntensity[MAX_DIRECTIONALLIGHTS];",
        "uniform bool directionalLightOn[MAX_DIRECTIONALLIGHTS];",
        "#endif",

		
		       
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
        "uniform float numDirections;",
        "uniform float blockSize;",
        "uniform float numComp;",
        "uniform float imageSize;",
		"uniform float LSize;",
		"uniform float RSize;",

        "vec2 vertexA;",
        "vec2 vertexB;",
        "vec2 vertexC;",
		"const vec3 lightPosEc = vec3(0.0,1.0,0.5);",
		
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
        //"     float LSize =8192.0;", // current fixed size of L matrix
       // "     float RSize =512.0;",  
        "     float j = floor(fract(fragTexCoord[0])*(imageSize-1.0)+.5);",
        "     float i = floor(fract(fragTexCoord[1])*(imageSize-1.0)+.5);",
        "     float indexL = (blockN)*(imageSize*imageSize)*(comp)+ (i*imageSize+j)*(comp)-1.0;",
		"     float temp = imageN*3.0*(comp)-1.0;",
		"     vec3 indexR = vec3(temp,temp+comp,temp+2.0*comp);",
		"     float indexS =floor((comp)*3.0*numFrames*(numDirections/blockSize)+(blockN*numComp)/2.0 - 0.5);",
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
		"	      y = indexS-x*RSize;",
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
		
		//getIndexOffset
        "float getIndexOffset(vec2 dir){",
		"      if(dir[0] == 0.0) return 0.0;",
		"      if(dir[1] == 360.0) dir[1]=0.0;",
		"      float offset = 0.0;",
		"      float twoPi = 360.0;",
	    "      float steps[10];",
	    "      steps[0]=15.0; steps[1]=60.0; steps[2]=30.0; steps[3]=30.0; steps[4]=45.0; steps[5]=20.0; steps[6]=60.0; steps[7]=18.0; steps[8]=75.0; steps[9]=15.0;",
		"      for (int i=0; i<numSteps/2; i++) {",
	    "          if(steps[2*i]==dir[0]){ offset += dir[1] / steps[2*i+1] + 1.0; break;}",
		"	       offset+= twoPi /steps[2*i+1];",
		"	   }",
		"return floor(offset);",
		"}",
		
		//getNeighboursTetta
		"vec2 getBound(float angle,float step){",
		"     angle=max(0.0,angle);",
		"     float partNum = floor(angle/step);",
		"     float lowerBound = step*partNum;",
	    "return vec2(lowerBound,lowerBound+step);",
        "}",
			
		//getValue
		"float getValue(int pos){",
		"      if(pos==1) return 60.0;",
		"      if(pos==3) return 30.0;",
		"      if(pos==5) return 20.0;",
		"      if(pos==7) return 18.0;",
		"      if(pos==9) return 15.0;",
		"return -1.0;",
		"}",
		
		//getNeighboursPhi
        "vec2 getNeighboursPhi(float phi, int pos){",
        "     if (pos<0) return vec2(0.0);",
		"     float phiStep = getValue(pos);",
		"return getBound(phi,phiStep);",	
        "}",
		
         //determinant
		"float determinant(mat3 m) {",
        "return  m[0][0]*( m[1][1]*m[2][2] - m[2][1]*m[1][2])",
        "      - m[1][0]*( m[0][1]*m[2][2] - m[2][1]*m[0][2])",
        "      + m[2][0]*( m[0][1]*m[1][2] - m[1][1]*m[0][2]);",
        "}",
	 
		 //getInterpWeights
		"vec3 getInterpWeights(vec3 P,vec3 P1, vec3 P2, vec3 P3){",
		"     float V1 = abs(determinant(mat3(P,P2,P3)));",
		"     float V2 = abs(determinant(mat3(P,P3,P1)));",
		"     float V3 = abs(determinant(mat3(P,P1,P2)));",
		"return vec3(V1, V2, V3) / (V1 + V2 + V3);",
		"}",
		  
		 //sphericalToVector
		"vec3 sphericalToVector(vec2 coord){",
        "     float tetta = RADIAN*coord[0];",
	    "     float phi   = RADIAN*coord[1];",
        "     float x = cos(phi)*sin(tetta);",
        "     float y = sin(phi)*sin(tetta);",
        "     float z = cos(tetta);",
        "return vec3(x,y,z);",
        "}",

		 // GetTriangle	 
		"void getTriangle(vec2 P){",
		"     vertexC = vec2(-1.0);",
	    "     P-=EPS;",
	    "     vec2 NeighboursTetta = getBound(P[0],tettaStep);",
	    "     int index= int(floor(NeighboursTetta.x/tettaStep)*2.0-1.0);",
	    "     bool bottom = false;",
	    "     vec2 NeighboursPhiUpper =  getNeighboursPhi(P[1],index);",
	    "     vec2 NeighboursPhiBottom;",
	    "     if(index<numSteps-2) NeighboursPhiBottom=getNeighboursPhi(P[1],index+2);",
	    "     else  bottom = true;",
	    "     if(index==-1){", // upper triangle 
		"        vertexA = vec2(0.0,0.0);",
		"        vertexB = vec2(NeighboursTetta[1],NeighboursPhiBottom[0]);",
		"        vertexC = vec2(NeighboursTetta[1],NeighboursPhiBottom[1]);",
        "        return;",		  
	    "     }",		
	    "     vertexA = vec2(NeighboursTetta[0],NeighboursPhiUpper[0]);",
	    "     vertexB = vec2(NeighboursTetta[0],NeighboursPhiUpper[1]);",
		"     if(bottom) return;",	
	    "     vec2 D = vec2(NeighboursTetta[1],NeighboursPhiBottom[1]);",
        "     float tetta1 = RADIAN*vertexA[0];",
	    "     float phi1   = RADIAN*vertexA[1];",
	    "     float tetta2 = RADIAN*P[0];",
	    "     float phi2   = RADIAN*P[1];",
        "     float dist1  = cos(tetta1)*cos(tetta2)+sin(tetta1)*sin(tetta2)*cos(phi1-phi2);",
        "     tetta1 = RADIAN*D[0];",
	    "     phi1   = RADIAN*D[1];",
        "     float dist2 = cos(tetta1)*cos(tetta2)+sin(tetta1)*sin(tetta2)*cos(phi1-phi2);",
	    "     if(dist1>=dist2) {vertexC=vec2(NeighboursTetta[1],NeighboursPhiBottom[0]);}",
     	"     else",
	    "         {vertexA=vec2(NeighboursTetta[1],NeighboursPhiBottom[0]);vertexC=D;}",		
		"return;",
        "}",
		
		// lerp	 
		"vec2 lerp(float p, float v1, float v2) {",
	    "return  vec2(abs(v2-p),abs(v1-p))/abs(v2-v1); ",
	    "}",
		
		//getCoef
        "vec3 getCoef(vec2 P){",
        "     vec3 coef=vec3(0.0);",
		"     if (vertexC[0]!=-1.0){",
		"     coef = getInterpWeights(sphericalToVector(P),",
		"		                      sphericalToVector(vertexA),",
		"		                      sphericalToVector(vertexB),",
		"                             sphericalToVector(vertexC));",								   
		"     }",
		"     else{",		 
	    "          coef.xy = lerp(P[1],vertexA[1],vertexB[1]).xy;",			 
		"     }",
		"return coef;",
		"}",

		 //getNearestDir
		"vec2 getNearestDir(vec3 coef){",
		"     int index = 0;",
		"     float value = 0.0;",
		"     for(int i=0; i<3; i++)",
		"         if(coef[i]>value) { value = coef[i]; index = i;}",
		"     if(index==0) return vertexA;",
		"     if(index==1) return vertexB;",
		"     if(index==2) return vertexC;",
		"return vec2(0.0,0.0);",
		"}",
		
        //computeAngles
	    "vec2 computeAngles(vec3 vector,vec3 normal,vec3 X, vec3 Y){",
	    "     float x = dot(vector,X);",
	    "     float y = dot(vector,Y);",	
	    "     float tetta = acos(clamp(dot(vector,normal),0.0,1.0))*degree;",
	    "     float phi = atan(y,x+EPS)*degree;",
	    "     if(phi<0.0) phi+=360.0;",
	    "return vec2(tetta,phi);",
	    "}",
	 
		//getColor
	    "vec4 getColor(vec2 camDir,vec3 coef){",
	    "     float camViewIndex = numDirections*getIndexOffset(camDir);",
		"     vec4 resultColor  = vec4(0.0,0.0,0.0,1.0);",
		"     resultColor.xyz+=coef[0]*decompressTexture( camViewIndex+getIndexOffset(vertexA)).xyz;",
        "     resultColor.xyz+=coef[1]*decompressTexture( camViewIndex+getIndexOffset(vertexB)).xyz;",
        "     resultColor.xyz+=coef[2]*decompressTexture( camViewIndex+getIndexOffset(vertexC)).xyz;",
		"return resultColor;",
	    "}",
		"float visible(vec3 vector,vec3 normal){",	
	    "     float tetta = acos(dot(vector,normal))*degree;",
		"     if(tetta+EPS>90.0) return 1.0-fract((tetta-EPS)/90.0);",
	    "return 1.0;",
	    "}",
	
        "void main(void){",
		/*
        "     vec2 camDir = vec2(0.0,0.0);",
	    "     vec2 lightDir = vec2(0.0,0.0);",
		"     vec4 resultColor = vec4(0.0,0.0,0.0,1.0);",
        "     vec3 X = normalize(dFdx(fragVertexPosition));",
        "     vec3 Y = normalize(dFdy(fragVertexPosition));",
	    "     vec3 lightDirection = normalize( pointLightPosition[ 0] - fragVertexPosition);",
	    "     lightDir =computeAngles(lightDirection,fragNormal,X,Y);",
        "     camDir =computeAngles(fragEyeVector,fragNormal,X,Y);",
		"    float atten = visible(lightDirection,fragNormal);",
	    "     getTriangle(camDir);",	
	    "     vec3 coefCam = getCoef(camDir);",
	  //"     camDir =getNearestDir(coefCam);",
	    "     vec2 camVerA = vertexA;",
	    "     vec2 camVerB = vertexB;",
	    "     vec2 camVerC = vertexC;",
		
	    "     getTriangle(lightDir);",
	    "     vec3 coef = getCoef(lightDir);",
	
	    "     resultColor.xyz+=coefCam[0]*getColor(camVerA,coef).xyz;",
        "     resultColor.xyz+=coefCam[1]*getColor(camVerB,coef).xyz;",
        "     resultColor.xyz+=coefCam[2]*getColor(camVerC,coef).xyz;",	   
		"     resultColor.xyz*=atten;",
      //"     resultColor =getColor(camDir,coef);",
        "     gl_FragColor = resultColor;",  
     */
		"	 vec2 camDir = vec2(0.0,0.0);",
	    "    vec2 lightDir = vec2(0.0,0.0);",
		"    vec4 resultColor = vec4(0.0,0.0,0.0,1.0);",
        "#if MAX_POINTLIGHTS > 0",
        "  for (int i=0; i<MAX_POINTLIGHTS; i++) {",
     //  "      if(!pointLightOn[i])",
      //  "      continue;",
	  //"    vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );",
      //"    vec3 L = lPosition.xyz - fragVertexPosition;",

      //"    vec4 lDirection = viewMatrix * vec4(directionalLightDirection[i], 0.0);",
	    "    vec3 lightDirection = normalize(pointLightPosition[i] - fragVertexPosition);",
      //"    vec3 lightDirection =  normalize(-lDirection.xyz);",
	    "    float atten = visible(lightDirection,fragNormal);",
		"    vec3 X = normalize(dFdx(fragVertexPosition));",
        "    vec3 Y = normalize(dFdy(fragVertexPosition));",
        "    lightDir =computeAngles(lightDirection,fragNormal,X,Y);",
        "    camDir =computeAngles(fragEyeVector,fragNormal,X,Y);",
        "    getTriangle(camDir);",	
	    "    vec3 coefCam = getCoef(camDir);",
	  //"    camDir =getNearestDir(coefCam);",
	    "    vec2 camVerA = vertexA;",
	    "    vec2 camVerB = vertexB;",
	    "    vec2 camVerC = vertexC;",
		
	    "    getTriangle(lightDir);",
	    "    vec3 coef = getCoef(lightDir);",
	
	    "    resultColor.xyz+=coefCam[0]*getColor(camVerA,coef).xyz;",
        "    resultColor.xyz+=coefCam[1]*getColor(camVerB,coef).xyz;",
        "    resultColor.xyz+=coefCam[2]*getColor(camVerC,coef).xyz;",	   
		"    resultColor.xyz*=atten;",
      //"    resultColor =getColor(camDir,coef);",
	  
        "  }",
        "#endif",
		
		"	gl_FragColor = resultColor;", 
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
    },
    samplers: {
		textureR : null,
		textureL : null
    },
	attributes: {
        normal : {
            required: true
        },
        texcoord: null,
		color: null
    }
});