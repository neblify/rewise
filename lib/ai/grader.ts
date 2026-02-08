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
          studentAnswers[`${sIndex}-${qIndex}`];
        if (q.type !== 'match_columns')
          processedStudentAnswer = processedStudentAnswer ?? 'No Answer';
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
    2. For 'fill_in_blanks', 'single_word', and 'one_sentence':
       - IGNORE case differences and trailing/leading whitespace.
       - IGNORE minor spelling mistakes if the phonetic sound is correct or it is clearly a typo (e.g. "Pythen" instead of "Python").
       - If there is a spelling mistake but the answer is otherwise correct, give PARTIAL marks (e.g. 0.5 or 0.8 marks).
       - In the feedback, mention the correct spelling if they made a mistake.
    3. For subjective (Brief Answer, etc), evaluate relevance and accuracy.
    4. Assign marks based on correctness. Partial marks allowed for subjective and spelling errors.
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
          "isCorrect": boolean, // Set to true if marksObtained > 0
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

    // Deterministic scoring for match_columns: partial marks per correct pair
    for (const item of flatQuestions) {
      if (item.type !== 'match_columns') continue;
      const correct = item.correctAnswer as number[] | undefined;
      const student = Array.isArray(item.studentAnswer) ? item.studentAnswer : [];
      if (!correct?.length) continue;
      const totalPairs = correct.length;
      let correctPairs = 0;
      for (let i = 0; i < totalPairs; i++) {
        const studentVal = i < student.length ? student[i] : -1;
        if (typeof studentVal === 'number' && studentVal >= 0 && correct[i] === studentVal)
          correctPairs++;
      }
      const marksPerPair = (item.marks || 1) / totalPairs;
      const marksObtained = Math.round(marksPerPair * correctPairs * 100) / 100;
      const res = parsed.results?.find((r: any) => r.questionId === item.id);
      if (res) {
        res.marksObtained = marksObtained;
        res.isCorrect = marksObtained > 0;
        res.feedback =
          correctPairs === totalPairs
            ? 'All pairs matched correctly.'
            : `${correctPairs} of ${totalPairs} pairs correct.`;
      }
    }
    if (parsed.results?.length) {
      parsed.totalMarksObtained = parsed.results.reduce(
        (sum: number, r: any) => sum + (r.marksObtained ?? 0),
        0
      );
      parsed.maxMarks = flatQuestions.reduce(
        (sum: number, q: any) => sum + (q.marks ?? 1),
        0
      );
    }

    return parsed;
  } catch (error) {
    console.error('AI Grading Framework Error:', error);
    return null;
  }
}
