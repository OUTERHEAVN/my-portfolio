// 1. HARDCODE THE KEY (Just for the demo!)
const API_KEY = "AIzaSyBGZdjZf4L5-AShOKW7ojxcSb9zD8dpWyg"; 

async function getGeminiResponse(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userMessage }] }]
            })
        });

        const data = await response.json();

        // 2. SAFETY CHECK: Ensure Gemini actually sent a reply
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            return "API Error: " + data.error.message; // Tells you exactly what Google hates
        } else {
            return "Gemini is silent. Check your API quota!";
        }
    } catch (error) {
        return "Network Error: check your internet connection.";
    }
}