import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js";

const ai = new GoogleGenAI({
    apiKey: config.GEMINI_API_KEY,
});

export async function generateCaption(file) {
    if (!file || !file.buffer) {
        throw new Error('File buffer is missing for caption generation');
    }
    
    console.log('Generating caption for file:', file.originalname || 'unknown');
    const base64Image = Buffer.from(file.buffer).toString('base64');
    const contents = [
        {
            inlineData: {
                mimeType:file.mimetype,
                data: base64Image,
            },
        },
        { text: "Caption this image." },
    ];
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
        config:{
            systemInstruction:`
            You have to analyse the image and generate  a caption in simple text formate.
            
            You writing caption for instagram post.
            the caption should be short and use simple words.
            Use hashtags and emojis.
            `
        }

    });

    return response.text
}