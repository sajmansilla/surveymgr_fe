import React, { useState } from 'react';

interface Category {
  category_name: string;
  category_description: string;
  green_advice: string;
  yellow_advice: string;
  red_advice: string;
  psychological_safety_flag: boolean;
}

export default function CategoryForm() {
  const [categories, setCategories] = useState<Category[]>([
    {
      category_name: '',
      category_description: '',
      green_advice: '',
      yellow_advice: '',
      red_advice: '',
      psychological_safety_flag: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (index: number, field: keyof Category, value: string | boolean) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setCategories(newCategories);
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        category_name: '',
        category_description: '',
        green_advice: '',
        yellow_advice: '',
        red_advice: '',
        psychological_safety_flag: false,
      },
    ]);
  };

  const removeCategory = (index: number) => {
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categories),
      });

      if (!response.ok) {
        throw new Error('Failed to submit categories');
      }

      setSuccess(true);
    } catch (err) {
      setError('An error occurred while submitting categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#031320] text-white font-mono p-8">
      <h1 className="text-3xl mb-6 text-center">{'{'} Category Management {'}'}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {categories.map((category, index) => (
          <div key={index} className="bg-[#0a1925] p-6 rounded-lg shadow-md space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={category.category_name}
                onChange={(e) => handleInputChange(index, 'category_name', e.target.value)}
                placeholder="Category Title"
                className="flex-grow bg-[#112331] text-white p-2 rounded"
                required
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={category.psychological_safety_flag}
                  onChange={(e) => handleInputChange(index, 'psychological_safety_flag', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>Psychological Safety</span>
              </label>
            </div>
            <textarea
              value={category.category_description}
              onChange={(e) => handleInputChange(index, 'category_description', e.target.value)}
              placeholder="Category Description"
              className="w-full bg-[#112331] text-white p-2 rounded"
              rows={3}
              required
            />
            <textarea
              value={category.green_advice}
              onChange={(e) => handleInputChange(index, 'green_advice', e.target.value)}
              placeholder="Green Advice"
              className="w-full bg-[#112331] text-white p-2 rounded"
              rows={2}
              required
            />
            <textarea
              value={category.yellow_advice}
              onChange={(e) => handleInputChange(index, 'yellow_advice', e.target.value)}
              placeholder="Yellow Advice"
              className="w-full bg-[#112331] text-white p-2 rounded"
              rows={2}
              required
            />
            <textarea
              value={category.red_advice}
              onChange={(e) => handleInputChange(index, 'red_advice', e.target.value)}
              placeholder="Red Advice"
              className="w-full bg-[#112331] text-white p-2 rounded"
              rows={2}
              required
            />
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Remove Category
            </button>
          </div>
        ))}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={addCategory}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Add Category
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? 'Submitting...' : 'Submit Categories'}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">Categories submitted successfully!</p>}
    </div>
  );
}