'use client';

import { useEffect, useState, useMemo, useCallback} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell,ResponsiveContainer, Label} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heatmap from './Heatmap';
import QuestionSummarizer from "./QuestionSummarizer";
import AggregateHighlightsWordCloud from "./AggregateHighlightsWordCloud";



// API Base URL
const apiUrl = import.meta.env.VITE_API_URL;

// Interfaces
interface Survey {
  id: number;
  name: string;
  teamNames: string[];
  teamIds: string[];
  description?: string;
  date_start?: string;
  date_end?: string;
  responseRates?: number[];
  createdAt?: string;
  created_by?: string;
  upperThreshold: number,
  lowerThreshold: number,
}

interface SurveyDataInterface {
  teamId : number ;
  team_name: string;
  survey_id : number,
  normalizedScore : number,
  teamResponseRate : number,
  scores: {
    category_id: number;
    category_name: string;
    score: number;
    adviceColor: string;
    
  }[]; }


export default function OverallReport() {
  // State Variables
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyDataInterface[]>([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Reusable function to fetch surveys
  const fetchSurveys = useCallback(async () => {
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
  }, []);
   // Fetch surveys only when the component mounts
   useEffect(() => {
    if (surveys.length === 0) {
      fetchSurveys();
    }
  }, [fetchSurveys, surveys]);

  // Derived Values
 
  const paramSurveyId = searchParams.get('surveyId');

  const currentSurveyId = useMemo(() => {
    const defaultId = surveys.length > 0 ? surveys[0].id : null;
    return paramSurveyId ? Number(paramSurveyId) : defaultId;
  }, [paramSurveyId, surveys]);

  const currentSurvey = useMemo(
    () => surveys.find((survey) => survey.id === currentSurveyId),
    [surveys, currentSurveyId]
  );

  //console.log('currentSurvey',currentSurvey);
  const uniqueTeamNames = useMemo(
    () => (currentSurvey ? Array.from(new Set(currentSurvey.teamNames)) : []),
    [currentSurvey]
  );
  const uniqueTeamIds = useMemo(
    () => (currentSurvey ? Array.from(new Set(currentSurvey.teamIds)) : []),
    [currentSurvey]
  );
 

// Fetch Selected Survey Data
useEffect(() => {
  if (!currentSurveyId) return;

  const fetchSurveyData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/reportsData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ survey_id: currentSurveyId }),
      });
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const result = await response.json();
     // console.log('result from overall ',result);

      // Enrich the surveyData with team names
      const overallReportData = result.category_scores.map((scoreData) => {
       const teamIndex = uniqueTeamIds.indexOf(scoreData.teamId);

        const team_name = teamIndex !== -1 ? uniqueTeamNames[teamIndex] : 'Unknown Team';
        const teamResponseRate = currentSurvey?.responseRates?.[teamIndex] ?? 0;
        return {
          ...scoreData,
          team_name,
          teamResponseRate,
        };
      });
      setSurveyData(overallReportData);
//console.log('overallReportData',overallReportData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    }
  };

  fetchSurveyData();
}, [currentSurveyId, uniqueTeamIds, uniqueTeamNames]);


/// prepare recommended teams pie charts data
//console.log('surveyData >>>',surveyData);


const recommendedTeams = useMemo(() => {
  if (!surveyData || surveyData.length === 0) {
    return Array(4).fill({
      name: 'No Data',
      value: 0,
      color: '#CCCCCC', // Default color for "No Data"
    });
  }

  const colors = ['#FF7043', '#FF9800', '#FFB300','#FFD700']; // Colors for the first 3 teams

  return surveyData.slice(0, 4).map((team, index) => ({
    name: team.team_name ? `Team ${team.team_name} \n Response Rate: ${team.teamResponseRate}%` : 'No Data',
    value: Number(team.normalizedScore) || 0, // Ensure value is numeric
    color: colors[index] || '#CCCCCC', // Assign colors dynamically
  }));
}, [surveyData]);

/// handle the survey list menu////
 const handleSurveyClick = useCallback(
  (surveyId: number) => {
    navigate(`?surveyId=${surveyId}`);
    
  },
  [navigate]
);
///// end handle the survey list menu////
///// handle the word cloud ///
const words = [
  { text: "Collaboration", value: 50 },
  { text: "Trust", value: 30 },
  { text: "Accountability", value: 20 },
  { text: "Conflict", value: 40 },
  { text: "Focus", value: 60 },
  { text: "Commitment", value: 35 },
];
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-[calc(100vh-112px)]">
        {/* Survey List */}
        <div className="w-64 border-r bg-white p-6">
        <div className="text-xl font-semibold mb-4 text-left" >Survey List</div>
          <div className="space-y-2">
            {surveys.map((survey) => (
              <button
                key={survey.id}
                onClick={() => handleSurveyClick(survey.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 ${
                  currentSurveyId === survey.id ? 'bg-gray-200' : ''
                }`}
              >
              Survey : {survey.name}
              </button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 p-6">
          
         
  <div className="flex justify-end mb-8">
          <Select
          defaultValue="overallReport"
          onValueChange={(value) => {
            if (value === "overallReport") {
              // Redirect to overall report with currentSurveyId
              navigate(`?surveyId=${currentSurveyId}`);
            } else {
              navigate(`/reports?surveyId=${currentSurveyId}&teamId=${value}`); // Navigate with teamId
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Overall Report" />
          </SelectTrigger>
          <SelectContent>
          
            {/* Overall Report Option */}
            <SelectItem value="overallReport" >Overall  Report</SelectItem>
            {/* Dynamic Team Report Options */}
            {uniqueTeamNames.map((teamName, index) => (
              <SelectItem
                key={`${currentSurveyId}-${index}`}
                value={uniqueTeamIds[index]}
              >
                Team {teamName} Report 
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

  </div>
  <div className="text-xl font-semibold mb-4">

            Overall Survey : {currentSurvey?.name} Report
          </div>

          <div className="space-y-6">
            {/* Survey Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Teams That May Need Attention</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-around h-[200px]">
                {
                
                recommendedTeams.map((data, index) => {
                  //const numericDrawValue = index === 0 ? data.value : (data.value / 5) * 100;
                  const numericDrawValue = data.value;
                  //const displayValue = index === 0 ? `${data.value}%` : `${data.value}`;
                  const displayValue = `${data.value} %`;
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
                        <div style={{ fontSize: '14px', color: 'black', fontWeight: '500',whiteSpace: 'pre-wrap' }}>{data.name}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        <br></br>

          {/* Teams Heatmap */}
          
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teams Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-600 text-sm">
                  {surveyData.some((team) => team.scores.length > 0) ? (
                <Heatmap data={surveyData} />
                    ) : (
                      <p>   No data available for the selected survey. Please ensure data is available.
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          
          <br></br>
          <div>
                <AggregateHighlightsWordCloud data={surveyData} />
    </div>
    <div> 
    <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements and Wishes</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-left w-full p-4 rounded-lg shadow-md bg-white">
              <QuestionSummarizer data={surveyData} />
                </div>
              </CardContent>
            </Card>
      </div>
        </div>
      </div>
    </div>
  );
}
