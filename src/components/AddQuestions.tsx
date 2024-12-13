import React, { useState, useEffect } from 'react';

interface Category {
  category_id: number;
  category_name: string;
}

interface Question {
  question: string;
  category_id: number;
  type: 'multiple_choice' | 'free_text' | 'option';
  calc_method: 'AVG' | 'Aggregate';
  enabled: boolean;
}

export default function QuestionForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: '',
      category_id: 0,
      type: 'multiple_choice',
      calc_method: 'Aggregate',
      enabled: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.category);
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (index: number, field: keyof Question, value: string | number | boolean) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        category_id: 0,
        type: 'multiple_choice',
        calc_method: 'Aggregate',
        enabled: true,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questions),
      });

      if (!response.ok) {
        throw new Error('Failed to submit questions');
      }

      setSuccess(true);
      setQuestions([
        {
          question: '',
          category_id: 0,
          type: 'multiple_choice',
          calc_method: 'Aggregate',
          enabled: true,
        },
      ]);
    } catch (err) {
      setError('An error occurred while submitting questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#031320] text-white font-mono p-8">
      <h1 className="text-3xl mb-6 text-center">{'{'} Question Management {'}'}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((question, index) => (
          <div key={index} className="bg-[#0a1925] p-6 rounded-lg shadow-md space-y-4">
            <textarea
              value={question.question}
              onChange={(e) => handleInputChange(index, 'question', e.target.value)}
              placeholder="Question Text"
              className="w-full bg-[#112331] text-white p-2 rounded"
              rows={3}
              required
            />
            <select
              value={question.category_id}
              onChange={(e) => handleInputChange(index, 'category_id', Number(e.target.value))}
              className="w-full bg-[#112331] text-white p-2 rounded"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
            <select
              value={question.type}
              onChange={(e) => handleInputChange(index, 'type', e.target.value as Question['type'])}
              className="w-full bg-[#112331] text-white p-2 rounded"
              required
            >
              <option value="multiple_choice">Multiple choice</option>
              <option value="free_text">Free text</option>
              <option value="option">Option</option>
            </select>
            <input
              type="text"
              value={question.calc_method}
              onChange={(e) => handleInputChange(index, 'calc_method', e.target.value)}
              placeholder="Calculation Method"
              className="w-full bg-[#112331] text-white p-2 rounded"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={question.enabled}
                onChange={(e) => handleInputChange(index, 'enabled', e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>Enabled</span>
            </label>
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Remove Question
            </button>
          </div>
        ))}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Add Question
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? 'Submitting...' : 'Submit Questions'}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">Questions submitted successfully!</p>}
    </div>
  );
}