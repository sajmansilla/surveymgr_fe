'use client';

import React, { useEffect, useState, useMemo, useCallback} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Label, LineChart, Line, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Heatmap from './Heatmap';

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

interface HeatMapDataInterface {
  teamId : number ;
  team_name: string;
  survey_id : number,
  scores: {
    category_id: number;
    category_name: string;
    score: number;
    adviceColor: string;
    
  }[]; }


export default function OverallReport() {
  // State Variables
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('0');
  const [heatMapData, setHeatMapData] = useState<HeatMapDataInterface[]>([]);

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

  const uniqueTeamNames = useMemo(
    () => (currentSurvey ? Array.from(new Set(currentSurvey.teamNames)) : []),
    [currentSurvey]
  );
  const uniqueTeamIds = useMemo(
    () => (currentSurvey ? Array.from(new Set(currentSurvey.teamIds)) : []),
    [currentSurvey]
  );
  const selectedTeamIndex = useMemo(
    () => uniqueTeamIds.indexOf(selectedTeam === '0' ? uniqueTeamIds[0] : Number(selectedTeam)),
    [selectedTeam, uniqueTeamIds]
  );
  const currentSurveyTeamResponseRate = useMemo(
    () =>
      currentSurvey?.responseRates?.[selectedTeamIndex] ?? 0,
    [currentSurvey, selectedTeamIndex]
  );
  const surveyOverview = useMemo(
    () => [
      {
        name: selectedTeam !== '0' ? 'Response Rate' : 'No Response Rate',
        value: selectedTeam !== '0' ? currentSurveyTeamResponseRate : 0,
        color: '#2196F3',
      },
      {
        name: selectedTeam !== '0' ? 'Response Rate' : 'No Response Rate',
        value: selectedTeam !== '0' ? currentSurveyTeamResponseRate : 0,
        color: '#4CAF50',
      }
      ,
      {
        name: selectedTeam !== '0' ? 'Response Rate' : 'No Response Rate',
        value: selectedTeam !== '0' ? currentSurveyTeamResponseRate : 0,
        color: '#FF7043',
        
      },
    ],
    [selectedTeam, currentSurveyTeamResponseRate]
  );

  /// Heat Map Code ///
  // Fetch Selected Survey Data
useEffect(() => {
  if (!currentSurveyId) return;

  const fetchSurveyData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ survey_id: currentSurveyId }),
      });
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const result = await response.json();
      //console.log('result from overall ',result);

      // Enrich the heatMapData with team names
      const enrichedHeatmapData = result.category_scores.map((scoreData) => {
       const teamIndex = uniqueTeamIds.indexOf(scoreData.teamId);

        const team_name = teamIndex !== -1 ? uniqueTeamNames[teamIndex] : 'Unknown Team';

        return {
          ...scoreData,
          team_name,
        };
      });
      setHeatMapData(enrichedHeatmapData);

    } catch (error) {
      console.error('Failed to fetch report data:', error);
    }
  };

  fetchSurveyData();
}, [currentSurveyId, uniqueTeamIds, uniqueTeamNames]);


 //console.log('heatMapData',heatMapData);
 const handleSurveyClick = useCallback(
  (surveyId: number) => {
    navigate(`?surveyId=${surveyId}`);
    
  },
  [navigate]
);
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
                <CardTitle>Survey Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-around h-[200px]">
                {
                
                surveyOverview.map((data, index) => {
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
          </div>
        <br></br>

          {/* Teams Heatmap */}
          
            <Card>
              <CardHeader>
                <CardTitle>Teams Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-600 text-sm">
                  {heatMapData.some((team) => team.scores.length > 0) ? (
                <Heatmap data={heatMapData} />
                    ) : (
                      <p>   No data available for the selected survey. Please ensure data is available.
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          
        </div>
      </div>
    </div>
  );
}
