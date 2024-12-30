import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

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

const SurveyForm = () => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const { survey_id, token } = useParams(); // Get params from URL
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook to redirect to error page
  const [loading, setLoading] = useState(true); // To manage loading state
  const [isTokenValid, setIsTokenValid] = useState(false); // To manage token validation
  const [responses, setResponses] = useState<Response[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

    if (!survey_id || !token) {
      setError('Survey ID or token is missing.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
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
      alert('Failed to submit survey responses. Please reach out to Agile Chapter.');
    }
  };

  // Redirect to the thanks page when the survey is submitted successfully
  useEffect(() => {
    if (submitSuccess) {
      navigate('/thanks');
    }
  }, [submitSuccess, navigate]);

  // Effect to validate token for the survey
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Validate token with the API
        const apiUrl = import.meta.env.VITE_API_URL
        const response = await fetch(`${apiUrl}/api/verify-token/${survey_id}/${token}`);

        if (!response.ok) {
          throw new Error('Error en la solicitud de verificación del token');
        }

        const data = await response.json();

        if (data.isValid) {
          // Si el token es válido, actualizar el estado
          setIsTokenValid(true);
        } else {
          // Si el token es inválido, actualizar el estado
          setError('The token is invalid or expired.');
          setIsTokenValid(false);
        }

      } catch (error) {
        console.error('Error when validating the token:', error);
        setIsTokenValid(false); // If there's an error, set the state to false
      } finally {
        setLoading(false); // Change the loading state to false
      }
    };

    // Call the function to validate the token
    validateToken();
  }, [survey_id, token]);

  useEffect(() => {
    if (!loading && !isTokenValid) {
      // If the token is invalid, redirect to the error page with the error message in the state
      navigate('/error', { state: { error } }); // Passing the error message in the state
    }
  }, [isTokenValid, navigate, error]);

  // Effect to bring the questions for the survey
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
        setLoading(false);
      } catch (err) {
        setError('Failed to load survey data. Please try again later.');
      } finally {
        setLoading(false); // Make sure loading is set to false when done
      }
    };

    fetchSurveyData();
  }, [survey_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isTokenValid) {
    return null; // The component will not render anything if the token is invalid
  }

  // Here goes the survey form
  return (
    <div className="min-h-screen bg-[#031320] text-white font-mono p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl mb-6 text-center">{'{'} Survey: {survey?.name} {'}'}</h1>
        <p className="mb-8 text-center">{survey?.description}</p>
        <form onSubmit={handleSubmit} className="space-y-8">
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
};

export default SurveyForm;
