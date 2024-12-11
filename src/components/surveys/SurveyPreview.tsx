import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Survey {
  id: number;
  name: string;
  description: string;
  created_by: string;
  date_start: string;
  date_end: string;
}

interface Question {
  id: number;
  category_id: number;
  question: string;
}

interface Response {
  question_id: number;
  answer: string;
}

export default function SurveyPage() {
  const { survey_id } = useParams<{ survey_id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [teams, setTeams] = useState<{ id: number }[]>([]);
  const [email, setEmail] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const fetchSurveyData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/surveyedit/${survey_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch survey data');
        }
        const data = await response.json();
        setSurvey(data.survey);
        setQuestions(data.questions);
        setTeams(data.teams);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load survey data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [survey_id]);

  const handleResponseChange = (questionId: number, value: string) => {
    setResponses(prev => {
      const existingResponse = prev.find(r => r.question_id === questionId);
      if (existingResponse) {
        return prev.map(r => r.question_id === questionId ? { ...r, answer: value } : r);
      } else {
        return [...prev, { question_id: questionId, answer: value }];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    e.preventDefault();
    if (!selectedTeam || !email) {
      setError('Please select a team and enter your email.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: selectedTeam,
          email,
          survey_id,
          responses,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey responses');
      }

      setSubmitSuccess(true);
      setError(null);
    } catch (err) {
      setError('Failed to submit survey responses. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#031320] text-white font-mono flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#031320] text-white font-mono flex items-center justify-center">{error}</div>;
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#031320] text-white font-mono flex items-center justify-center">
        <div className="bg-[#0a1925] p-8 rounded-lg shadow-md">
          <h2 className="text-2xl mb-4">Thank you for your responses!</h2>
          <p>Your survey has been successfully submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#031320] text-white font-mono p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl mb-6 text-center">{'{'} Survey: {survey?.name} {'}'}</h1>
        <p className="mb-8 text-center">{survey?.description}</p>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="team" className="block mb-2">Select Team:</label>
              <select
                id="team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-[#112331] p-2 rounded"
                required
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    Team {team.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="email" className="block mb-2">Your Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#112331] p-2 rounded"
                required
              />
            </div>
          </div>
          {questions.map((question) => (
            <div key={question.id} className="bg-[#0a1925] p-6 rounded-lg shadow-md">
              <p className="mb-4">{question.question}</p>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex flex-col items-center">
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value={value}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      className="mb-2"
                      required
                    />
                    {value}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Submit Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}