import { useState } from 'react';
import { format } from 'date-fns';

const useSurveyHandlers = (surveyData: any, teams: any[], members: any[], selectedQuestions: string[], selectedMembers: number[], apiUrl: string, id: string) => {
  const [surveyName, setSurveyName] = useState(surveyData?.name || '');
  const [description, setDescription] = useState(surveyData?.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(surveyData?.date_start || undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(surveyData?.date_end || undefined);

  const handleSaveSurvey = async () => {
    const teamNamesWithSelectedMembers = teams
      .filter((team) =>
        members
          .filter((member) => member.team_id === team.id)
          .some((member) => selectedMembers.includes(member.person_id))
      )
      .map((team) => team.team_name);

    const body = {
      name: surveyName,
      date_start: startDate ? format(startDate, "yyyy-MM-dd") : null,
      date_end: endDate ? format(endDate, "yyyy-MM-dd") : null,
      teams: teamNamesWithSelectedMembers,
      description,
      questions: selectedQuestions,
    };

    try {
      const response = await fetch(`${apiUrl}/api/survey/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      alert("Survey updated successfully!");
    } catch (error) {
      console.error("Failed to update survey:", error);
      alert("Failed to update survey. Please try again.");
    }
  };

  return { handleSaveSurvey, setSurveyName, setDescription, setStartDate, setEndDate };
};

export default useSurveyHandlers;
