// Replace 'YOUR_API_KEY' with the actual key from Google AI Studio
const GEMINI_API_KEY = "AIzaSyBGZdjZf4L5-AShOKW7ojxcSb9zD8dpWyg"; 

async function getGeminiResponse(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [{ text: `You are Caleb's portfolio assistant. Answer this: ${userMessage}` }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        // This navigates the "JSON tree" to get the text
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "I'm thinking, but I can't find the words. Try again!";
        }
    } catch (error) {
        console.error("AI Error:", error);
        return "I'm having trouble connecting to my AI brain.";
    }
}

// This function handles the UI part (sending/receiving)
async function sendMessage() {
    const inputField = document.getElementById('chat-input'); // Make sure your ID matches!
    const chatWindow = document.getElementById('chat-window');
    const message = inputField.value.trim();

    if (!message) return;

    // 1. Show user message
    chatWindow.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
    inputField.value = '';

    // 2. Show "Thinking..." state
    const loadingId = "loading-" + Date.now();
    chatWindow.innerHTML += `<p id="${loadingId}"><em>Caleb's AI is thinking...</em></p>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // 3. Get actual AI response
    const aiResponse = await getGeminiResponse(message);

    // 4. Replace "Thinking..." with real response
    document.getElementById(loadingId).remove();
    chatWindow.innerHTML += `<p><strong>Caleb AI:</strong> ${aiResponse}</p>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
}