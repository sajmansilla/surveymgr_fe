import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Analysis = () => {
  const ApiUrl = "http://localhost:3001/api";
  const [surveyHighlights, setSurveyHighlights] = useState<
    { question_id: number; content: string; question_text: string }[]
  >([]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await fetch(`${ApiUrl}/surveyHighlights/5`);
        const data = await response.json();
        setSurveyHighlights(data.surveyHighlights || []);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchHighlights();
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-left w-full p-4 rounded-lg shadow-md bg-white">
        {surveyHighlights.map((highlight) => (
          <Card key={highlight.question_id}>
            <CardHeader>
              <CardTitle className="text-lg p-4 rounded-lg shadow-md bg-white">{highlight.question_text}</CardTitle>
            </CardHeader>
            <CardContent dangerouslySetInnerHTML={{ __html: highlight.content }} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Analysis;