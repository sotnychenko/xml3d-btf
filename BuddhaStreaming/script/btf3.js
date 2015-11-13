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

		
        "precision highp float;",


        "uniform sampler2D textureLr;",
		"uniform float LSizeW;",
		"uniform float LSizeH;",





"vec2 rgba2low1( vec4 rgbeNormalized )",
"{",
"vec2 result;",
"result.x =  (floor(( rgbeNormalized.r)*255.0) +  floor((rgbeNormalized.g)*255.0)*256.0)/65535.0;",
"result.y =(floor(( rgbeNormalized.b)*255.0) +  floor((rgbeNormalized.a)*255.0)*256.0)/65535.0;",
" return result;",
"}",

"vec2 sampleTex1( sampler2D sampler, int index, vec2 size )",
"{",
	    "         float x,y;", 
        "        x = float(index/int(size.y));",
        "        y = float(index-int(x)*int(size.y)); ",
        "  return rgba2low1(texture2D(sampler, vec2((0.5+y)/size.y,(size.x-0.5-x)/size.x)));",
"}",


		//decompressTexture
        "highp vec4 decompressTexture(float imageN) {",
	
        
		" vec4 color = vec4(vec3(0.0),1.0);",
		" vec2 vecL = vec2(0.0);",
        "         vecL=sampleTex1(textureLr,0,vec2(LSizeH,LSizeW));",
		"         vecL*=2.0;",
		"         vecL-=1.0;",
	 // "         color.r+=-0.01*(-1000.0);", // that's what happening, if alpha not 255, change it you will see.
		"         color.r+=vecL.x*(-1000.0);",
		
		"return color;",
        "}",
		
		
		  
        "void main(void){",
		
		"	 gl_FragColor = decompressTexture(0.0);", 
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