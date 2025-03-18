import { NextResponse } from 'next/server';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// This is a simulated waifu generator API
// In a production environment, you would integrate with the actual Perchance API
export async function POST(request) {
  try {
    // Verify API key is available
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not configured. Please add it to your .env.local file.');
    }

    const body = await request.json();
    const { description, antiDescription, artStyle, shape, count } = body;

    // Validate inputs
    if (!description && !artStyle) {
      throw new Error('Please provide a description or select an art style.');
    }

    // Format the prompt according to Animagine XL's preferred structure
    const basePrompt = description || "cute anime girl";
    const stylePrompt = `${artStyle.toLowerCase()}, ${shape.toLowerCase()}, masterpiece, best quality, highly detailed`;
    const prompt = `${basePrompt}, ${stylePrompt}`;
    
    const negativePrompt = antiDescription || "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";

    // Generate images using Hugging Face's inference API
    const generatedImages = [];
    const numImages = parseInt(count) || 2;
    const maxRetries = 3;

    for (let i = 0; i < numImages; i++) {
      const seed = Math.floor(Math.random() * 2147483647);
      let retryCount = 0;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          console.log(`Attempting to generate image ${i + 1}/${numImages} (attempt ${retryCount + 1}/${maxRetries})`);
          
          const response = await fetch(
            "https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  negative_prompt: negativePrompt,
                  width: 512,
                  height: 768,
                  num_inference_steps: 28,
                  guidance_scale: 7,
                  seed: seed
                }
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            
            // Check if the model is loading
            if (response.status === 503 && errorText.includes("Model is currently loading")) {
              console.log(`Model is loading, waiting before retry ${retryCount + 1}...`);
              await wait(10000); // Wait 10 seconds before retrying
              retryCount++;
              continue;
            }

            // Check for rate limiting
            if (response.status === 429) {
              console.log('Rate limit reached, waiting before retry...');
              await wait(15000); // Wait 15 seconds before retrying
              retryCount++;
              continue;
            }

            throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const blob = await response.blob();
          
          // Verify the response is an image
          if (!blob.type.startsWith('image/')) {
            throw new Error(`Invalid response type: ${blob.type}`);
          }

          const imageBuffer = await blob.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const imageUrl = `data:${blob.type};base64,${base64Image}`;
          generatedImages.push(imageUrl);
          success = true;
        } catch (error) {
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          
          if (retryCount >= maxRetries - 1) {
            throw new Error(`Failed to generate image after ${maxRetries} attempts: ${error.message}`);
          }
          
          await wait(5000); // Wait 5 seconds between retries
          retryCount++;
        }
      }
    }

    if (generatedImages.length === 0) {
      throw new Error('No images were generated successfully.');
    }

    const responseData = {
      description: prompt,
      artStyle,
      shape,
      generatedImages,
      status: "success"
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in waifu generator API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate waifu',
        message: error.message,
        details: error.stack
      },
      { status: 500 }
    );
  }
} 