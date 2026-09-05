/**
 * AI Service for Coding Guru
 * Featuring automatic multi-key failover pool across 10 Gemini API keys
 * and secondary fallback to 2 Groq API keys.
 */

// Gather all Gemini keys from environment
function getGeminiKeys() {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10,
  ].filter(k => k && k.trim().length > 0);
  return keys;
}

// Gather all Groq keys from environment
function getGroqKeys() {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
  ].filter(k => k && k.trim().length > 0);
  return keys;
}

const CPP_CP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

int main(){
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    
}`;

/**
 * Call Gemini API with a specific key
 */
async function callGemini(apiKey, systemInstruction, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemInstruction}\n\nUser Request: ${prompt}` }]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  return JSON.parse(text);
}

/**
 * Call Groq API with a specific key (Secondary Backup)
 */
async function callGroq(apiKey, systemInstruction, prompt) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const payload = {
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: `${systemInstruction}\nYou MUST return strictly valid JSON with no markdown wrapping or preamble.` },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq HTTP ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from Groq API");
  }

  return JSON.parse(text);
}

/**
 * Executes an AI prompt with the Multi-Key Failover Pool:
 * 1. Iterates through Gemini Key 1 to Key 10.
 * 2. If all Gemini keys fail or are exhausted, falls back to Groq Key 1 and Key 2.
 */
export async function executeAiWithFailover(systemInstruction, prompt) {
  const geminiKeys = getGeminiKeys();
  const groqKeys = getGroqKeys();

  let lastError = null;

  // 1. Try Gemini Pool
  for (let i = 0; i < geminiKeys.length; i++) {
    const key = geminiKeys[i];
    try {
      console.log(`[AI Service] Attempting generation with Gemini Key ${i + 1}/${geminiKeys.length}...`);
      const result = await callGemini(key, systemInstruction, prompt);
      console.log(`[AI Service] Success with Gemini Key ${i + 1}`);
      return { success: true, provider: `Gemini (Key ${i + 1})`, data: result };
    } catch (err) {
      console.warn(`[AI Service] Gemini Key ${i + 1} failed: ${err.message}. Trying next key...`);
      lastError = err;
    }
  }

  // 2. Fallback to Groq Pool
  for (let j = 0; j < groqKeys.length; j++) {
    const key = groqKeys[j];
    try {
      console.log(`[AI Service] Gemini pool exhausted. Attempting fallback with Groq Key ${j + 1}/${groqKeys.length}...`);
      const result = await callGroq(key, systemInstruction, prompt);
      console.log(`[AI Service] Success with Groq Key ${j + 1}`);
      return { success: true, provider: `Groq Backup (Key ${j + 1})`, data: result };
    } catch (err) {
      console.warn(`[AI Service] Groq Key ${j + 1} failed: ${err.message}. Trying next backup...`);
      lastError = err;
    }
  }

  throw new Error(`All AI failover keys exhausted. Last error: ${lastError?.message || "Unknown error"}`);
}

/**
 * Generates a full Coding Guru question with 10 test cases and multi-language boilerplates
 */
export async function generateQuestionFromIdea(userIdea, difficultyPreference = "Medium") {
  const systemInstruction = `You are an expert competitive programming problem setter and LeetCode problem designer.
Given a problem idea or concept, generate a complete, rigorous coding challenge in strict JSON format.

Requirements:
1. "title": Concise, professional title (e.g. "Longest Palindromic Substring")
2. "difficulty": "Easy", "Medium", or "Hard" (honor the preference if provided)
3. "tags": Space-separated tags (e.g. "String Dynamic Programming Two Pointers")
4. "description": Rich Markdown problem description including:
   - Clear problem statement
   - Input Format
   - Output Format
   - Constraints (e.g., 1 <= n <= 10^5, time limit 2s)
   - 2 clear examples with explanation
5. "testCases": An array of EXACTLY 10 test cases:
   - IDs: 1 to 10.
   - id 1 to 4 MUST have "isHidden": false (sample/public test cases)
   - id 5 to 10 MUST have "isHidden": true (hidden evaluation test cases)
   - Each test case MUST have:
     - "id": integer (1 to 10)
     - "input": string representation of input (e.g., "5 2 7 11 15" or JSON string)
     - "expectedOutput": exact expected output string
     - "explanation": brief explanation of why this output is correct
     - "isHidden": boolean
   - Test cases MUST cover: basic cases, negative numbers, edge boundary cases (minimum/maximum constraints), and large inputs.
6. "starterCode": An object containing starter code for 4 languages:
   - "javascript": Starter template
   - "python": Starter template
   - "cpp": MUST follow this competitive programming boilerplate:
${CPP_CP_TEMPLATE}
   - "java": Clean Java solution template with public class Solution

Return ONLY valid JSON matching this schema:
{
  "title": "string",
  "difficulty": "Easy|Medium|Hard",
  "tags": "string",
  "description": "string",
  "testCases": [
    { "id": 1, "input": "...", "expectedOutput": "...", "explanation": "...", "isHidden": false },
    ... exactly 10 items ...
  ],
  "starterCode": {
    "javascript": "...",
    "python": "...",
    "cpp": "...",
    "java": "..."
  }
}`;

  const prompt = `Create a complete competitive programming question based on this idea:
Idea / Concept: "${userIdea}"
Target Difficulty: "${difficultyPreference}"

Ensure exactly 10 test cases are generated and C++ code uses the Competitive Programming template!`;

  const result = await executeAiWithFailover(systemInstruction, prompt);
  return result;
}
