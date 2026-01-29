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

    const prompt = `Analyze this civic issue photo and return ONLY valid JSON:
    
Categories: ["Roads & Potholes", "Street Lights", "Water Supply", "Drainage", "Garbage", "Public Safety", "Noise Pollution", "Other"]

Return exactly this JSON structure:
{
  "category": "matching category from list",
  "confidence": number,
  "title": "short title",
  "description": "1-sentence context",
  "priority": "low/medium/high/urgent",
  "authority": {
    "title": "Responsible Authority Name",
    "department": "department name"
  }
}`;

    // Note: We'll use the URL in the prompt for efficiency, 
    // but Gemini can also take inline_data if provided.
    const body = {
      contents: [{
        parts: [
          { text: `${prompt}\n\nImage URL: ${imageUrl}` }
        ]
      }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1
      }
    };

    // If base64 is available and we want to send the raw data too:
    if (base64Data) {
      body.contents[0].parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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

    return JSON.parse(textResponse.trim());
  }

  /**
   * Complete pipeline - Image Data → Enhanced Issue Object
   */
  static async processCivicImage(imageData) {
    try {
      console.log('📸 Uploading to ImageBB...');
      const imageUrl = await this.uploadToImgBB(imageData);
      console.log('Image URL:', imageUrl);

      console.log(' Analyzing with Gemini...');
      const analysis = await this.analyzeWithGemini(imageUrl, imageData);

      const civicIssue = {
        imageUrl,
        ...analysis,
        timestamp: new Date().toISOString(),
        status: 'analyzed'
      };

      console.log('✅ AI Analysis Result:');
      console.table(civicIssue);

      return civicIssue;

    } catch (error) {
      console.error(' AI Analysis failed:', error);
      return null;
    }
  }
}

export default CivicIssueAnalyzer;
