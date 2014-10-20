import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.Scanner;
import javax.imageio.ImageIO;

import org.jblas.FloatMatrix;
import org.jblas.Singular;



public class Main {
  public static final String inFileName = "E:\\work\\workspace\\convertToBigTexture\\WOOLdatabase\\MANYFILES\\";
  public static final String sigma = "sigma.txt";

static int imageSize = 256;
static int numV = 81;
static int blockSize = 3;
static int numFrames = numV*blockSize;
static int numComp = 8;
static int Lsize = 2048;
static int Rsize = 256;

  public static void main(String[] args) throws IOException {
    
    if(numComp%4 != 0) {System.out.println("number of components not divisible by 4!"); return;}
    if(numV%blockSize != 0) {System.out.println("wrong blockSize, it should divide numV!"); return;}
	  

	FloatMatrix A = new FloatMatrix(imageSize*imageSize,numFrames*3);
	
	int LsizeComp = (int) Math.ceil(Math.sqrt((float) (imageSize*imageSize*(numComp/4)*(numV/blockSize))));
	int RsizeComp = (int) Math.ceil(Math.sqrt((float) (numFrames*3*(numComp/4)*(numV/blockSize))));
	
	System.out.println("LsizeComp "+LsizeComp);
	System.out.println("RsizeComp "+RsizeComp);
	
	if(LsizeComp>Lsize){System.out.println("change Lsize to bigger one!"); return;}
	if(RsizeComp*RsizeComp+(numComp/2)*numV/blockSize>Rsize*Rsize){System.out.println("change Rsize to bigger one!"); return;}
	
	System.out.println("Lsize "+Lsize);
	System.out.println("Rsize "+Rsize);
	System.out.println("Compressed size approx. would be: "+((((Lsize*Lsize+Rsize*Rsize)*4)/1024)/1024)+" Mb");
	
	 int[] imageL= new int[Lsize*Lsize];
	 int[] imageR= new int[Rsize*Rsize];
	 for(int i=0; i<Lsize*Lsize; i++) imageL[i]= 255 << 24 | 0<< 16 | 0 << 8 | 0;
	 for(int i=0; i<Rsize*Rsize; i++) imageR[i]= 255 << 24 | 0<< 16 | 0 << 8 | 0;

	 
	 File yourFile = new File(sigma); 
	 yourFile.delete(); 
	 yourFile=null;
	 
		for(int i=0; i< numV/blockSize; i++)
		{
			readImages(A,i);
			A=A.div(255.0f);
			FloatMatrix result[] = doSVD(A,numFrames*3,numComp);

			imageL=writeComprData(imageL,result[0],i);
			imageR=writeComprData(imageR,result[1],i);
			
			System.gc();
		//	if(i==0) break;
		}

		writeResultImage(imageL,Lsize,"L.png");
		
		
		  @SuppressWarnings("resource")
		  Scanner scanner = new Scanner(new File("sigma.txt"));
		  scanner.useLocale(Locale.US);
	      float[] sigma = new float[numComp*numV/blockSize];
	      int i=0;
		  while(scanner.hasNextFloat()){
			  sigma[i++]=scanner.nextFloat();	

		  }
		  DecimalFormatSymbols decimalSymbol = new DecimalFormatSymbols(Locale.getDefault());
		  decimalSymbol.setDecimalSeparator('.');
		  DecimalFormat formatter = new DecimalFormat("000.0",decimalSymbol); 
		  DecimalFormat formatter2 = new DecimalFormat("0000",decimalSymbol); 
		  int dstOffset = ((numComp/4)*3*numFrames*(numV/blockSize));
		  int index=0;
		  for( i=0; i <sigma.length; i+=2)
			  
		  { 
			  String number = formatter2.format(Integer.parseInt(Float.valueOf(formatter.format(sigma[i])).toString().replaceAll("\\.", "")));
		  
			  int r = Integer.parseInt(number.substring(0, 2));
			  int g = Integer.parseInt(number.substring(2, 4));
			  number = formatter2.format(Integer.parseInt(Float.valueOf(formatter.format(sigma[i+1])).toString().replaceAll("\\.", "")));
			  
			  int b = Integer.parseInt(number.substring(0, 2));
			  int a = Integer.parseInt(number.substring(2, 4));
			  
			  
			
			imageR[dstOffset+index++] =  a << 24 | r << 16 | g << 8 | b ; 
		  }

		  writeResultImage(imageR,Rsize,"R.png");
		
     System.out.println("...done");
	
    
  }
  static void writeResultImage(int[] data, int size,String fileName)
{
	
 try{
     BufferedImage img = new BufferedImage(size,size,  BufferedImage.TYPE_INT_ARGB);
     img.getWritableTile(0, 0).setDataElements(0, 0, size,size, data);
     ImageIO.write(img, "PNG", new File(fileName));
 } catch (IOException e) {
 }
       
}
  static void readImages(FloatMatrix A,int offset)
  {      
	      File file = new File(inFileName);
	      String[] tempNames = file.list();
	      int size = numFrames/numV;
	      String[] names = new String[size];
	      int index =0;
	      for(int i=size*offset;i< size*(offset+1); i++) names[index++]=tempNames[i];
	      
		 BufferedImage originalImage = new BufferedImage(imageSize, imageSize, BufferedImage.TYPE_INT_RGB);
		 int imgCount = 0;
		 File fnew;
		 int[] imageInByte;
		 System.out.println("alloc "+offset);
	    for(String name : names)
		{				
			   if (new File(inFileName + name).isDirectory())
			   {
				  
				   File folder = new File(inFileName + name);
		
				   String[] imageList = folder.list();
				   
				 
				   for(String image : imageList)
					{
					 
					    fnew=new File(inFileName + name +"\\"+image);
					    try {
							originalImage = ImageIO.read(fnew);
						} catch (IOException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}

				       imageInByte = originalImage.getRGB(0, 0, imageSize, imageSize, null, 0, imageSize); 
				       fnew=null;
					  
					   for (int i=0; i<imageSize*imageSize; i++) {
						//   float[] hsv = new float[3];
						//   Color.RGBtoHSB(imageInByte[i]>> 16 & 0xFF,imageInByte[i]>> 8 & 0xFF,imageInByte[i]& 0xFF,hsv);
						   float[] hsv = new float[]{ imageInByte[i]>> 16 & 0xFF,imageInByte[i]>> 8 & 0xFF,imageInByte[i]& 0xFF};
						 
						     A.put(i,imgCount, hsv[0] );
					         A.put(i,imgCount+1, hsv[1] );
					         A.put(i,imgCount+2, hsv[2]);
					      
						  
					    }
					 
					imageInByte=null;
					imgCount+=3;

					if(imgCount>=numFrames*3) break;
			
					}
				   if(imgCount>=numFrames*3) break;
				   
			   }

		}
	  
	  
  }
  static int[] writeComprData(int[] data,FloatMatrix A,int offset)
  {
	   // A.print();
		int index =0;
		//System.out.println("length :"+A.length);
		int dstOffset = offset*A.length/4;
		for(int i = 0;i <A.rows;i++)
			 for(int j=0; j<A.columns; j+=4)
	    {   	/*	
				 int r= (int)( Math.round( (A.get(i,j)+1.0f)*100f));
				 int g= (int)( Math.round( (A.get(i,j+1)+1.0f)*100f));
				 int b= (int)( Math.round( (A.get(i,j+2)+1.0f)*100f));
				 int a= (int)( Math.round( (A.get(i,j+3)+1.0f)*100f));
				 */
				 
				 int r= (int)( Math.round(( (A.get(i,j)+1.0f)/2f)*255f));
				 int g= (int)( Math.round(( (A.get(i,j+1)+1.0f)/2f)*255f));
				 int b= (int)( Math.round(( (A.get(i,j+2)+1.0f)/2f)*255f));
				 int a= (int)( Math.round((  (A.get(i,j+3)+1.0f)/2f)*255f));
				 
				 data[dstOffset+index++] =  a << 24 | r << 16 | g << 8 | b ;
	    }
	  return data;
  }

