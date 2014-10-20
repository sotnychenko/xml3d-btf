
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

public class Main {
 public static final String inFileName = "D:\\btfs\\wool\\3_8\\";

  static int imageSize = 256;
  static int numV = 81;
  static int blockSize = 3;
  static int numFrames = numV*blockSize;
  static int numComp = 8;
  static float Lsize = 2048f;
  static float Rsize = 256f;
  static int imageN = 0;        // input number to test
  public static void main(String[] args) throws IOException {

	  File fileL = new File(inFileName+"L.png");
	  BufferedImage imageL = ImageIO.read(fileL);

	  File fileR = new File(inFileName+"R.png");
	  BufferedImage imageR = ImageIO.read(fileR);
      
	  int[] data = new int[imageSize*imageSize];
	  
	  float[] vecL = new float[4];
	  float[] vecR = new float[4];
	  float[] color = new float[3];
	
	  
	  int blockN =(int)Math.floor(imageN/numFrames);

	  float[] sigma = new float[4];
	  for(int i=0; i<imageSize;i++)
	 
		 for(int j=0; j< imageSize; j++)	  
	  {
			  color[0]=0.f;
			  color[1]=0.f;
			  color[2]=0.f;
			 
			//  System.out.println("index "+index+" xL "+xL+" yL "+yL);
			//  System.out.println("xL"+xL);
		 for(int k=0; k< numComp/4; k++)
		 {   
			  float index =   (blockN)*(imageSize*imageSize)*numComp/4+ (i*imageSize+j)*(numComp/4)+k;
		 //  System.out.println("index"+index);
			  float x = (float) Math.floor(index/(Lsize));
			
			  float y = index-x*Lsize;
				
		 // System.out.println("yL: "+((int)yL));
		 //	System.out.println("xL: "+(int)xL);
			 int comp = imageL.getRGB( (int)y,(int)x);

			  int alpha = comp>> 24 & 0xFF;
		      int red = comp>> 16 & 0xFF;
		      int green = comp>> 8 & 0xFF;
		      int blue = comp>> 0 & 0xFF;
		      
		      		 
		      /*vecL[0]=	((float)red/100.0f )-1.0f;
		      vecL[1]=	((float)green/100.0f )-1.0f;
		      vecL[2]=	((float)blue/100.0f )-1.0f;
		      vecL[3]=	((float)alpha/100.0f )-1.0f;
		      */
		      vecL[0]=	2.f*((float)red/255.0f )-1.0f;
		      vecL[1]=	2.f*((float)green/255.0f )-1.0f;
		      vecL[2]=	2.f*((float)blue/255.0f )-1.0f;
		      vecL[3]=	2.f*((float)alpha/255.0f )-1.0f;
		    
		      imageL.getRGB( (int)y,(int)x);
		      index = ((numComp/4)*3*numFrames*(numV/blockSize))+(blockN*numComp+k*4)/2;
		       x = (float) Math.floor(index/Rsize);
			   y = index-x*Rsize;
	    
	    	   comp = imageR.getRGB(  (int)y,(int)x);
	    	   alpha = comp>> 24 & 0xFF;
			   red = comp>> 16 & 0xFF;
			   green = comp>> 8 & 0xFF;
			   blue = comp>> 0 & 0xFF;
			       
			   sigma[0] = composeSigma(red,green);
			   sigma[1] = composeSigma(blue,alpha);
			       		       
			   index = index+1;
			   x = (float) Math.floor(index/Rsize);
			   y = index-x*Rsize;
		    
		       comp = imageR.getRGB(  (int)y,(int)x);
		       alpha = comp>> 24 & 0xFF;
			   red = comp>> 16 & 0xFF;
			   green = comp>> 8 & 0xFF;
			   blue = comp>> 0 & 0xFF;
				       
			   sigma[2] = composeSigma(red,green);
			   sigma[3] = composeSigma(blue,alpha);
		      
		      vecL[0]*=sigma[0];
		      vecL[1]*=sigma[1];
		      vecL[2]*=sigma[2];
		      vecL[3]*=sigma[3];
		      
		//    System.out.println(vecL[0]+" "+vecL[1]+" "+vecL[2]+" "+vecL[3]+" ");
		      for(int c=0; c<3; c++)
		      {
		    	  index = imageN*3*numComp/4+k+c*numComp/4;
				   x = (float) Math.floor(index/Rsize);
				   y = index-x*Rsize;
		    
		    	   comp = imageR.getRGB(  (int)y,(int)x);
		    	   
		
				   alpha = comp>> 24 & 0xFF;
			       red = comp>> 16 & 0xFF;
			       green = comp>> 8 & 0xFF;
			       blue = comp>> 0 & 0xFF;
			      	 
			       vecR[0]=	2.f*((float)red/255.0f )-1.0f;
				   vecR[1]=	2.f*((float)green/255.0f )-1.0f;
				   vecR[2]=	2.f*((float)blue/255.0f )-1.0f;
				   vecR[3]=	2.f*((float)alpha/255.0f )-1.0f;
              
			      color[c]+=dot(vecL,vecR);
		    	 
		      }
		
		      
		 
		 }
		   	int r = (int) (color[0]*255.0f+.5f);
	    	int g = (int) (color[1]*255.0f+.5f);
	    	int b = (int) (color[2]*255.0f+.5f);
	     	 
			 if(r<0) r=0;
			 if(g<0) g=0;
			 if(b<0) b=0;
			 if(r>255) r=255;
			 if(g>255) g=255;
			 if(b>255) b=255;
							
			 data[i*imageSize+j] = r << 16 | g << 8 | b;
		   
	  }
	
	  writeImage("test.png",data);

    System.out.println("...done");

    
  }
  private static float composeSigma(int red, int green) {
	// TODO Auto-generated method stub	  
	return (float)red*10f + (float)green*.1f;
}
private static float dot(float[] vecL, float[] vecR) {
	return(vecL[0]*vecR[0]+vecL[1]*vecR[1]+vecL[2]*vecR[2]);
	
}
public static void writeImage(String outputFileName,int[] data){
	  	     	        	    
	     try {
           BufferedImage img = new BufferedImage(imageSize,imageSize,  BufferedImage.TYPE_INT_RGB);
           img.getWritableTile(0, 0).setDataElements(0, 0, imageSize,imageSize, data);
           ImageIO.write(img, "PNG", new File(outputFileName));
       } catch (IOException e) {
       }
	        
	}
}