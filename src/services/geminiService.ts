import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_CREATELINK || "";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

export async function generateCampaignPitch(
  creator: any,
  campaign: any
) {
  if (!apiKey) {
    return `Hi, I'm really excited about your video editor role! With my experience in tech/lifestyle content creation, I can edit snappy Reels and clean vlog videos. My engagement rates are consistently strong, and I have a great sense of pacing and sound design that aligns perfectly with your channel's vibe. Let's collaborate!`;
  }
  try {
    const prompt = `
Generate a professional creator application pitch.

Creator:
${JSON.stringify(creator, null, 2)}

Campaign/Hiring Request:
${JSON.stringify(campaign, null, 2)}

Requirements:
- 100-150 words
- Professional yet engaging
- Personalized
- Sound natural and enthusiastic
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Hi, I'm really excited about your video editor role! With my experience in tech/lifestyle content creation, I can edit snappy Reels and clean vlog videos. My engagement rates are consistently strong, and I have a great sense of pacing and sound design that aligns perfectly with your channel's vibe. Let's collaborate!`;
  }
}

export async function testGemini() {
  if (!apiKey) return;
  try {
    const result = await model.generateContent(
      "Say hello from Gemini in one sentence."
    );
    console.log(result.response.text());
  } catch (e) {
    console.error(e);
  }
}