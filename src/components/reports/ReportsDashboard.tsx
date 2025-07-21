'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Label, LineChart, Line, Legend, } from 'recharts';
import QuestionSummarizerByTeam from "./QuestionSummarizerByTeam";



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
  teamId: number;
  team_name: string;
  survey_id: number,
  normalizedScore: number,
  teamResponseRate: number,
  scores: {
    category_id: number;
    category_name: string;
    score: number;
    adviceColor: string;

  }[];
}


interface TrendData {
  survey: string;
  [category: string]: string | number;
}

interface TokenInfo {
  survey_id: number,
  team_id: number

}
export default function ReportsDashboard() {
  // State Variables
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyDataInterface[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoriesTrend, setCategoriesTrend] = useState<TrendData[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token, surveyId, teamId } = useParams(); // Get params from URL
  const navigate = useNavigate();

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



  useEffect(() => {
    const getTokenInfo = async () => {
      try {
        if (token != null) {
          // Validate token with the API
          const response = await fetch(`${apiUrl}/api/tokenInfo/${token}`);

          if (!response.ok) {
            throw new Error('Error in getting token info');
          }

          const tokenInfo = await response.json();
          setTokenInfo(tokenInfo);
        }
      } catch (error) {
        console.error('Error when validating the token:', error);

        // Ensure the error message is a string
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError('The token is invalid or expired.');

        // Pass the error message as a string in state
        navigate('/error', { state: { error: errorMessage } });
      }
    };

    getTokenInfo();
  }, [token, apiUrl, navigate]);


  // Get current Survey Info

  const currentSurveyId = useMemo(() => {
    const defaultId = surveys.length > 0 ? surveys[0].id : null;
    // Use tokenInfo.survey_id if available, else paramSurveyId, else defaultId
    return tokenInfo?.survey_id ?? (surveyId ? Number(surveyId) : defaultId);
  }, [tokenInfo, surveyId, surveys]);

  const currentSurvey = useMemo(
    () => surveys.find((survey) => survey.id === currentSurveyId),
    [surveys, currentSurveyId]
  );

  // Fetch Selected Survey Data//////////////


  const uniqueTeamNames = useMemo(
    () => (currentSurvey ? Array.from(new Set(currentSurvey.teamNames)) : []),
    [currentSurvey]
  );
  const uniqueTeamIds = useMemo(
    () => (currentSurvey ? Array.from(new Set(currentSurvey.teamIds)) : []),
    [currentSurvey]
  );


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
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      }
    };

    fetchSurveyData();
  }, [currentSurveyId, uniqueTeamIds, uniqueTeamNames]);


  // Get current Team Info


  const selectedTeam = useMemo(() => {
    const defaultId = surveys.length > 0 ? surveys[0].teamIds[0] : null;
    // Use tokenInfo.team_id if available, else paramSelectedTeamId, else defaultId
    return tokenInfo?.team_id ?? (teamId ? Number(teamId) : defaultId);
  }, [tokenInfo, teamId, surveys]);


  const getTeamData = (surveyData: Survey[][] | Survey[], selectedTeamId: number): Survey | null => {


    // Handle the case where surveyData is not nested
    if (!Array.isArray(surveyData[0])) {
      return (surveyData as Survey[]).find((survey) => survey.teamId === selectedTeamId) || null;
    }

    // Handle nested array case
    for (const surveyGroup of surveyData as Survey[][]) {
      const teamData = surveyGroup.find((survey) => survey.teamId === selectedTeamId);
      if (teamData) {
        return teamData;
      }
    }
    return null; // Return null if no team is found
  };

  const selectedTeamData = getTeamData(surveyData, Number(selectedTeam));


  //// prepare the team overview 
  const currentSurveyTeamResponseRate = useMemo(() => {
    if (!selectedTeamData || !selectedTeamData.teamResponseRate) {
      return 0; // Return 0 if selectedTeamData or responseRates is undefined
    }
    return selectedTeamData.teamResponseRate; // Safely access responseRates
  }, [currentSurvey, selectedTeamData]);

  const surveyOverview = useMemo(
    () => {
      const topScoreCategory = selectedTeamData?.scores.find((category) => category.top_score);
      const lowScoreCategory = selectedTeamData?.scores.find((category) => category.low_score);

      return [
        {
          name: selectedTeam !== '0' ? 'Response Rate' : 'No Response Rate',
          value: selectedTeam !== '0' ? currentSurveyTeamResponseRate : 0,
          color: '#2196F3',
        },
        {
          name:
            topScoreCategory && selectedTeam !== '0'
              ? `Be Proud of: ${topScoreCategory.category_name}`
              : 'No Top Score',
          value: topScoreCategory && selectedTeam !== '0' ? topScoreCategory.score : 0,
          color: '#4CAF50',
        },
        {
          name:
            lowScoreCategory && selectedTeam !== '0'
              ? `Keep Eye on: ${lowScoreCategory.category_name}`
              : 'No Low Score',
          value: lowScoreCategory && selectedTeam !== '0' ? lowScoreCategory.score : 0,
          color: '#FF7043',
        },
      ];
    },
    [selectedTeam, currentSurveyTeamResponseRate, selectedTeamData]
  );

  /// handle the survey list menu////
  const handleSurveyClick = useCallback(
    (surveyId: number) => {

      navigate(`/reports/overallReport/${surveyId}`);


    },
    [navigate]
  );
  ///// end handle the survey list menu////

  // Fetch Trend Data
  useEffect(() => {
    if (selectedTeam === '0') return; // Ensure selectedTeam is not "0"
    if (!currentSurvey || !currentSurvey.teamIds.includes(Number(selectedTeam))) {
      //console.log("not in the list");
      setCategoriesTrend([null]);
      return; // Exit if selectedTeam is not in the list
    }



    const fetchTrendData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/report/${selectedTeam}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const apiData = await response.json();

        const trendData: TrendData[] = apiData
          .filter((survey: any) => Array.isArray(survey.results) && survey.results.length > 0)
          .map((survey: any) => {
            const row: TrendData = { survey: survey.Survey };
            survey.results.forEach((result: any) => {
              row[result.category_name] = result.average;
            });
            return row;
          });

        setCategoriesTrend(trendData);
      } catch (error) {
        console.error("Failed to fetch trend data:", error);
      }
    };

    fetchTrendData();
  }, [selectedTeam, currentSurvey]); // Ensure dependencies include currentSurvey

  const handleLegendClick = (e: any) => {
    const categoryName = e.dataKey;
    setHiddenCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((category) => category !== categoryName)
        : [...prev, categoryName]
    );
  };
  ////end of trend data///

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-[calc(100vh-112px)]">
        {/* Survey List */}
        {!token && (
          <div className="w-64 border-r bg-white p-6">
            <div className="text-xl font-semibold mb-4 text-left" >Survey List</div>
            <div className="space-y-2">
              {surveys.map((survey) => (
                <button
                  key={survey.id}
                  onClick={() => handleSurveyClick(survey.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 ${currentSurveyId === survey.id ? 'bg-gray-200' : ''
                    }`}
                >
                  Survey : {survey.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Report Content */}
        <div className="flex-1 p-6">
          {/*display the team combo box only if the token is not sent*/}
          {!token && (

            <div className="flex justify-end mb-8">
              <Select

                onValueChange={(value) => {
                  if (value === "overallReport") {
                    // Redirect to overall report with currentSurveyId
                    navigate(`/reports/overallReport/${currentSurveyId}`);
                  } else {
                    navigate(`/reports/${currentSurveyId}/${value}`); // Navigate with teamId
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`Team ${uniqueTeamNames[uniqueTeamIds.indexOf(Number(selectedTeam))]} Report`} />

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
          )}
          <div className="text-xl font-semibold mb-4">
            Survey {currentSurvey?.name} ::: Team {selectedTeamData?.team_name} ::: Self Assessment Report

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
          {/* Grid with Team Scores and Conditional Credit Rating/Category Advice */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Team Scores Card */}

            {selectedTeam === "0" || !selectedTeamData || selectedTeamData.scores.filter(score => score.category_id !== 0 && score.score !== null).length <= 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Team Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-600 text-sm">
                    No team selected. Please select a team to view the scores.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Team Scores </CardTitle>


                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={selectedTeamData.scores.filter(score => score.category_id !== 0 && score.score !== null)}
                      layout="vertical"
                      margin={{ left: 30 }}
                    >
                      <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="category_name" type="category" interval={0} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontSize: '12px' }} />
                      <ReferenceLine x={currentSurvey?.lowerThreshold} stroke="red" strokeDasharray="3 3" />
                      <ReferenceLine x={currentSurvey?.upperThreshold} stroke="green" strokeDasharray="3 3" />
                      <Bar
                        dataKey="score"
                        name="Score"
                        onClick={(data) => {
                          setSelectedCategory(data);

                        }}

                        shape={(props: { payload?: any; x?: any; y?: any; width?: any; height?: any; }) => {
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
                </CardContent>
              </Card>
            )}

            {/* Conditional Rendering: Category Recommendations */}
            {selectedTeam === "0" || !selectedTeamData || selectedTeamData.scores.filter(score => score.category_id !== 0 && score.score !== null).length <= 0 ? (
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
                      className={`flex flex-col p-4 rounded-lg shadow-md ${selectedCategory.adviceColor === 'green' ? 'bg-green-100' :
                        selectedCategory.adviceColor === 'red' ? 'bg-red-100' :
                          selectedCategory.adviceColor === 'yellow' ? 'bg-orange-100' :
                            'bg-gray-50' // Default color
                        }`}
                    >
                      <div style={{ fontSize: '16px', color: 'black', fontWeight: '500' }}>{selectedCategory.category_name}</div>
                      <div className="text-sm text-gray-700 mt-2">{selectedCategory.advice}</div>
                    </div>
                  ) : (
                    selectedTeamData.scores.filter(score => score.category_id !== 0 && score.score !== null).length > 0 && (
                      <div
                        className={`flex flex-col p-4 rounded-lg shadow-md ${selectedTeamData.scores[0].adviceColor === 'green' ? 'bg-green-100' :
                          selectedTeamData.scores[0].adviceColor === 'red' ? 'bg-red-100' :
                            selectedTeamData.scores[0].adviceColor === 'yellow' ? 'bg-orange-100' :
                              'bg-gray-50' // Default color
                          }`}
                      >
                        <div style={{ fontSize: '16px', color: 'black', fontWeight: '500' }}>
                          {selectedTeamData.scores[0].category_name}
                        </div>
                        <div className="text-sm text-gray-700 mt-2">
                          {selectedTeamData.scores[0].advice}
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <br></br>
          {/* Category Numeric Questions Card */}
          {selectedTeam === "0" || !selectedTeamData || selectedTeamData.scores.filter(score => score.category_id !== 0 && score.score !== null).length <= 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Category Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-600 text-sm">
                  No team selected. Please select a team to view the questions.
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCategory
                    ? `Category "${selectedCategory.category_name}" Questions`
                    : selectedTeamData.scores.length > 0
                      ? `Category "${selectedTeamData.scores[0].category_name}" Questions`
                      : "Category Questions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600 text-sm w-full">
                  {selectedTeamData.scores.length > 0 ? (
                    selectedTeamData.scores
                      .filter((score) =>
                        selectedCategory
                          ? score.category_id === selectedCategory.category_id
                          : score.category_id === selectedTeamData.scores[0]?.category_id
                      )
                      .map((score) => (
                        <div
                          key={score.category_id}
                          className="w-full p-4 rounded-lg shadow-md bg-white"
                        >
                          <ul className="mt-2 space-y-2 text-left w-full">
                            {score.questions
                              ?.filter((question) => question.calc_method === "Avg")
                              .map((question, index) => (
                                <li
                                  key={`${score.category_id}-${index}`}
                                  className="grid grid-cols-[3fr_1fr] gap-4 items-center w-full"
                                >
                                  <span>
                                    {index + 1}. {question.question}
                                  </span>
                                  <span className="font-semibold text-gray-700 text-right">
                                    Score: "{question.Score}"
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      ))
                  ) : (
                    <span>No data available</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          <br></br>
          {/* Category Trend Card */}
          {
            selectedTeam === "0" && categoriesTrend.length <= 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Categories Trend no team  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-600 text-sm">
                    No team selected. Please select a team to view the trend.
                  </div>
                </CardContent>
              </Card>
            ) : categoriesTrend.length > 0 && categoriesTrend[0] ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Categories Trend data </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={categoriesTrend}>
                      <XAxis dataKey="survey" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 5]} />
                      <Tooltip contentStyle={{ fontSize: '12px' }} />
                      <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                        onClick={(e) => handleLegendClick(e)}
                      />
                      {/* Dynamically generate lines for each key in the dataset, excluding 'survey' */}
                      {Object.keys(categoriesTrend[0])
                        .filter((key) => key !== 'survey') // Exclude 'survey' key
                        .map((key, index) => (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={['#4CAF50', '#2196F3', '#FF9800', '#E91E63'][index % 4]} // Rotate colors for lines
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            hide={hiddenCategories.includes(key)} // Conditionally hide lines
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Categories Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-600 text-sm">
                    No data available for the selected team. Please ensure data is available.
                  </div>
                </CardContent>
              </Card>
            )}
          <br></br>
          {/* Category Non-Numeric Questions Card */}
          {selectedTeam !== "0" && selectedTeamData?.scores?.length > 0 ? (
            selectedTeamData.scores
              .filter(
                (category) =>
                  category.questions &&
                  category.questions.some((question) => question.calc_method === "Aggregate")
              )
              .map((category) => {
                const aggregateQuestions = category.questions.filter(
                  (question) => question.calc_method === "Aggregate"
                );

                return aggregateQuestions.length > 0 ? (
                  <Card key={category.category_id} className="mb-6">
                    {/* Card Header: Centered Category Name */}
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{category.category_name}</CardTitle>
                    </CardHeader>

                    {/* Card Content: Questions and Scores */}
                    <CardContent>
                      <div className="w-full p-4 rounded-lg shadow-md bg-white">
                        {aggregateQuestions.map((question, index) => (
                          <div key={`${category.category_id}-${index}`} className="w-full">
                            {/* Question Row */}
                            <div className="text-left text-blue-600 mb-1">
                              {index + 1}. {question.question}
                            </div>
                            {/* Answer/Score Row: Replace \n with new lines */}
                            <div className="text-left text-gray-700">
                              {question.Score.split("\n").map((line, idx) => (
                                <div key={idx}>* {line}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div> <br></br>
                      <div className="text-center text-gray-600 text-sm">
                        <p className="text-lg">{category.category_name} Highlights</p>
                      </div> <br></br><div className="text-left w-full p-4 rounded-lg shadow-md bg-white">
                        <QuestionSummarizerByTeam selectedTeamData={selectedTeamData} />
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })
          ) : (
            <div className="text-center text-gray-600 text-sm">
              No data available.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
