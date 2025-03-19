import { NextResponse } from 'next/server';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to check if model is ready
async function checkModelStatus() {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        }
      }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
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
    console.log('Received request body:', body);

    // Validate inputs
    if (!body) {
      throw new Error('Request body is required');
    }

    const { description, antiDescription, artStyle, shape, count } = body;

    // Validate required fields
    if (!description && !artStyle) {
      throw new Error('Please provide a description or select an art style.');
    }

    // Format the prompt according to Animagine XL's preferred structure
    const basePrompt = description || "cute anime girl";
    const stylePrompt = `${artStyle?.toLowerCase() || 'anime'}, ${shape?.toLowerCase() || 'portrait'}, masterpiece, best quality, highly detailed`;
    const prompt = `${basePrompt}, ${stylePrompt}`;
    
    const negativePrompt = antiDescription || "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry";

    // Generate images using Hugging Face's inference API
    const generatedImages = [];
    const numImages = Math.min(parseInt(count) || 1, 4); // Limit to 4 images max
    const maxRetries = 5;
    const initialWaitTime = 20000;
    const maxWaitTime = 60000;

    // Check if model is ready before starting
    let modelReady = await checkModelStatus();
    if (!modelReady) {
      console.log('Model is loading, waiting for initial load...');
      await wait(initialWaitTime);
    }

    for (let i = 0; i < numImages; i++) {
      const seed = Math.floor(Math.random() * 2147483647);
      let retryCount = 0;
      let success = false;
      let waitTime = initialWaitTime;

      while (retryCount < maxRetries && !success) {
        try {
          console.log(`Attempting to generate image ${i + 1}/${numImages} (attempt ${retryCount + 1}/${maxRetries})`);
          
          const requestBody = {
            inputs: prompt,
            parameters: {
              negative_prompt: negativePrompt,
              width: 512,
              height: 768,
              num_inference_steps: 28,
              guidance_scale: 7,
              seed: seed
            }
          };

          console.log('Sending request to Hugging Face API with body:', requestBody);

          const response = await fetch(
            "https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error response: ${response.status} ${response.statusText}`, errorText);
            
            if (response.status === 503) {
              console.log(`Model is loading, waiting ${waitTime/1000} seconds before retry ${retryCount + 1}...`);
              await wait(waitTime);
              waitTime = Math.min(waitTime * 1.5, maxWaitTime);
              retryCount++;
              continue;
            }

            if (response.status === 401) {
              throw new Error('Invalid API key. Please check your HUGGINGFACE_API_KEY.');
            }

            if (response.status === 429) {
              throw new Error('Rate limit exceeded. Please try again later.');
            }

            throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const blob = await response.blob();
          
          if (!blob.type.startsWith('image/')) {
            throw new Error(`Invalid response type: ${blob.type}`);
          }

          const imageBuffer = await blob.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const imageUrl = `data:${blob.type};base64,${base64Image}`;
          generatedImages.push(imageUrl);
          success = true;
          
          waitTime = initialWaitTime;
        } catch (error) {
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          
          if (retryCount >= maxRetries - 1) {
            throw new Error(`Failed to generate image after ${maxRetries} attempts. The model might be experiencing high traffic. Please try again in a few minutes.`);
          }
          
          await wait(waitTime);
          retryCount++;
        }
      }
    }

    if (generatedImages.length === 0) {
      throw new Error('No images were generated successfully. Please try again.');
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