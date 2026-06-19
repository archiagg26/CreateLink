import { GoogleGenerativeAI } from "@google/generative-ai";

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

export async function generateCampaignPitch(
  creator: any,
  campaign: any
) {
  const prompt = `
Generate a professional creator application pitch.

Creator:
${JSON.stringify(creator, null, 2)}

Campaign:
${JSON.stringify(campaign, null, 2)}

Requirements:
- 150-200 words
- Professional
- Personalized
- Mention relevant portfolio work
- Explain audience fit
- Sound natural
`;

  const result = await model.generateContent(prompt);

  return result.response.text();
}

console.log(import.meta.env.VITE_CREATELINK); // Log the environment variable to verify it's being read correctly

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_CREATELINK
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

export async function testGemini() {
  const result = await model.generateContent(
    "Say hello from Gemini in one sentence."
  );

  console.log(result.response.text());
}