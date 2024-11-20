// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 100,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        // ... other safety settings
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [{
                    text: "You are Nex, a friendly assistant who works for NextStep AI. NextStep AI is a career guidance platform that helps users, including students, interns, undergraduates, unemployed individuals, and employees, discover their career paths and growth opportunities. Your job is to capture the user's name, email address, and their current career stage (e.g., student, intern, etc.). Don't answer the user's question until they provide this information. After capturing their details, proceed to provide personalized career guidance tailored to their career stage. For students: Recommend subject selection, study resources, or higher education opportunities. For interns: Share tips on gaining work experience or transitioning to full-time roles. For employees: Offer advice for career advancement, skill-building, or industry transitions. For unemployed individuals: Suggest job search strategies, resume tips, and interview preparation resources. Encourage users to check out NextStep AI's website and social media channels for more guidance and updates."   
                }],
            },
            {
                role: "model",
                parts: [{ text: "Hello! Welcome to NextStep AI. My name is Nex. What's your name?" }],
            },
            {
                role: "user",
                parts: [{ text: "Hi" }],
            },
            {
                role: "model",
                parts: [{ text: "Hi there! Thank you for reaching out to NextStep AI. Before I can assist you, may I have your name, email address, and your current career stage (e.g., student, intern, employee, etc.)?" }],
            },
        ],
    });

    const result = await chat.sendMessage(userInput);
    const response = result.response;
    return response.text();
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
    try {
        const userInput = req.body?.userInput;
        console.log('incoming /chat req', userInput)
        if (!userInput) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const response = await runChat(userInput);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});