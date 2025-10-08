// src/utils/api.js
export async function getGeminiSuggestions(imageBase64 = null, emotion = "") {
  try {
    const response = await fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64, emotion })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json(); // expected: { suggestions: "..." }
    return data;
  } catch (error) {
    console.error("❌ Error calling Gemini suggestions API:", error);
    throw error;
  }
}
