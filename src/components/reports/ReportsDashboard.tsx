'use client';

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

  const [categoryScoreData, setCategoryScoreData] = useState<{ category: string | number; score: number }[]>([]);
  console.log('categoryScoreData',categoryScoreData);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  // Call calculateTeamReportData when survey or team changes
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
          console.log('all categories scores for the selected survey') ; console.log(result);
          const newData: { category: string | number; score: number }[] = [];


          //  filter the category score chart based on the selected team id
          if (selectedTeam != '0') 
            {
            // Otherwise,
            for (const team_category_scores of result.category_scores) {
              if (team_category_scores.teamId === selectedTeam) {
                const scores = team_category_scores.scores.results;
                for (const score of scores) {
                  newData.push({
                    //category: score.category_id,
                    category: score.category_name,
                    score: score.score
                  });
                }
                break;
              }
            }
          }

          setCategoryScoreData(newData);
          console.log('Category scores updated:', newData);
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

  // Ensure uniqueness of teamNames if needed
  
  const uniqueTeamNames = currentSurvey ? Array.from(new Set(currentSurvey.teamNames)): [];
  const uniqueTeamIds = currentSurvey ? Array.from(new Set(currentSurvey.teamIds)): [];
  const adjustedTeam = selectedTeam === 0 ? uniqueTeamIds[0] : selectedTeam; // handle the cse when no team is selected yet, set the selection to the first team
  const selectedTeamIndex = uniqueTeamIds.indexOf(adjustedTeam);
  const selectedTeamName = adjustedTeam === "0" ? "Overall " : uniqueTeamNames[selectedTeamIndex];

  /*console.log('currentSurvey',currentSurvey);
  console.log('selectedTeam',selectedTeam);
  console.log('adjustedTeam',adjustedTeam);
  console.log('selectedTeamIndex',selectedTeamIndex);

  console.log('selectedTeamName',selectedTeamName);*/
//////////////////// Survey Overview Pie charts//////////////////////

//const currentSurveyResponseRate = currentSurvey.responseRate;
const currentSurveyResponseRate = currentSurvey?.responseRate ?? 0;

//console.log('currentSurveyResponseRate:', currentSurveyResponseRate);

const surveyOverview = [
  { name: 'Response Rate', value: currentSurveyResponseRate, color: '#FFB74D' },
  { name: 'Trust has Top Score', value: 90, color: '#4CAF50' },
  { name: 'Lowest Score', value: 30, color: '#FF7043' }
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
        {/* Sidebar */}
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

        {/* Main Content Area */}
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
          {/* Charts and other content */}
          <div className="space-y-6">
          <Card>
  <CardHeader>
    <CardTitle>Survey Overview</CardTitle> 
   
  </CardHeader>
  <CardContent className="flex justify-around h-[200px]">
    {surveyOverview.map((data, index) => {
      const chartData = [
        { name: data.name, value: data.value },
        { name: 'Remainder', value: 100 - data.value },
      ];

      // Determine if this is the first chart
      const isFirstChart = index === 0;

      // Display either percent or raw value
      const displayValue = isFirstChart ? `${data.value}%` : `${data.value}`;

      return (
        <div key={index} className="text-center">
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
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2">
            <div className="text-2xl font-semibold">{displayValue}</div>
            <div className="text-sm text-gray-600">{data.name}</div>
          </div>
        </div>
      );
    })}
  </CardContent>
</Card>



            <div className="grid md:grid-cols-2 gap-6" >
            <Card>
              <CardHeader>
                <CardTitle>Team Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryScoreData} layout="vertical"  margin={{ left:30 }}>
                    <XAxis type="number" tick={{ fontSize: 12 }}/>
                    <YAxis dataKey="category" type="category" interval={0} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                    
                    <Bar dataKey="score" fill="#FF9800" name="Score" />
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
