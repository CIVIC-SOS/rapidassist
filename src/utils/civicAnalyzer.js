const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const IMGBB_API_KEY = '7099a56971e1a7afff04ea2e1dd494a2';

class CivicIssueAnalyzer {
  /**
   * Uploads an image (base64 or blob) to ImageBB.
   */
  static async uploadToImgBB(imageData) {
    // If it's a data URL, extract the base64 part
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    const formData = new FormData();
    formData.append('image', base64Data);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=7099a56971e1a7afff04ea2e1dd494a2`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    if (!data.success) throw new Error('ImageBB upload failed');

    return data.data.url;
  }

  /**
   * Gemini analyzes image → Structured JSON
   */
  static async analyzeWithGemini(imageUrl, base64Data = null) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('Gemini API key not configured.');
      return null;
    }

    const categories = ["Roads & Potholes", "Street Lights", "Water Supply", "Drainage", "Garbage", "Public Safety", "Noise Pollution", "Other"];

    const prompt = `Analyze this civic issue photo and return ONLY valid JSON.
    
IMPORTANT: The "category" field MUST be EXACTLY one of these values: ${JSON.stringify(categories)}.
Do not use any other category names.

Return exactly this JSON structure:
{
  "category": "one of the allowed strings",
  "confidence": number,
  "title": "short title summarizing the issue",
  "description": "1-2 sentence detailed context about what is visible in the photo",
  "priority": "low/medium/high/urgent",
  "authority": {
    "title": "Responsible Authority Name (e.g., Muniacipal Corporation)",
    "department": "department name (e.g., Public Works)"
  }
}`;

    // Construct contents with prompt and image
    const parts = [{ text: prompt }];

    if (base64Data) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
        }
      });
    } else {
      // Fallback if no base64, though less ideal for multimodal
      parts.push({ text: `Image URL for reference: ${imageUrl}` });
    }

    const body = {
      contents: [{ parts }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2
      }
    };


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) throw new Error('Empty response from AI');

    try {
      // Handle potential markdown backticks in response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : textResponse;
      const parsed = JSON.parse(jsonString.trim());

      // Ensure category matches exactly
      if (parsed.category && !categories.includes(parsed.category)) {
        // Find closest match or default to 'Other'
        const lowerCat = parsed.category.toLowerCase();
        const fallback = categories.find(c => lowerCat.includes(c.toLowerCase())) || 'Other';
        parsed.category = fallback;
      }

      return parsed;
    } catch (e) {
      console.error('JSON Parse Error:', e, 'Response:', textResponse);
      throw new Error('Failed to parse AI analysis result');
    }
  }

  /**
   * Generates a concise emergency summary for a user based on their profile data.
   */
  static async generateUserSummary(userData) {
    console.log('🔑 API Key Present:', !!GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE')

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('Gemini API key not configured.');
      return 'Emergency summary unavailable (AI Key missing).';
    }

    const prompt = `
      Create a concise (2-3 lines) emergency medical summary for a first responder.
      
      Part 1: Summarize critical medical conditions, allergies, and blood type.
      Part 2: Predict ONE critical complication this person might face in a severe accident based on their data (e.g., "Risk of excessive bleeding due to..." or "Airway compromise risk due to...").

      User Data:
      Name: ${userData.fullName}
      Age: ${new Date().getFullYear() - new Date(userData.dob).getFullYear()}
      Blood Group: ${userData.bloodGroup}
      Medical Conditions: ${Object.entries(userData.medicalConditions || {})
        .filter(([_, exists]) => exists)
        .map(([condition]) => condition)
        .join(', ') || 'None'}
      Allergies: ${userData.allergies || 'None'}
      
      Output format: Plain text, urgent tone, no markdown formatting.
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 100
            }
          })
        }
      );

      const result = await response.json();
      const summary = result.candidates?.[0]?.content?.parts?.[0]?.text;

      return summary || 'Emergency summary generation failed.';
    } catch (error) {
      console.error('AI Summary Generation Failed:', error);
      return 'Emergency summary unavailable.';
    }
  }

  /**
   * Complete pipeline - Image Data → Enhanced Issue Object
   * Optimized for Gemini Free Tier (Single Call)
   */
  static async processCivicImage(imageData) {
    try {
      console.log('📸 [CivicAnalyzer] Starting analysis pipeline...');

      // 1. Upload to ImageBB first (required for the persistent image URL)
      const imageUrl = await this.uploadToImgBB(imageData);
      console.log('☁️ [CivicAnalyzer] Image hosted at:', imageUrl);

      // 2. Perform AI analysis (The single Gemini call)
      console.log('🤖 [CivicAnalyzer] Invoking Gemini 2.5 Flash (One-shot)...');
      const analysis = await this.analyzeWithGemini(imageUrl, imageData);

      if (!analysis) {
        throw new Error('AI returned no usable data');
      }

      console.log('✅ [CivicAnalyzer] AI analysis successfully parsed.');

      const result = {
        imageUrl,
        ...analysis,
        timestamp: new Date().toISOString(),
        status: 'analyzed'
      };

      // Table log for easy debugging in dev tools
      console.table(result);
      return result;

    } catch (error) {
      console.error('❌ [CivicAnalyzer] Pipeline failed:', error.message);
      // Ensure we log the actual error for the user to see in console
      return null;
    }
  }
}

export default CivicIssueAnalyzer;