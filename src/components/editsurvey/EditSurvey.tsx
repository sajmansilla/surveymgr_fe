import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { SurveyDetailsForm } from "./SurveyForm";
import { CategoriesTabs } from "./CategoryTabs";

interface Question {
  id: string;
  question: string;
  category_id: string;
  enabled: boolean;
}

interface Member {
  person_id: number;
  team_id: number;
  role: string;
}

const EditSurvey: React.FC = () => {
  const { survey_id } = useParams<{ survey_id: string }>();
  const [surveyName, setSurveyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [, setMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app';

    fetch(`${apiUrl}/api/surveyquestions/${survey_id}`)
      .then(response => response.json())
      .then(data => {
        setQuestions(data.questions);
        setSelectedQuestions(
          data.questions
            .filter((q: any) => q.Question.enabled)
            .map((q: any) => q.Question.id)
        );
      });

    fetch(`${apiUrl}/api/surveyparticip/${survey_id}`)
      .then(response => response.json())
      .then(data => {
        setMembers(data.participants);
        setSelectedMembers(data.participants.map((p: any) => p.participant));
      });

    fetch(`${apiUrl}/api/survey/${survey_id}`)
      .then(response => response.json())
      .then(data => {
        setSurveyName(data.survey.name);
        setDescription(data.survey.description);
        setStartDate(data.survey.date_start ? new Date(data.survey.date_start) : undefined);
        setEndDate(data.survey.date_end ? new Date(data.survey.date_end) : undefined);
      });
  }, [survey_id]);

  const handleSaveChanges = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app';

    const body = {
      name: surveyName,
      date_start: startDate ? format(startDate, "yyyy-MM-dd") : null,
      date_end: endDate ? format(endDate, "yyyy-MM-dd") : null,
      questions: selectedQuestions,
      participants: selectedMembers,
      description,
    };

    try {
      const response = await fetch(`${apiUrl}/api/survey/${survey_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);

      alert('Survey updated successfully!');
      navigate('/surveys');
    } catch (error) {
      console.error('Failed to update survey:', error);
      alert('Failed to update survey. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Survey</h1>
      <SurveyDetailsForm
        surveyData={{
          surveyName,
          description,
          startDate,
          endDate,
          questions,
        }}
      />
      <CategoriesTabs
        categories={[]} // Ajustar según los datos disponibles
        questions={questions}
      />
      <button onClick={handleSaveChanges} className="mt-6">Save Survey</button>
    </div>
  );
};

export default EditSurvey;
