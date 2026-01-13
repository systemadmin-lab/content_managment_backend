/**
 * OpenRouter AI Service
 * Handles calls to OpenRouter API for content generation
 */

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

interface ContentGenerationRequest {
    prompt: string;
    contentType: 'Blog Post Outline' | 'Product Description' | 'Social Media Caption';
}

/**
 * Generate system prompt based on content type
 */
function getSystemPrompt(contentType: string): string {
    switch (contentType) {
        case 'Blog Post Outline':
            return `You are an expert content strategist. Create a detailed blog post outline with:
- An engaging title
- Introduction hook
- 5-7 main sections with subsections
- Key points to cover in each section
- Conclusion with call-to-action
Format the outline clearly with headers and bullet points.`;
        
        case 'Product Description':
            return `You are a professional copywriter specializing in e-commerce. Create a compelling product description that:
- Opens with a captivating headline
- Highlights key features and benefits
- Uses persuasive language that appeals to emotions
- Includes technical specifications if relevant
- Ends with a strong call-to-action
Keep it concise but impactful.`;
        
        case 'Social Media Caption':
            return `You are a social media expert. Create an engaging social media caption that:
- Grabs attention in the first line
- Is optimized for engagement
- Includes relevant emojis
- Has a clear call-to-action
- Suggests 3-5 relevant hashtags
Keep it concise and punchy.`;
        
        default:
            return 'You are a helpful content assistant. Please generate content based on the user request.';
    }
}

/**
 * Call OpenRouter API to generate content
 */
export async function generateContent(request: ContentGenerationRequest): Promise<string> {
    const apiKey = process.env.OPENROUTER_KEY;
    const baseUrl = process.env.BASE_URL || 'https://openrouter.ai/api/v1';
    
    if (!apiKey) {
        throw new Error('OPENROUTER_KEY is not configured');
    }

   

    const systemPrompt = getSystemPrompt(request.contentType);

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Smart Content Generator'
        },
        body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Please create a ${request.contentType.toLowerCase()} about: ${request.prompt}`
                }
            ],
            max_tokens: 1500,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenRouter API Error:');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error Response:', errorText);
        console.error('Request Headers:', {
            'Authorization': `Bearer ${apiKey.substring(0, 10)}...`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Smart Content Generator'
        });
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as OpenRouterResponse;
    
    if (!data.choices || data.choices.length === 0) {
        throw new Error('No content generated from OpenRouter API');
    }

    return data.choices[0].message.content;
}
