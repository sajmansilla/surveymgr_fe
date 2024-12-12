'use client';

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Label,LineChart,Line,Legend } from 'recharts';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bold } from "lucide-react";

// Define the type for a survey
interface Survey {
  id: number;
  name: string;
  teamNames: string[];
  teamIds: string[]; // Assuming teamIds are also part of the survey data
  description?: string;
  date_start?: string;
  date_end?: string;
  responseRates?: number[]; // Assuming responseRates is an array indexed by team
  createdAt?: string;
  created_by?: string;
}

// Define the type for category score data
interface CategoryScore {
  category: string | number;
  score: number;
  advice: string;
  adviceColor: string;
}

export default function ReportsDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("0");
  const [categoryScoreData, setCategoryScoreData] = useState<CategoryScore[]>([]);
  const [lowScoreCategory, setLowScoreCategory] = useState<{ category: string | number; score: number }[]>([]);
  const [topScoreCategory, setTopScoreCategory] = useState<{ category: string | number; score: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // New state for selected category

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch surveys from the API
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/survey-dashboard`);
        if (!response.ok) {
          throw new Error(`Error fetching surveys: ${response.statusText}`);
        }
        const data = await response.json();
        setSurveys(data.surveys || []);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    };

    fetchSurveys();
  }, [apiUrl]);

  // Determine current survey ID
  const paramSurveyId = searchParams.get('surveyId');
  const defaultSurveyId = surveys.length > 0 ? surveys[0].id : null;
  const currentSurveyId = paramSurveyId ? Number(paramSurveyId) : defaultSurveyId;

  // Find the current survey
  const currentSurvey = surveys.find((s) => s.id === currentSurveyId);

  // Fetch and calculate report data when survey or team changes
  useEffect(() => {
    const calculateReportData = async () => {
      if (currentSurveyId) {
        try {
          const response = await fetch(`${apiUrl}/api/reports`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ survey_id: currentSurveyId })
          });
          if (!response.ok) {
            throw new Error(`Error in calculateTeamReportData: ${response.statusText}`);
          }
          const result = await response.json();
          const newData: CategoryScore[] = [];

          if (selectedTeam !== '0') {
            const topScoreCategoryTemp: { category: string | number; score: number }[] = [];
            const lowScoreCategoryTemp: { category: string | number; score: number }[] = [];

            for (const team_category_scores of result.category_scores) {
              if (team_category_scores.teamId === selectedTeam) {
                const scores = team_category_scores.scores.results;

                for (const score of scores) {
                  if (score.top_score) {
                    topScoreCategoryTemp.push({
                      category: 'Be Proud of: ' + score.category_name,
                      score: score.score
                    });
                  }

                  if (score.low_score) {
                    lowScoreCategoryTemp.push({
                      category: 'Keep Eye on: ' + score.category_name,
                      score: score.score
                    });
                  }

                  newData.push({
                    category: score.category_name,
                    score: score.score,
                    advice: score.advice,
                    adviceColor: score.adviceColor
                  });
                }
                setLowScoreCategory(lowScoreCategoryTemp);
                setTopScoreCategory(topScoreCategoryTemp);
                break;
              }
            }
            setCategoryScoreData(newData);
            //console.log('newData', newData);
          }
        } catch (error) {
          console.error('Failed to calculate team report data:', error);
        }
      }
    };

    if (currentSurveyId) {
      calculateReportData();
    }
  }, [currentSurveyId, apiUrl, selectedTeam]);

  // Handle survey selection
  const handleSurveyClick = (surveyId: number) => {
    navigate(`?surveyId=${surveyId}`);
  };

  // Extract unique team names and IDs
  const uniqueTeamNames = currentSurvey ? Array.from(new Set(currentSurvey.teamNames)) : [];
  const uniqueTeamIds = currentSurvey ? Array.from(new Set(currentSurvey.teamIds)) : [];
  const adjustedTeam = selectedTeam === "0" ? uniqueTeamIds[0] : selectedTeam;
  const selectedTeamIndex = uniqueTeamIds.indexOf(adjustedTeam);
  const selectedTeamName = selectedTeam === "0" ? " " : uniqueTeamNames[selectedTeamIndex];

  // Handle bar click to select category
  const handleBarClick = (data: CategoryScore) => {
    setSelectedCategory(data.category as string);
  };

  // Find the data for the selected category
  const selectedCategoryData = categoryScoreData.find((data) => data.category === selectedCategory);

  // Calculate current survey team response rate
  const currentSurveyTeamResponseRate = currentSurvey?.responseRates && selectedTeamIndex < currentSurvey.responseRates.length
    ? currentSurvey.responseRates[selectedTeamIndex]
    : 0;

  // Prepare survey overview data
  const surveyOverview = [
   { name: selectedTeam > 0 ? 'Response Rate' : 'No Response Rate', value: selectedTeam > 0? currentSurveyTeamResponseRate : 0, color: '#2196F3' },
    { 
      
      name: topScoreCategory.length > 0 && selectedTeam > 0 ? topScoreCategory[0].category : 'No Top Score', 
      value: topScoreCategory.length  > 0 && selectedTeam > 0 ? topScoreCategory[0].score : 0, 
      color: '#4CAF50' 
    },
    { 
      name: lowScoreCategory.length > 0 && selectedTeam > 0 ? lowScoreCategory[0].category : 'No Low Score', 
      value: lowScoreCategory.length > 0 && selectedTeam > 0 ? lowScoreCategory[0].score : 0, 
      color: '#FF7043' 
    }
  ];
/// define the categoriesTrend //
const categoriesTrend = [
  { survey: 'Q1 Survey', Trust: 2.5, Focus: 2.8, Results: 3.0 },
  { survey: 'Q2 Survey', Trust: 3.0, Focus: 2.9, Results: 3.1 },
  { survey: 'Q3 Survey', Trust: 2.7, Focus: 3.0, Results: 3.2 },
  { survey: 'Q4 Survey', Trust: 3.2, Focus: 3.1, Results: 3.5 },
  { survey: 'Q5 Survey', Trust: 3.2, Focus: 3.1, Results: 5 },
];

  

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="text-sm text-gray-600 p-2 border-b">
        <h1 className="text-2xl font-semibold mb-6">
          {currentSurvey ? `Overall Report for ${currentSurvey.name}` : 'No Selected Survey'}
        </h1>
      </div>

      <div className="flex min-h-[calc(100vh-112px)]">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white p-6">            

          <div className="text-xl font-semibold mb-4">Survey List</div>
          <div className="space-y-2">
            {surveys.length === 0 ? (
              <div>No surveys available</div>
            ) : (
              surveys.map((survey) => (
                <button
                  key={survey.id}
                  onClick={() => handleSurveyClick(survey.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 ${
                    currentSurveyId === survey.id ? 'bg-gray-200' : ''
                  }`}
                >
                  {survey.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Team Selection */}
          <div className="flex justify-end mb-8">
            <Select
              onValueChange={(value) => {
                setSelectedTeam(value);
                setSelectedCategory(null); // Reset selected category when team changes
              }}
              defaultValue="0">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Select a team</SelectItem>
                {uniqueTeamNames.map((teamName, index) => (
                  <SelectItem
                    key={`${currentSurveyId}-${index}`} 
                    value={uniqueTeamIds[index]}
                  >
                    Team {teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Title */}
          <div className="text-xl font-semibold mb-4">
            Team {selectedTeamName} Self Assessment Survey Report
          </div>

          {/* Charts and Recommendations */}
          <div className="space-y-6">
            {/* Survey Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Overview</CardTitle> 
              </CardHeader>
              <CardContent className="flex justify-around h-[200px]">
                {surveyOverview.map((data, index) => {
                  const numericDrawValue = index === 0 ? data.value : (data.value / 5) * 100;
                  const displayValue = index === 0 ? `${data.value}%` : `${data.value}`;
                  const chartData = [
                    { name: data.name, value: numericDrawValue },
                    { name: 'Remainder', value: 100 - numericDrawValue },
                  ];
                  return (
                    <div key={index} className="text-center flex flex-col items-center">
                      <ResponsiveContainer width={100} height={100}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={30}
                            outerRadius={40}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill={data.color} />
                            <Cell fill="#eaeaea" />
                            <Label value={displayValue} position="center" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-2">
                        <div style={{ fontSize: '14px', color: 'black', fontWeight: '500' }}>{data.name}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Grid with Team Scores and Conditional Credit Rating/Category Advice */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Team Scores Card */}
              <Card>
  <CardHeader>
    <CardTitle>Team Scores</CardTitle>
  </CardHeader>

  <CardContent>
    {selectedTeam === "0" ? (
      <div className="text-center text-gray-600 text-sm">
        No team selected. Please select a team to view the scores.
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart 
          data={categoryScoreData} 
          layout="vertical"
          margin={{ left: 30 }}
        >
          <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
          <YAxis dataKey="category" type="category" interval={0} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ fontSize: '12px' }} />
          <ReferenceLine x={3.25} stroke="red" strokeDasharray="3 3" />
          <ReferenceLine x={3.75} stroke="green" strokeDasharray="3 3" />
          <Bar 
            dataKey="score" 
            name="Score"
            onClick={(data) => {
              setSelectedCategory(data);
            }}
            shape={(props) => {
              const { x, y, width, height } = props;
              const barColor = 
                props.payload.adviceColor === 'green' ? '#4CAF50' : 
                props.payload.adviceColor === 'red' ? '#FF5722' : 
                props.payload.adviceColor === 'yellow' ? '#FF9800' : 
                '#FF9800'; // Default color
              return <rect x={x} y={y} width={width} height={height} fill={barColor} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    )}
  </CardContent>
</Card>

           {/* Conditional Rendering: Category Recommendations */}
{selectedTeam === "0" ? (
  <Card>
    <CardHeader>
      <CardTitle>Category Recommendations</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center text-gray-600 text-sm">
       No team selected. Please select a team to view the recommendations.
      </div>
    </CardContent>
  </Card>
) : (
  <Card>
    <CardHeader>
      <CardTitle>Category Recommendations</CardTitle>
    </CardHeader>
    <CardContent>
      {selectedCategory ? (
        <div
          className={`flex flex-col p-4 rounded-lg shadow-md ${
            selectedCategory.adviceColor === 'green' ? 'bg-green-100' :
            selectedCategory.adviceColor === 'red' ? 'bg-red-100' :
            selectedCategory.adviceColor === 'yellow' ? 'bg-orange-100' :
            'bg-gray-50' // Default color
          }`}
        >
         
           <div style={{ fontSize: '16px', color: 'black', fontWeight: '500', Bold }}>{selectedCategory.category}</div>
          <div className="text-sm text-gray-700 mt-2"> {selectedCategory.advice}</div>
        </div>
      ) : (
        categoryScoreData.length > 0 && (
          <div
            className={`flex flex-col p-4 rounded-lg shadow-md ${
              categoryScoreData[0].adviceColor === 'green' ? 'bg-green-100' :
              categoryScoreData[0].adviceColor === 'red' ? 'bg-red-100' :
              categoryScoreData[0].adviceColor === 'yellow' ? 'bg-orange-100' :
              'bg-gray-50' // Default color
            }`}
          >
            <div style={{ fontSize: '16px', color: 'black', fontWeight: '500', Bold }}>
              {categoryScoreData[0].category}
            </div>
            <div className="text-sm text-gray-700 mt-2">
              {categoryScoreData[0].advice}
            </div>
          </div>
        )
      )}
    </CardContent>
  </Card>
)}

            </div>

  {/* Category Trend  Card */}

            {selectedTeam === "0" ? (
  <Card>
    <CardHeader>
      <CardTitle>Categories Trend</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center text-gray-600 text-sm">
       No team selected. Please select a team to view the trend.
      </div>
    </CardContent>
  </Card>
) : (
  <Card className="w-full">
  <CardHeader>
    <CardTitle>Categories Trend</CardTitle>
  </CardHeader>
  <CardContent className="flex justify-center items-center">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={categoriesTrend}>
        <XAxis dataKey="survey" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={[0, 5]} />
        <Tooltip contentStyle={{ fontSize: '12px' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {/* Dynamically generate lines for each key in the dataset, excluding 'survey' */}
        {Object.keys(categoriesTrend[0])
          .filter((key) => key !== 'survey')
          .map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={['#4CAF50', '#2196F3', '#FF9800', '#E91E63'][index % 4]} // Rotate colors for lines
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>




)} 
          </div>
               </div>
      </div>
    </div>
  );
}
