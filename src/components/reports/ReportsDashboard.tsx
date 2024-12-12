'use client';

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, ReferenceLine, Label } from 'recharts';

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
  teamNames: string[];
  description?: string;
  date_start?: string;
  date_end?: string;
  createdAt?: string;
  created_by?: string;
}

export default function ReportsDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("0");
  const [categoryScoreData, setCategoryScoreData] = useState<{ category: string | number; score: number;advice:string }[]>([]);
  const [lowScoreCategory, setLowScoreCategory] = useState<{ category: string | number; score: number }[]>([]);
  const [topScoreCategory, setTopScoreCategory] = useState<{ category: string | number; score: number }[]>([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiUrl = import.meta.env.VITE_API_URL;

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

  const paramSurveyId = searchParams.get('surveyId');
  const defaultSurveyId = surveys.length > 0 ? surveys[0].id : null;
  const currentSurveyId = paramSurveyId ? Number(paramSurveyId) : defaultSurveyId;

  const currentSurvey = surveys.find((s) => s.id === currentSurveyId);

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
          const newData: { category: string | number; score: number; advice: string;adviceColor: string }[] = [];

          if (selectedTeam !== '0') {
            const topScoreCategory: { category: string | number; score: number }[] = [];
            const lowScoreCategory: { category: string | number; score: number }[] = [];

            for (const team_category_scores of result.category_scores) {
              if (team_category_scores.teamId === selectedTeam) {
                const scores = team_category_scores.scores.results;

                for (const score of scores) {
                  if (score.top_score) {
                    topScoreCategory.push({
                      category: 'Be Proud of: ' + score.category_name,
                      score: score.score
                    });
                  }

                  if (score.low_score) {
                    lowScoreCategory.push({
                      category: 'Keep Eye on: ' + score.category_name,
                      score: score.score
                    });
                  }

                  newData.push({
                    category: score.category_name,
                    score: score.score,
                    advice:score.advice,
                    adviceColor:score.adviceColor

                  });
                }
                setLowScoreCategory(lowScoreCategory);
                setTopScoreCategory(topScoreCategory);
                break;
              }
            }
            
            setCategoryScoreData(newData);
            console.log('newData',newData);

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

  const handleSurveyClick = (surveyId: number) => {
    navigate(`?surveyId=${surveyId}`);
  };

  const uniqueTeamNames = currentSurvey ? Array.from(new Set(currentSurvey.teamNames)) : [];
  const uniqueTeamIds = currentSurvey ? Array.from(new Set(currentSurvey.teamIds)) : [];
  const adjustedTeam = selectedTeam === "0" ? uniqueTeamIds[0] : selectedTeam;
  const selectedTeamIndex = uniqueTeamIds.indexOf(adjustedTeam);
  const selectedTeamName = adjustedTeam === "0" ? "Overall" : uniqueTeamNames[selectedTeamIndex];

  const currentSurveyTeamResponseRate = currentSurvey?.responseRates[selectedTeamIndex] ?? 0;
 
  const surveyOverview = [
    { name: 'Response Rate', value: currentSurveyTeamResponseRate, color: '#2196F3' },
    { 
      name: topScoreCategory.length > 0 ? topScoreCategory[0].category : 'No Top Score', 
      value: topScoreCategory.length > 0 ? topScoreCategory[0].score : 0, 
      color: '#4CAF50' 
    },
    { 
      name: lowScoreCategory.length > 0 ? lowScoreCategory[0].category : 'No Low Score', 
      value: lowScoreCategory.length > 0 ? lowScoreCategory[0].score : 0, 
      color: '#FF7043' 
    }
  ];
  const creditRatingData = [
    { name: 'AAA', value: 30, color: '#4CAF50' },
    { name: 'AA', value: 25, color: '#2196F3' },
    { name: 'A', value: 20, color: '#9C27B0' },
    { name: 'BBB', value: 25, color: '#FF9800' }
  ];
  return (
    <div className="min-h-screen bg-white">
      <div className="text-sm text-gray-600 p-2 border-b">
        <h1 className="text-2xl font-semibold mb-6">
          {currentSurvey ? `Overall Report for ${currentSurvey.name}` : 'No Selected Survey'}
        </h1>
      </div>

      <div className="flex min-h-[calc(100vh-112px)]">
        <div className="w-64 border-r bg-white p-6">
          <h2 className="text-2xl font-semibold mb-6">Survey List</h2>
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

        <div className="flex-1 p-6">
          <div className="flex justify-end mb-8">
            <Select
              onValueChange={(value) => setSelectedTeam(value)}
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

          <div>Team {selectedTeamName} Self Assessment Survey Report</div>
          <div className="space-y-6">
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

            <div className="grid md:grid-cols-2 gap-6">
              
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
          <ReferenceLine x={2.75} stroke="red" strokeDasharray="3 3" />
          <ReferenceLine x={3.75} stroke="green" strokeDasharray="3 3" />
          <Bar 
            dataKey="score" 
            name="Score"
            shape={(props) => {
              const { x, y, width, height, fill } = props;
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
<div className="space-y-6">
  <Card className="w-full">
    <CardHeader>
      <CardTitle>Recommendations</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categoryScoreData.map((data, index) => (
        <div
          key={index}
          className={`flex flex-col p-4 rounded-lg shadow-md ${
            data.adviceColor === 'green' ? 'bg-green-100' :
            data.adviceColor === 'red' ? 'bg-red-100' :
            data.adviceColor === 'yellow' ? 'bg-yellow-100' :
            'bg-gray-50' // Default color
          }`}
        >
          <div className="text-lg font-semibold text-black">
            {data.category}
          </div>
          <div className="text-sm text-gray-700 mt-2">
            {data.advice}
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
</div>


          </div>
        </div>
      </div>
    </div>
  );
}
