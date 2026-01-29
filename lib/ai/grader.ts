import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function gradeTestWithAI(
  test: any,
  studentAnswers: Record<string, any>
) {
  // Flatten sections to a single list of questions for grading context
  let flatQuestions: any[] = [];

  if (test.sections && test.sections.length > 0) {
    test.sections.forEach((sec: any, sIndex: number) => {
      sec.questions.forEach((q: any, qIndex: number) => {
        const normalize = (str: string) =>
          str ? str.toString().trim().toLowerCase() : '';

        let processedStudentAnswer =
          studentAnswers[`${sIndex}-${qIndex}`] || 'No Answer';
        const processedCorrectAnswer = q.correctAnswer;

        // Special handling for Fill in the Blanks to ignore strict case/space issues
        if (q.type === 'fill_in_blanks') {
          if (
            normalize(processedStudentAnswer) ===
            normalize(processedCorrectAnswer)
          ) {
            // If they match loosely, send the EXACT correct answer to AI so it doesn't complain
            processedStudentAnswer = processedCorrectAnswer;
          } else {
            // Otherwise just trim it
            processedStudentAnswer = processedStudentAnswer.toString().trim();
          }
        }

        flatQuestions.push({
          id: `${sIndex}-${qIndex}`, // Unique ID matching frontend
          text: q.text,
          type: q.type,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          studentAnswer: processedStudentAnswer,
          sectionTitle: sec.title,
        });
      });
    });
  } else if (test.questions) {
    // Legacy fallback
    flatQuestions = test.questions.map((q: any, i: number) => {
      const normalize = (str: string) =>
        str ? str.toString().trim().toLowerCase() : '';
      let processedStudentAnswer = studentAnswers[i] || 'No Answer';
      const processedCorrectAnswer = q.correctAnswer;

      if (q.type === 'fill_in_blanks') {
        if (
          normalize(processedStudentAnswer) ===
          normalize(processedCorrectAnswer)
        ) {
          processedStudentAnswer = processedCorrectAnswer;
        } else {
          processedStudentAnswer = processedStudentAnswer.toString().trim();
        }
      }

      return {
        id: i.toString(),
        text: q.text,
        type: q.type,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        studentAnswer: processedStudentAnswer,
      };
    });
  }

  const prompt = `
    You are an expert teacher grading a student's test.
    
    Test Title: ${test.title}
    Subject: ${test.subject}
    Board: ${test.board || 'N/A'}
    Grade: ${test.grade || 'N/A'}

    Instructions:
    1. Evaluate each answer. For objective questions (MCQ, True/False, Match), check strict correctness. 
    2. For 'fill_in_blanks', IGNORE case differences and trailing/leading whitespace. If the word is correct but capitalized differently, mark it FULLY CORRECT with no negative feedback.
    3. For subjective (Brief Answer, etc), evaluate relevance and accuracy.
    4. Assign marks based on correctness. Partial marks allowed for subjective.
    5. Provide brief feedback for each answer if incorrect or could be improved.
    6. Identify weak areas based on wrong answers.
    7. Provide overall feedback.

    Questions & Answers:
    ${JSON.stringify(flatQuestions, null, 2)}

    Output Format (JSON strictly):
    {
      "results": [
        {
          "questionId": string, // Use the exact "id" provided in input
          "isCorrect": boolean,
          "marksObtained": number,
          "feedback": string
        }
      ],
      "totalMarksObtained": number,
      "maxMarks": number,
      "weakAreas": string[],
      "overallFeedback": string
    }
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful grading assistant. Respond only in valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content from AI');

    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('AI Grading Framework Error:', error);
    return null;
  }
}
