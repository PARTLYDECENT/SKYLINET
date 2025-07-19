// Vercel will automatically turn this into a serverless function
export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method not allowed' });
    }

    const userMessage = request.body.message;

    // This is where you securely get your API key from Vercel's environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error("Gemini API Error:", errorBody);
            throw new Error('Failed to fetch from Gemini API');
        }

        const geminiData = await geminiResponse.json();
        const botReply = geminiData.candidates[0].content.parts[0].text;

        // Send the reply back to the frontend
        response.status(200).json({ reply: botReply });

    } catch (error) {
        console.error(error);
        response.status(500).json({ message: "Error processing your request" });
    }
}
