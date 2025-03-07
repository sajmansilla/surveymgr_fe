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
  team_name: string;
  scores: Score[];
}

interface Highlight {
  text: string;
  teams: string[];
  percentage: number;
}

interface Summary {
  question: string;
  topHighlights: Highlight[];
  summary: string;
}

interface AggregateQuestionSummarizerProps {
  data: Survey[];
}

// Helper function to extract highlights with associated teams
const extractHighlightsWithTeams = (data: Survey[]): { [key: string]: { [highlight: string]: Set<string> } } => {
  const highlights: { [key: string]: { [highlight: string]: Set<string> } } = {};

  data.forEach((survey) => {
    survey.scores.forEach((score) => {
      score.questions?.forEach((question) => {
        if (question.calc_method === "Aggregate" && question.Score) {
          const questionHighlights = question.Score.split("\n").map((answer) => answer.trim());
          if (!highlights[question.question]) {
            highlights[question.question] = {};
          }

          questionHighlights.forEach((highlight) => {
            if (!highlights[question.question][highlight]) {
              highlights[question.question][highlight] = new Set();
            }
            highlights[question.question][highlight].add(survey.team_name);
          });
        }
      });
    });
  });

  return highlights;
};

// Helper function to calculate percentages and transform data
const calculateHighlightStats = (highlights: { [highlight: string]: Set<string> }, totalTeams: number): Highlight[] => {
  return Object.entries(highlights).map(([text, teams]) => ({
    text,
    teams: Array.from(teams),
    percentage: ((teams.size / totalTeams) * 100).toFixed(0),
  }));
};

// Helper function to generate summaries
const generateSummaries = (data: Survey[]): Summary[] => {
  const totalTeams = data.length;
  const highlightsMap = extractHighlightsWithTeams(data);

  return Object.entries(highlightsMap).map(([question, highlights]) => {
    const highlightStats = calculateHighlightStats(highlights, totalTeams);
    const topHighlights = highlightStats.sort((a, b) => b.percentage - a.percentage).slice(0, 3); // Top 3 highlights

    return {
      question,
      topHighlights,
      summary: `Top highlights were mentioned by up to ${Math.max(...topHighlights.map((h) => parseFloat(h.percentage)))}% of teams.`,
    };
  });
};

const QuestionSummarizer: React.FC<AggregateQuestionSummarizerProps> = ({ data }) => {
  const summaries = generateSummaries(data);

  return (
    <div>
      {summaries.map((summary, index) => (
        <div key={index} style={{ marginBottom: "1.5rem" }}>
          <p className="text-left text-blue-600 mb-1 font-bold">{summary.question}</p>

          <p>
          <p className="text-left text-blue-600 mb-1 underline">Summary:</p>{summary.summary}
          </p>
          <div>
          <p className="text-left text-blue-600 mb-1 underline">Top Highlights:</p>
            <ol style={{ paddingLeft: "1.5rem" }}>
              {summary.topHighlights.map((highlight, highlightIndex) => (
                <li key={highlightIndex}>
                 {highlightIndex+1})  {highlight.text} -{" "}
                  <span style={{ color: "blue", fontStyle: "italic" }}>
                    mentioned by {highlight.percentage}% of teams:{" "}
                    {highlight.teams.map((team, teamIndex) => (
                      <span key={teamIndex} style={{ fontStyle: "italic", color: "blue" }}>
                        {team}
                        {teamIndex < highlight.teams.length - 1 ? ", " : ""}
                      </span>
                    ))}
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

export default QuestionSummarizer;
