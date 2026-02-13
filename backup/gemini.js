import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

// ai
// https://aistudio.google.com/usage?timeRange=last-28-days&project=gen-lang-client-0991593280&tab=rate-limit
const models = [
  // gemini-2.5
  { id: 0, name: "gemini-2.5-flash", usage: "10k" },
  { id: 1, name: "gemini-2.5-flash-lite", usage: "Unlimited" },
  { id: 2, name: "gemini-2.5-pro", usage: "10k" },
  // gemini-2.0
  { id: 3, name: "gemini-2.0-flash", usage: "Unlimited" },
  { id: 4, name: "gemini-2.0-flash-lite", usage: "Unlimited" },
  { id: 5, name: "gemini-2.0-flash-exp", usage: "500" },
  // gemma-3
  { id: 6, name: "gemma-3-12b", usage: "14.4K" },
  { id: 7, name: "gemma-3-27b", usage: "14.4K" },
];

export async function getAddedItemDetails(bodyText, modelId = 0) {
  try {
    let model = models.find((m) => m.id === modelId).name;
    const response = await ai.models.generateContent({ model, contents: bodyText });
    let responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let cleanedText = responseText
      .replace(/^```json\s*/i, "") // strip starting ```json
      .replace(/^```\s*/i, "") // strip starting ``` (without json)
      .replace(/```$/i, "") // strip trailing ```
      .trim();
    let parsed = JSON.parse(cleanedText);
    if (!Array.isArray(parsed)) return; // check array output
    return parsed;
  } catch (error) {
    console.error("Error fetching Gemini content:", error.message);
    throw error;
  }
}

export function generateNichesPrompt(category, itemsPerRequest = 100, promptJsonOutputFormat) {
  const outputFormat =
    promptJsonOutputFormat == "arrayOfStrings"
      ? `
    productName: '<string>',
    - Convert it into a JSON array of strings with the exact structure:
    as an array of strings
    ['<productName1 string>' , '<productName2 string>', '<productName3 string>'];
    `
      : promptJsonOutputFormat == "arrayOfObjects_productName_keywords_description"
      ? `
  - keywords is a list of keywords that describe the product idea, also add related keywords and kewywords may result a better search results like 'funny','cute','kids','girly'.'stylish' and this words only for example , you add whatever suits the product.
  - Convert it into a JSON array of strings with the exact structure:
    [{ productName: '<string>', keywords: '<string>[]', description: '<string>' }];`
      : "";

  const prompt = `
  Hello! Iam doing product research to sell on Amazon as FBA Amazon Seller.
  I am new to selling on Amazon and need step-by-step product discovery and validation help.
  I will provide a single category where you should focus on.

  Task: generate me {{ItemsPerRequest}} distinct niche / sub-niche product ideas that belong to or closely relate to {{Category}}
  specifically within Products, Gadgets, and Accessories.
  For each idea include the fields below.
  If you are unsure about any numeric estimate, mark it clearly with [UNCERTAIN] and explain why.

  - Required output format (JSON array):
  - productName is short 2-4 words that describe the product idea and should be very descriptive.
  ${outputFormat}
  - IF any change happened in the json structure my backend will not work properly and may collapse.
  - The response must contain ONLY valid JSON. No explanations, no markdown, no extra text.
  - RESONSE SHOULD BE ONLY VALID JSON ARRAY AS I WILL USE IT DIRECTLY IN MY BACKEND

  Constraints & filters (apply to results unless you explicitly state an exception):
  - Target product type: physical goods only.
  - No batteries or electronic power sources (must be passive or mechanical).
  - Prefer evergreen demand (steady year-round).
  - Price expectation: ideally retail between $20-$40 (but also include items outside if strongly justified).
  - Prioritize low-to-moderate competition and search demand is prefered but not a constraint.
  - Produce diverse ideas (don't repeat variants of the same product unless the use-case or niche is meaningfully different).
  `;
  return prompt.replace("{{Category}}", category).replace("{{ItemsPerRequest}}", itemsPerRequest);
}

export function generateProductsPrompt(category, itemsPerRequest = 100, promptJsonOutputFormat) {
  const outputFormat =
    promptJsonOutputFormat == "arrayOfStrings"
      ? `
    productName: '<string>',
    - Convert it into a JSON array of strings with the exact structure:
    as an array of strings
    ['<productName1 string>' , '<productName2 string>', '<productName3 string>'];
    `
      : promptJsonOutputFormat == "arrayOfObjects_productName_keywords_description"
      ? `
  - keywords is a list of keywords that describe the product idea, also add related keywords and kewywords may result a better search results like 'funny','cute','kids','girly'.'stylish' and this words only for example , you add whatever suits the product.
  - Convert it into a JSON array of strings with the exact structure:
    [{ productName: '<string>', keywords: '<string>[]', description: '<string>' }];`
      : "";

  const prompt = `
  Hello! Iam doing product research to sell on Amazon as FBA Amazon Seller.
  I am new to selling on Amazon and need step-by-step product discovery and validation help.
  I will provide a single category where you should focus on.

  Task: generate me {{ItemsPerRequest}} distinct product ideas that belong to or closely relate to {{Category}}
  specifically within Products, Gadgets, and Accessories.
  For each idea include the fields below.

  - Required output format (JSON array):
  - products Names is short 2-4 words that describe the product idea and should be very descriptive.
  -  better search results like '8 ball bean bag','cow mug','spongebob rug', 'minions trash can', and this words only for example , you find please whatever fits.
  ${outputFormat}
  - IF any change happened in the json structure my backend will not work properly and may collapse.
  - The response must contain ONLY valid JSON. No explanations, no markdown, no extra text.
  - RESONSE SHOULD BE ONLY VALID JSON ARRAY AS I WILL USE IT DIRECTLY IN MY BACKEND

  Constraints & filters (apply to results unless you explicitly state an exception):
  - Target product type: physical goods only.
  - Prioritize low-to-moderate competition and search demand is prefered but not a constraint.
  - Produce diverse ideas (don't repeat variants of the same product unless the use-case or niche is meaningfully different).
  `;
  return prompt.replace("{{Category}}", category).replace("{{ItemsPerRequest}}", itemsPerRequest);
}

export function filterProductsIdeasPrompt(category, itemsPerRequest = 100) {
  const prompt = `
  Hello! Iam doing product research to sell on Amazon as FBA Amazon Seller.
  I am new to selling on Amazon and need step-by-step product discovery and validation help.
  I will provide prdocuts i have found and i need to select top 20 of them.

  For each idea include the fields below.

  - Required output format (JSON array):
  - Convert it into a JSON array of strings with the exact structure: [product:<string>, selectingReson:<string>]
  - The response must contain ONLY valid JSON. No explanations, no markdown, no extra text.
  - RESONSE SHOULD BE ONLY VALID JSON ARRAY AS I WILL USE IT DIRECTLY IN MY BACKEND

  Constraints & filters (apply to results unless you explicitly state an exception):
  - Target product type: physical goods only.
  - No batteries or electronic power sources (must be passive or mechanical).
  - Prefer evergreen demand (steady year-round).
  - Price expectation: ideally retail between $20-$30 (but include items slightly outside if strongly justified).
  - Prioritize low-to-moderate competition and search demand.
  - Produce diverse ideas (don't repeat variants of the same product unless the use-case or niche is meaningfully different).

  here it the products list:

  `;
  return prompt.replace("{{Category}}", category).replace("{{ItemsPerRequest}}", itemsPerRequest);
}
