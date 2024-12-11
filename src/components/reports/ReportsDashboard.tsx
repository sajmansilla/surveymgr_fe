'use client';

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Use react-router-dom for navigation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Define the type for a survey
interface Survey {
  id: number;
  name: string;
  teamNames: string[]; // Nested array of team names
  description?: string;
  date_start?: string;
  date_end?: string;
  createdAt?: string;
  created_by?: string;
};
const marketVolatilityData = [
  { name: 'Low Volatility', value: 40, color: '#FFB74D' },
  { name: 'Medium Volatility', value: 30, color: '#FF7043' },
  { name: 'High Volatility', value: 30, color: '#9C27B0' }
];

const debtEquityData = [
  { quarter: 'Q4', value: 8 },
  { quarter: 'Q3', value: 6 },
  { quarter: 'Q2', value: 9 },
  { quarter: 'Q1', value: 4 }
];

const creditRatingData = [
  { name: 'AAA', value: 30, color: '#4CAF50' },
  { name: 'AA', value: 25, color: '#2196F3' },
  { name: 'A', value: 20, color: '#9C27B0' },
  { name: 'BBB', value: 25, color: '#FF9800' }
];

export default function ReportsDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]); // Specify the type of surveys

  const navigate = useNavigate(); // Use navigate from react-router-dom
  //const [searchParams] = useSearchParams(); // Get search parameters
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch surveys from the API
    const fetchSurveys = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/survey-dashboard`);
        if (!response.ok) {
          throw new Error(`Error fetching surveys: ${response.statusText}`);
        }
        const data = await response.json();
        setSurveys(data.surveys || []); // Assuming the API returns { surveys: [...] }
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    };

    fetchSurveys();
  }, [apiUrl]); // Run once on mount with apiUrl dependency

  const handleSurveyClick = (surveyId:number) => {
    // Navigate to the current page with the surveyId query parameter
    navigate(`?surveyId=${surveyId}`);
  };

  function setSelectedTeam(value: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="text-sm text-gray-600 p-2 border-b">
        <h1 className="text-2xl font-semibold mb-6">Overall Report for Survey XZY</h1>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-112px)]">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white p-6">
          <h2 className="text-2xl font-semibold mb-6">Survey List</h2>
          <div className="space-y-2">
            {surveys.map((survey) => (
              <button
                key={survey.id}
                onClick={() => handleSurveyClick(survey.id)} // Pass survey ID on click
                className="w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-50"
              >
                {survey.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
        <div className="flex justify-end mb-8">
            <Select 
              onValueChange={(value) => setSelectedTeam(value)} // Update state on value change
              defaultValue="Select a team"
            >
              <SelectTrigger className="w-[180px]">
                <span className="text-gray-500 mr-2">Teams</span>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              
              <SelectContent>
              <SelectItem value="all">Overall Report</SelectItem>
                {surveys.map((survey, index) => (
                  survey.teamNames.map((teamName, teamIndex) => (
                    <SelectItem 
                      key={`${index}-${teamIndex}`} 
                      value={teamName}
                    >
                      {teamName}
                    </SelectItem>
                  ))
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Volatility</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-around h-[200px]">
                {marketVolatilityData.map((data, index) => (
                  <div key={index} className="text-center">
                    <ResponsiveContainer width={100} height={100}>
                      <PieChart>
                        <Pie
                          data={[data]}
                          innerRadius={30}
                          outerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill={data.color} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2">
                      <div className="text-2xl font-semibold">{data.value}%</div>
                      <div className="text-sm text-gray-600">{data.name}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Debt-to-Equity Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={debtEquityData} layout="vertical">
                      <XAxis type="number" domain={[0, 12]} />
                      <YAxis dataKey="quarter" type="category" />
                      <Bar dataKey="value" fill="#FF9800" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Credit Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={creditRatingData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {creditRatingData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
