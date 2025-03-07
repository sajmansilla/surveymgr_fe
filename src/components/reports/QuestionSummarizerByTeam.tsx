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

interface SelectedTeamData {
  team_name: string;
  scores: Score[];
}

interface Highlight {
  text: string;
  percentage: number;
}

interface Summary {
  question: string;
  topHighlights: Highlight[];
  summary: string;
}

interface QuestionSummarizerProps {
  selectedTeamData: SelectedTeamData;
}

// Helper function to extract highlights
const extractHighlights = (data: SelectedTeamData): { [key: string]: string[] } => {
  const highlights: { [key: string]: string[] } = {};

  data.scores.forEach((score) => {
    score.questions?.forEach((question) => {
      if (question.calc_method === "Aggregate" && question.Score) {
        const questionHighlights = question.Score.split("\n").map((answer) => answer.trim());
        if (!highlights[question.question]) {
          highlights[question.question] = [];
        }
        highlights[question.question].push(...questionHighlights);
      }
    });
  });

  return highlights;
};

// Helper function to calculate highlight percentages
const calculateHighlightStats = (
  highlights: { [key: string]: string[] },
  totalQuestions: number
): { [key: string]: Highlight[] } => {
  const stats: { [key: string]: Highlight[] } = {};

  Object.entries(highlights).forEach(([question, answers]) => {
    const counts: { [key: string]: number } = {};

    // Count occurrences of each highlight
    answers.forEach((answer) => {
      counts[answer] = (counts[answer] || 0) + 1;
    });

    // Calculate percentages and sort top 3 highlights
    stats[question] = Object.entries(counts)
      .map(([text, count]) => ({
        text,
        percentage: ((count / totalQuestions) * 100).toFixed(0), // Calculate % for each highlight
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage)) // Sort by percentage descending
      .slice(0, 3); // Keep top 3 highlights
  });

  return stats;
};

const QuestionSummarizerByTeam: React.FC<QuestionSummarizerProps> = ({ selectedTeamData }) => {
  if (!selectedTeamData || !selectedTeamData.scores) {
    return <div>No data available for this team.</div>;
  }

  const highlights = extractHighlights(selectedTeamData);
  const totalQuestions = Object.keys(highlights).length;
  const highlightStats = calculateHighlightStats(highlights, totalQuestions);

  return (
    <div>
      {Object.entries(highlightStats).map(([question, highlights], index) => (
        <div key={index} style={{ marginBottom: "1.5rem" }}>
          <p className="text-left text-blue-600 mb-1 font-bold">{question}</p>
          <div>
            <p className="text-left text-blue-600 mb-1 underline">Top Highlights:</p>
            <ol style={{ paddingLeft: "1.5rem" }}> 
              {highlights.map((highlight, highlightIndex) => (
                <li key={highlightIndex}>
                  {highlightIndex+1}) {highlight.text} -{" "}
                  <span style={{ fontStyle: "italic", color: "blue" }}>
                    mentioned by {highlight.percentage}% of responses
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionSummarizerByTeam;
