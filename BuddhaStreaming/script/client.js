    var iterComp;
    var texName;
    var numComp;
    var mainStream;
    var client;
    var texNameIt;
    var totalNumOfComp;
    var sequenceList;

    var streamElement = function(texName, compNum, shader) {
        this.texName = texName;
        this.compNum = compNum;
        this.shader = shader;
    };
    $(window).bind("load", function() {

        // Connect to Binary.js server
        //client = new BinaryClient('ws://calm-reaches-6633.herokuapp.com' + '/path');
          client = new BinaryClient('ws://localhost:5000');

        client.on('open', function() {
            console.log("Connected to the  server!");
            var file;
            var progressbar = $('#progressbar'),
                value = progressbar.val();
            value = 0;

            var shaders = document.getElementsByTagName("shader");

            var listOfBTFshaders = [];
            totalNumOfComp = 0;
            for (i = 0; i < shaders.length; i++) {

                var script = shaders[i].getAttribute("script");
                if (script.includes("btf")) {
                    listOfBTFshaders.push(shaders[i]);
                    totalNumOfComp += parseFloat(shaders[i].getElementsByTagName("float").numComp.textContent);


                    var element = document.createElement("float");
                    element.setAttribute("name", "tempIter");
                    element.textContent = '-1';
                    shaders[i].appendChild(element);

                    element = document.createElement("string");
                    element.setAttribute("name", "tempDone");
                    element.textContent = 'false';
                    shaders[i].appendChild(element);
                }

            }
            sequenceList = [];

            totalNumOfComp += listOfBTFshaders.length;

            var curName = -1;

            var it = 0;
            var tempNumComp = 0;
           totalNumOfComp =4;
            while (it < totalNumOfComp)

            {
                for (i = 0; i < listOfBTFshaders.length; i++) {
                    //console.log(shaders[i]);
                    if (listOfBTFshaders[i].getElementsByTagName("string").tempDone.textContent == 'true') continue;

                    tempNumComp = listOfBTFshaders[i].getElementsByTagName("float").tempIter;
                    // console.log("cur it = "+tempNumComp.textContent);
                    if (parseFloat(tempNumComp.textContent) >= listOfBTFshaders[i].getElementsByTagName("float").numComp.value[0]) {
                        listOfBTFshaders[i].getElementsByTagName("string").tempDone.textContent = 'true';
                        continue;
                    }
                    // console.log("tex name "+shaders[i].getElementsByTagName("string").texName.textContent);

                    if (parseFloat(tempNumComp.textContent) == -1) {
                         sequenceList.push(new streamElement(listOfBTFshaders[i].getElementsByTagName("string").texName.textContent, 'Rh', listOfBTFshaders[i]));
						 sequenceList.push(new streamElement(listOfBTFshaders[i].getElementsByTagName("string").texName.textContent, 'Rs', listOfBTFshaders[i]));
						  sequenceList.push(new streamElement(listOfBTFshaders[i].getElementsByTagName("string").texName.textContent, 'Rv', listOfBTFshaders[i]));
                        listOfBTFshaders[i].getElementsByTagName("float").tempIter.textContent = (parseFloat(tempNumComp.textContent) + 1).toString();
                        continue;
                    }


                    sequenceList.push(new streamElement(listOfBTFshaders[i].getElementsByTagName("string").texName.textContent, "h"+tempNumComp.textContent, listOfBTFshaders[i]));
					sequenceList.push(new streamElement(listOfBTFshaders[i].getElementsByTagName("string").texName.textContent, "s"+tempNumComp.textContent, listOfBTFshaders[i]));
					sequenceList.push(new streamElement(listOfBTFshaders[i].getElementsByTagName("string").texName.textContent, "v"+tempNumComp.textContent, listOfBTFshaders[i]));

                    listOfBTFshaders[i].getElementsByTagName("float").tempIter.textContent = (parseFloat(tempNumComp.textContent) + 1).toString();


                }
                it++;
            }
            console.log(sequenceList);


            endStream = false;
            iterComp = 0;


            client.send(file, {
                name: sequenceList[iterComp].texName,
                numComp: sequenceList[iterComp].compNum
            });

        });

        // Received new stream from server!
        client.on('stream', function(stream, meta) {
            mainStream = stream;
            console.log("Received new stream from server!");
            var progressbar = $('#progressbar'),
                max = progressbar.attr('max'),
                value = progressbar.val();

            var elementsFloat, elementsInt;
            if (sequenceList[iterComp].compNum[0] == 'R') {
 	         console.log("init");
                elementsFloat = sequenceList[iterComp].shader.getElementsByTagName("float");
				elementsFloat.LSizeW.textContent = meta.LSizeW;
				elementsFloat.LSizeH.textContent = meta.LSizeH;
				elementsFloat.RSizeW.textContent = meta.RSizeW;
				elementsFloat.RSizeH.textContent = meta.RSizeH;
				elementsFloat.blockSize.textContent = meta.blockSize;
				elementsFloat.numDirections.textContent = meta.numDirections;
				elementsFloat.imageSize.textContent = meta.imageSize;
                elementsFloat.numComp.textContent = meta.numComp;  
                console.log("number of components: " + meta.numComp);				
                
				
				 
               switch (sequenceList[iterComp].compNum[1]) {
					 case 'h':     
                               elementsInt = sequenceList[iterComp].shader.getElementsByTagName("data")[0].getElementsByTagName("int");
				               break;
					 case 's':     
                              elementsInt = sequenceList[iterComp].shader.getElementsByTagName("data")[1].getElementsByTagName("int");
				              break;
					 case 'v':     
                              elementsInt = sequenceList[iterComp].shader.getElementsByTagName("data")[2].getElementsByTagName("int");
				              break;
					 }
					 
			    elementsInt.numCompBuffer.textContent = meta.numComp;				
                elementsInt.texSizeW.textContent = meta.LSizeW;
                elementsInt.texSizeH.textContent = meta.LSizeH;
              
            }

            value = Math.floor(((iterComp + 1) / (totalNumOfComp)) * 100);

            progressbar.val(value);
            $('.progress-value').html(value + '%');

            // Buffer for parts
            var parts = [];

            stream.on('data', function(data) {
                parts.push(data);
            });

            stream.on('end', function() {
                console.log('all parts arrived');


                var file;


              if (sequenceList[iterComp].compNum[0] == 'R') {
                    console.log("current comp: " + sequenceList[iterComp].compNum + " texName: " + sequenceList[iterComp].texName);
                    
                    switch (sequenceList[iterComp].compNum[1]) {
					 case 'h':
                             sequenceList[iterComp].shader.getElementsByTagName("texture").textureRr.getElementsByTagName("img")[0].setAttribute("src", (window.URL || window.webkitURL).createObjectURL(new Blob(parts)));
                             sequenceList[iterComp].shader.getElementsByTagName("data")[0].getElementsByTagName("int").iterComp.textContent = '0';
							break;
					 case 's':
                             sequenceList[iterComp].shader.getElementsByTagName("texture").textureRg.getElementsByTagName("img")[0].setAttribute("src", (window.URL || window.webkitURL).createObjectURL(new Blob(parts)));
                             sequenceList[iterComp].shader.getElementsByTagName("data")[1].getElementsByTagName("int").iterComp.textContent = '0';
							 break;
					 case 'v':
                             sequenceList[iterComp].shader.getElementsByTagName("texture").textureRb.getElementsByTagName("img")[0].setAttribute("src", (window.URL || window.webkitURL).createObjectURL(new Blob(parts)));
                             sequenceList[iterComp].shader.getElementsByTagName("data")[2].getElementsByTagName("int").iterComp.textContent = '0';
							 break;

					}
                    iterComp++;
                    client.send(file, {
                        name: sequenceList[iterComp].texName,
                        numComp: sequenceList[iterComp].compNum
                    });
                } else {


                    var reader = new FileReader();
                    reader.readAsArrayBuffer(new Blob(parts));
                    reader.onload = function(event) {
                        var bytes = event.target.result;
                        var pngReader = new PNGReader(bytes);
                        pngReader.parse(function(err, png) {
                          switch (sequenceList[iterComp].compNum[0]) {
							   case 'h':
							          
									sequenceList[iterComp].shader.getElementsByTagName("data")[0].getElementsByTagName("int").imageBuffer.setScriptValue(png.pixels);
							             
										
										break;
							   case 's':
							            sequenceList[iterComp].shader.getElementsByTagName("data")[1].getElementsByTagName("int").imageBuffer.setScriptValue(png.pixels);
										
										break;
							   case 'v':
							            sequenceList[iterComp].shader.getElementsByTagName("data")[2].getElementsByTagName("int").imageBuffer.setScriptValue(png.pixels);
										
										break;										
							  }
							  
                        });

                    };
                }




            });

        });

    });