import React from "react";

interface Question {
  question: string;
  Score: string;
  calc_method: string;
}

interface Score {
  category_name: string;
  questions?: Question[];
}

interface Survey {
  survey_id: number;
  teamId: number;
  scores: Score[];
}

interface Summary {
  question: string;
  aggregatedAnswers: string[];
  summary: string;
  highlights: string[];
}

interface AggregateQuestionSummarizerProps {
  data: Survey[];
}

// Helper function to extract highlights
const extractHighlights = (answers: string[]): string[] => {
  const highlights: Set<string> = new Set();
  answers.forEach((answer) => {
    const sentences = answer.match(/[^.!?]+[.!?]+/g) || [answer];
    sentences.forEach((sentence) => highlights.add(sentence.trim()));
  });
  return Array.from(highlights);
};

// Helper function to summarize answers
const generateSummary = (answers: string[]): string => {
  const wordCounts: { [key: string]: number } = {};
  answers.forEach((answer) => {
    const words = answer.split(/\s+/);
    words.forEach((word) => {
      const cleanedWord = word.toLowerCase().replace(/[^\w]/g, "");
      if (cleanedWord.length > 3) {
        wordCounts[cleanedWord] = (wordCounts[cleanedWord] || 0) + 1;
      }
    });
  });

  const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
  const topWords = sortedWords.slice(0, 5).map(([word]) => word);

  return `Top themes: ${topWords.join(", ")}`;
};

const AggregateQuestionSummarizer: React.FC<AggregateQuestionSummarizerProps> = ({ data }) => {
  const summarizeAggregateQuestions = (data: Survey[]): Summary[] => {
    const questionMap: { [key: string]: string[] } = {};

    data.forEach((survey) => {
      survey.scores.forEach((score) => {
        score.questions?.forEach((question) => {
          if (question.calc_method === "Aggregate" && question.Score) {
            const trimmedAnswers = question.Score.split("\n").map((answer) => answer.trim());
            if (!questionMap[question.question]) {
              questionMap[question.question] = trimmedAnswers;
            } else {
              questionMap[question.question] = questionMap[question.question].concat(trimmedAnswers);
            }
          }
        });
      });
    });

    return Object.entries(questionMap).map(([question, answers]) => ({
      question,
      aggregatedAnswers: answers,
      summary: generateSummary(answers),
      highlights: extractHighlights(answers),
    }));
  };

  const summaries = summarizeAggregateQuestions(data);

  return (
    <div>
      
      {summaries.map((summary, index) => (
        <div key={index} style={{ marginBottom: "1.5rem" }}>
          <h3>{summary.question}</h3>
          <p>
            <strong>Summary:</strong> {summary.summary}
          </p>
          <div>
            <h4>Highlights:</h4>
            <ul>
              {summary.highlights.map((highlight, highlightIndex) => (
                <li key={highlightIndex}>{highlight}</li>
              ))}
            </ul>
          </div>
         
        </div>
      ))}
    </div>
  );
};

export default QuestionSummarizer;
