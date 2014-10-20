    var select = document.getElementsByTagName('select')[0];
    select.onchange = function() {
	 mainStream.end(); 
     texName= document.getElementById("texNameId").name = select.options[select.selectedIndex].value;
	 var empty = new Uint8Array(1);
	 document.getElementById("texDataId").setScriptValue(empty);
	 document.getElementById("iterCompId").textContent = "-1";
	 document.getElementById("diffuseTexId").src ="./"+'textures/'+texName.substr(0,texName.indexOf('/'))+".png";
 	
	  var file;
      client.send(file,{name: texName, numComp: 'R'}); 
    }
