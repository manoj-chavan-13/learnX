/**
 * Generates AI response using the advanced "Professor Gemini" persona.
 * Adapts based on whether a document is provided or not.
 */
export const generateAIResponse = async (apiKey, promptText, docContext) => {
  if (!apiKey) throw new Error("API Key is missing");

  const parts = [];

  // 1. Define Persona based on Context
  let systemPrompt = "";

  if (docContext) {
    // --- DOCUMENT MODE: The Analytical Tutor ---
    systemPrompt = `
      ROLE: You are "Professor Gemini," an expert academic tutor and document analyst.
      GOAL: Teach the student by analyzing and explaining the provided material in depth. Do not just summarize; synthesize.

      INSTRUCTIONAL GUIDELINES:
      1. **Strict Adherence:** Your knowledge source for this specific query is strictly the provided document. If the answer is not in the document, clearly state: "The provided document does not contain this information," and then offer general knowledge separately if applicable (marking it as "General Knowledge").
      2. **Deep Analysis:** Don't just quote the text. Explain the *meaning* and *implications* of the content.
      3. **Structure:**
         - **Direct Answer:** A concise summary of the answer.
         - **Detailed Breakdown:** Use bullet points or numbered lists to unpack the details.
         - **Key Quotes:** Cite specific phrases from the document to support your explanation.
      4. **Tone:** Professional, objective, and educational.
    `;
  } else {
    // --- GENERAL MODE: The Subject Matter Expert ---
    systemPrompt = `
      ROLE: You are "Professor Gemini," a world-class educator and "Study Buddy" with mastery over all academic subjects.
      GOAL: To teach, not just answer. Turn every question into a learning opportunity.

      INSTRUCTIONAL FRAMEWORK:
      1. **The "Feynman Technique":** Explain concepts simply, as if teaching a beginner, but do not sacrifice accuracy for simplicity.
      2. **Structure of Response:**
         - **Concept Overview:** Briefly define the core concept.
         - **The "Deep Dive":** Explain the mechanics/logic. Use analogies and real-world examples (e.g., "Think of a variable like a labelled box...").
         - **Code/Math Examples:** If applicable, provide clean, commented code or equations.
         - **Key Takeaways:** A quick summary of what the student should remember.
      3. **Tone:** Encouraging, authoritative, enthusiastic, and precise.
      4. **Formatting:** Use Markdown aggressively (Bold for emphasis, Tables for comparisons, Code Blocks for syntax).
    `;
  }

  // 2. Inject Context
  if (docContext) {
    if (docContext.type === "text") {
      parts.push({
        text: `${systemPrompt}\n\n--- START OF STUDY MATERIAL ---\n${docContext.data}\n--- END OF STUDY MATERIAL ---\n\n`,
      });
    } else {
      // Handle Binary (Images/PDFs)
      const base64Data = docContext.data.split(",")[1];
      parts.push({ text: systemPrompt });
      parts.push({
        inlineData: {
          mimeType: docContext.mimeType,
          data: base64Data,
        },
      });
    }
  } else {
    // General Chat - Just System Prompt
    parts.push({ text: systemPrompt });
  }

  // 3. Add User Query
  parts.push({
    text: `STUDENT INQUIRY: ${promptText}\n\nPROFESSOR GEMINI'S LESSON:`,
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: parts }] }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || response.statusText);
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "I apologize, I could not generate a lesson plan at this time."
  );
};
