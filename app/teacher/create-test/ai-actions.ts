'use server';

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateQuestionsAI(topic: string, count: number, type: string, difficulty: string, board: string, grade: string) {
    if (!process.env.GROQ_API_KEY) {
        return { error: "AI Service Unavailable (Missing Key)" };
    }

    const prompt = `
    You are an expert exam setter for ${board} Board, Grade ${grade}.
    Generate ${count} ${difficulty} questions on the topic: "${topic}".
    
    Question Type: ${type}
    
    Output must be a strictly valid JSON array of question objects matching this TypeScript interface:
    
    interface Question {
        text: string;
        type: string; // Must be one of: 'mcq', 'fill_in_blanks', 'true_false', 'match_columns', 'single_word', 'brief_answer'
        options?: string[]; // Required for 'mcq' (4 options)
        correctAnswer: string; 
        marks: number; // Suggest marks based on difficulty (1-5)
    }

    Notes:
    - For 'mcq', provide 4 options in 'options' array.
    - For 'true_false', options should be ignored, correctAnswer must be "True" or "False".
    - For 'match_columns', provide pairs in 'options' array like ["A - 1", "B - 2"].
    - Ensure questions are academic and appropriate.
    
    Respond ONLY with the JSON array.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant that generates exam questions in strict JSON format." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        console.log("AI Generation Result:", content);

        if (!content) throw new Error("No content");

        const parsed = JSON.parse(content);

        // Handle if AI returns { questions: [...] } or just [...]
        const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

        // Post-processing to ensure compatibility
        const sanitizedQuestions = questions.map((q: any) => ({
            id: Date.now() + Math.random(), // Temporary ID
            text: q.text,
            type: type === 'mixed' ? q.type : type, // Fallback if mixed
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            marks: q.marks || 1,
        }));

        return { data: sanitizedQuestions };

    } catch (error) {
        console.error("AI Gen Error:", error);
        return { error: "Failed to generate questions. Please try again." };
    }
}
