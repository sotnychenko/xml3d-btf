

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import org.json.simple.JSONObject;



import javax.imageio.ImageIO;



public class Main {
  public static final String inFileName = "C:\\Program Files (x86)\\Zend\\Apache2\\htdocs\\final\\";
  public static final String outFileName = "C:\\Program Files (x86)\\Zend\\Apache2\\htdocs\\final\\stream\\";
  static int texSize = 2048;
  static int RSize = 512;
  static int imageSize = 256;
  static int numComp = 8;
  static int blockSize = 7; 
  static int numDirections = 151; 
  static int numParts = (int)Math.round((float)numDirections/blockSize); 
  static int resultSizeW = imageSize/2;
  static int resultSizeH = (imageSize/2)*numParts;
  
public static void main(String[] args) throws IOException {

	  File fileL = new File(inFileName+"L.png");
	  BufferedImage imageL = ImageIO.read(fileL);
	  int[] imageLInByte =   imageL.getRGB(0, 0, imageL.getWidth(),imageL.getHeight(), null, 0, imageL.getWidth()); 
	  
	  
	  int[] arrayImage=readImage(imageLInByte,imageL.getWidth());
	
	  	  
	   splitL(arrayImage);

	   writeJSON();
	
	      
    System.out.println("...done");

    
  }

  @SuppressWarnings("unchecked")
private static void writeJSON() throws FileNotFoundException {
	// TODO Auto-generated method stub
	   JSONObject json = new JSONObject();
	   json.put("texSize", Integer.toString(texSize));
	   json.put("RSize", Integer.toString(RSize));
	   json.put("imageSize", Integer.toString(imageSize));
	   json.put("numComp", Integer.toString(numComp));
	   json.put("blockSize", Integer.toString(blockSize));
	   json.put("numDirections", Integer.toString(numDirections));

	   
	   try (PrintStream out = new PrintStream(new FileOutputStream(outFileName+"meta.json"))) {
		    out.print(json.toString());
		}
	
}

private static void splitL(int[] arrayImage) {
	// TODO Auto-generated method stub
	  int[] bufferImage = new int[resultSizeW*resultSizeH];
	   for(int j = 0; j<numComp; j++)
	   {
		 int index = 0;
       for(int i=0; i <resultSizeW*resultSizeH; i++)
	    {   	
   	  int r = arrayImage[(index++)*numComp+j];
   	  int g = arrayImage[(index++)*numComp+j];
   	  int b = arrayImage[(index++)*numComp+j];
   	  int a = arrayImage[(index++)*numComp+j];
   			    	 
   	   bufferImage[i] = a << 24 | r << 16 | g << 8 | b ; 
   	  
		  }
     
		  writeImage(outFileName+Integer.toString(j)+".png",bufferImage);
	   }
}

private static int[] readImage(int[] imageLInByte, int width) {
	// TODO Auto-generated method stub
	  
	  int[] arrayImage = new int[width*width*4];
	  int index = 0;
	   for(int i=0; i <width*width; i++)
	   {
		   int col = imageLInByte[i];
			
			 
			  int alpha = col>> 24 & 0xFF;
		      int red = col>> 16 & 0xFF;
		      int green = col>> 8 & 0xFF;
		      int blue = col>> 0 & 0xFF;
		      
		     
			  arrayImage[index++]=red;
		      arrayImage[index++]=green;
		      arrayImage[index++]=blue;
		      arrayImage[index++]=alpha;		      	   
	   }
	
	return arrayImage;
}

public static void writeImage(String outputFileName,int[] data){	     
	    
	     try {
        BufferedImage img = new BufferedImage(resultSizeW,resultSizeH,  BufferedImage.TYPE_INT_ARGB);
        img.getWritableTile(0, 0).setDataElements(0, 0, resultSizeW,resultSizeH, data);
        ImageIO.write(img, "PNG", new File(outputFileName));
    } catch (IOException e) {
    }
	        
	}
}