  private static FloatMatrix[] doSVD(FloatMatrix A,int numFrames,int numComp) {
		// TODO Auto-generated method stub
		   numComp-=1;
		   FloatMatrix rowMeans = A.rowMeans();

		    System.out.println("mean ");
			A.subiColumnVector(rowMeans);
		   	
			FloatMatrix[] B = Singular.sparseSVD(A);
			System.out.println("svd");
			
			 System.out.println("number of c"+ numComp);
		     B[0]=B[0].getRange(0, imageSize*imageSize, 0,numComp);
		     B[1]=B[1].getRange(0, numComp, 0,1);
		     int scaleL= Math.min(-1*(int)(Math.log10(Math.abs(B[0].min()))),-1*(int)(Math.log10(Math.abs(B[0].max()))));
	         int scaleR= Math.min(-1*(int)(Math.log10(Math.abs(B[2].min()))),-1*(int)(Math.log10(Math.abs(B[2].max()))));
	         
	         if(scaleL!=0){
	             float scale =(float)Math.pow(10.0f,scaleL ); 
		         B[0]=B[0].mmul(scale); 
		         B[1].putColumn(0,  B[1].mulColumn(0, 1.0f/scale));
		         System.out.println("scaleL " + scale +"scaleL  " + 1.0f/scale);
	          }
	          if(scaleR!=0){
	              float scale =(float)Math.pow(10.0f,scaleR ); 
	    	      B[2]=B[2].mmul(scale); 
	    	      B[1].putColumn(0,  B[1].mulColumn(0, 1.0f/scale));
	    	      System.out.println("scaleR " + scale +"scaleR  " + 1.0f/scale);
	           }
	          System.out.println("min " + B[0].min() +"max  " + B[0].max());
	          FloatMatrix sigma = new FloatMatrix(numComp+1,1);
	          sigma.put(0, 1.0f);
	          for(int i=1;i<sigma.rows;i++) sigma.put(i, B[1].get(i-1));
	      
		      
	          FloatMatrix L = new FloatMatrix(imageSize*imageSize,numComp+1);
		      L.putColumn(0, rowMeans);
		      
		      for(int i=0;i<B[0].columns;i++) L.putColumn(i+1, B[0].getColumn(i));
			  B[0]=null;
			  FloatMatrix R = new FloatMatrix(numComp+1,numFrames);	
			  R.putRow(0, org.jblas.FloatMatrix.ones(numFrames));
			  B[2]=B[2].transpose().getRange(0, numComp,0,numFrames);
			  for(int i=0;i<B[2].rows;i++) R.putRow(i+1, B[2].getRow(i));
			  B[2]=null;
			  B[1]=null;
			  System.gc();

		      R=R.transpose(); 

		      FloatMatrix[] result = new FloatMatrix[2];
		      result[0] = new FloatMatrix();
		      result[1] = new FloatMatrix();
		      result[0]=L;
		      result[1]=R;
			  PrintWriter writer = null;
				

				try {
					writer = new PrintWriter(new FileOutputStream( new File("sigma.txt"),  true /* append = true */));
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} 
			 
			  for(int i=0; i <sigma.length; i++)
			      writer.println(sigma.get(i));

			  writer.close();
			 	  
		
				 
		return result;
	}
}
