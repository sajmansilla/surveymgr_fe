import React from "react";
import WordCloudGenerator from "./WordCloudGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  scores: Score[];
}

interface AggregateHighlightsWordCloudProps {
  data: Survey[];
}

// Basic stemming function for word normalization
const stemWord = (word: string): string => {
  // Example: remove common suffixes
  return word.replace(/(ing|ed|es|s)$/, "");
};

const AggregateHighlightsWordCloud: React.FC<AggregateHighlightsWordCloudProps> = ({ data }) => {
  // Helper function to aggregate words by question
  const aggregateWordsByQuestion = () => {
    const aggregated: { [key: string]: string[] } = {};

    data.forEach((survey) => {
      survey.scores.forEach((score) => {
        score.questions?.forEach((question) => {
          if (question.calc_method === "Aggregate" && question.Score) {
            const words = question.Score.split(/\b/)
              .map((word) =>
                stemWord(word.toLowerCase().replace(/[^a-z0-9]/gi, "")) // Normalize, stem, and remove special characters
              )
              .filter((word) => word.length > 1); // Ignore overly short words
            if (!aggregated[question.question]) {
              aggregated[question.question] = words;
            } else {
              aggregated[question.question] = aggregated[question.question].concat(words);
            }
          }
        });
      });
    });

    return aggregated;
  };

  // Filter out common words
  const filterCommonWords = (words: string[]): string[] => {
    const commonWords = new Set([
      "the", "and", "of", "to", "a", "in", "is", "it", "you", "that", "on", "for",
      "this", "with", "as", "at", "an", "by", "be", "are", "was", "or", "if", "not",
      "but", "so", "do", "we", "can", "from", "they", "all", "our", "your", "any",
      "my", "more", "will", "have", "what", "has", "their", "i", "me", "had", "have",
    ]);
    return words.filter((word) => word && !commonWords.has(word));
  };

  // Process words into a format suitable for the word cloud
  const processWords = (words: string[]): { text: string; value: number }[] => {
    const wordCounts: { [key: string]: number } = {};

    filterCommonWords(words).forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    return Object.entries(wordCounts).map(([word, count]) => ({
      text: word,
      value: count,
    }));
  };

  const aggregatedQuestions = aggregateWordsByQuestion();

  return (
    <div>
      {Object.entries(aggregatedQuestions).map(([question, words], index) => {
        const wordCloudData = processWords(words);
        return (
          <div key={index} className="mb-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle >{question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-600 text-sm">
                  <WordCloudGenerator words={wordCloudData} />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default AggregateHighlightsWordCloud;
