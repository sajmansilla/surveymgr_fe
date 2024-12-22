'use client';

import React, { useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {Card,CardContent,CardHeader,CardTitle,} from '@/components/ui/card';
import {PieChart,Pie,Cell,BarChart, Bar,XAxis,YAxis,ResponsiveContainer,Tooltip,ReferenceLine,Label,LineChart,Line,Legend,} from 'recharts';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from '@/components/ui/select';

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
}

interface CategoryScore {
  category_id: number;
  category: string | number;
  score: number;
  advice: string;
  adviceColor: string;
  lowScore : Boolean;
  topScore : Boolean;
}

interface CategoryQuestions {
  category_name: ReactNode;
  category_id: number;
  questions: {
    Score: string;
    question_id: number;
    question: string;
    calc_method: string;
  }[];
}

interface TrendData {
  survey: string;
  [category: string]: string | number;
}

// Component
export default function ReportsDashboard() {
  // State Variables
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('0');
  const [categoryScoreData, setCategoryScoreData] = useState<CategoryScore[]>([]);
  const [categoryQuestions, setCategoryQuestions] = useState<CategoryQuestions[]>([]);
  const [categoriesTrend, setCategoriesTrend] = useState<TrendData[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const paramSurveyId = searchParams.get('surveyId');
  const paramSelectedTeamId = searchParams.get('teamId');

  

  const currentSurveyId = useMemo(() => {
    const defaultId = surveys.length > 0 ? surveys[0].id : null;
    return paramSurveyId ? Number(paramSurveyId) : defaultId;
  }, [paramSurveyId, surveys]);

  useEffect(() => {
    if (paramSelectedTeamId) {
      setSelectedTeam(paramSelectedTeamId);
    }
  }, [paramSelectedTeamId,selectedTeam]);


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
 


  const selectedTeamName = selectedTeam === '0' ? '' : uniqueTeamNames[selectedTeamIndex];
//console.log('uniqueTeamIds',uniqueTeamIds);

 //console.log('selectedTeamIndex',selectedTeamIndex);
 //console.log('selectedTeamName',selectedTeamName);

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
        name: categoryScoreData.some((category) => category.topScore) && selectedTeam !== '0' ? `Be Proud of: ${categoryScoreData.find((category) => category.topScore)?.category}` : 'No Top Score',
        value: categoryScoreData.some((category) => category.topScore) && selectedTeam !== '0'  ? categoryScoreData.find((category) => category.topScore)?.score : 0,
        color: '#4CAF50',
      }
      ,
      {
        name: categoryScoreData.some((category) => category.lowScore) && selectedTeam !== '0' ? `Keep Eye on: ${categoryScoreData.find((category) => category.lowScore)?.category}`: 'No Low Score',
        value: categoryScoreData.some((category) => category.lowScore) && selectedTeam !== '0' ? categoryScoreData.find((category) => category.lowScore)?.score  : 0,
        color: '#FF7043',
        
      },
    ],
    [selectedTeam, currentSurveyTeamResponseRate,categoryScoreData]
  );

 


  // Fetch Surveys (Only Once)
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/survey-dashboard`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        setSurveys(data.surveys || []);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      }
    };
    fetchSurveys();
  }, []);

  // Fetch Report Data
  useEffect(() => {
    if (!currentSurveyId || selectedTeam === '0') return;

    const fetchReportData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ survey_id: currentSurveyId }),
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const result = await response.json();
        const categoryScores: CategoryScore[] = result.category_scores.flatMap(
          (teamCategoryScores: any) =>
            teamCategoryScores.teamId === Number(selectedTeam)
              ? teamCategoryScores.scores.results.map((score: any) => ({
                  category_id: score.category_id,
                  category: score.category_name, 
                  score: score.score,
                  advice: score.advice,
                  adviceColor: score.adviceColor,
                  topScore: score.top_score? true: false,
                  lowScore: score.low_score? true: false,
                }))
              : []
        );
        
       
        setCategoryScoreData(categoryScores);
        
      } catch (error) {
        console.error('Failed to fetch report data:', error);
      }
    };

    fetchReportData();
  }, [currentSurveyId, selectedTeam]);

  // Fetch Categories and Questions
  useEffect(() => {
    if (!currentSurveyId || selectedTeam === '0') return;

    const fetchCategoriesAndQuestions = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/getQuestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            survey_id: currentSurveyId,
            team_id: selectedTeam,
          }),
        });
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data: CategoryQuestions[] = await response.json();
        setCategoryQuestions(data);
      } catch (error) {
        console.error('Failed to fetch categories and questions:', error);
      }
    };

    fetchCategoriesAndQuestions();
  }, [currentSurveyId, selectedTeam]);

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

  const handleSurveyClick = useCallback(
    (surveyId: number) => {
      navigate(`/reports/overallReport?surveyId=${surveyId}`);
      
    },
    [navigate]
  );

  const handleLegendClick = (e: any) => {
    const categoryName = e.dataKey;
    setHiddenCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((category) => category !== categoryName)
        : [...prev, categoryName]
    );
  };

  

  //////////////////////////////

  return (
    <div className="min-h-screen bg-white">
      <div className="text-sm text-gray-600 p-2 border-b">
        <h1 className="text-2xl font-semibold mb-6">
          {currentSurvey ? `${currentSurvey.name} Dashboard` : 'No Selected Survey'}
        </h1>
      </div>

      <div className="flex min-h-[calc(100vh-112px)]">
        <div className="w-64 border-r bg-white p-6">
          <div className="text-xl font-semibold mb-4">Survey List</div>
          <div className="space-y-2">
            {surveys.map((survey) => (
              <button
                key={survey.id}
                onClick={() => handleSurveyClick(survey.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-50 ${
                  currentSurveyId === survey.id ? 'bg-gray-200' : ''
                }`}
              >
                {survey.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
  <div className="flex justify-end mb-8">

  <Select
  
  onValueChange={(value) => {
    if (value === "overallReport") {
      // Redirect to overall report with currentSurveyId
      navigate(`/reports/overallReport?surveyId=${currentSurveyId}`);
    } else {
      //setSelectedTeam(value); // Update the selected team
      //setSelectedCategory(null); // Reset selected category when team changes
      navigate(`?surveyId=${currentSurveyId}&teamId=${value}`); // Navigate with teamId
    }
  }}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue  placeholder={`Team ${uniqueTeamNames[uniqueTeamIds.indexOf(Number(selectedTeam))]} Report`}/>
  </SelectTrigger>
  <SelectContent>
    {/* Overall Report Option */}
    <SelectItem value="overallReport" >Overall Report</SelectItem>
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
            Team {selectedTeamName} Self Assessment Survey Report
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

              {selectedTeam === "0"  || categoryScoreData.length <= 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Team Scores </CardTitle>
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
              {selectedTeam === "0" || categoryScoreData.length <= 0 ? (
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

                        <div style={{ fontSize: '16px', color: 'black', fontWeight: '500' }}>{selectedCategory.category}</div>
                        <div className="text-sm text-gray-700 mt-2"> {selectedCategory.advice}</div>
                      </div>
                    ) : (
                      categoryScoreData.length > 0 && (
                        <div
                          className={`flex flex-col p-4 rounded-lg shadow-md ${categoryScoreData[0].adviceColor === 'green' ? 'bg-green-100' :
                            categoryScoreData[0].adviceColor === 'red' ? 'bg-red-100' :
                              categoryScoreData[0].adviceColor === 'yellow' ? 'bg-orange-100' :
                                'bg-gray-50' // Default color
                            }`}
                        >
                          <div style={{ fontSize: '16px', color: 'black', fontWeight: '500'}}>
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

            </div>  <br></br>
{/* Category Numeric Questions Card */}

             {selectedTeam === "0" ?
              (

                <Card>
                  <CardHeader>
                    <CardTitle>Category Questions </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-600 text-sm">
                      No team selected. Please select a team to view the questions.
                    </div>
                  </CardContent>
                </Card>
              ) : (<Card>
                <CardHeader>
                <CardTitle> {selectedCategory? `Category" ${selectedCategory.category} "Questions`: categoryScoreData.length > 0 ? `Category "${categoryScoreData[0].category} " Questions `:"Category Questions" }</CardTitle>
                </CardHeader>
                <CardContent>
  <div className="text-gray-600 text-sm w-full">
    {categoryQuestions.length > 0 && (selectedCategory || categoryScoreData.length > 0) ? (
      categoryQuestions
        .filter((category) =>
          selectedCategory
            ? category.category_id === selectedCategory.category_id
            : category.category_id === categoryScoreData[0]?.category_id
        )
        .map((category) => (
          <div
            key={category.index}
            className="w-full p-4 rounded-lg shadow-md bg-white"
          >
            <ul key={category.index}  className="mt-2 space-y-2 text-left w-full">
              {category.questions.filter((question) => question.calc_method == "Avg").map((question, index) => (
                <li key={question.question_id} className="grid grid-cols-[3fr_1fr] gap-4 items-center w-full">
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
selectedTeam === "0" && categoriesTrend.length <= 0? (
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

            
{/* Category Non Numeric Questions Card */}
{selectedTeam !== "0" && categoryQuestions.length > 0 ? (
  categoryQuestions.map((category) => {
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
              <div key={question.question_id} className="w-full">
                {/* Question Row */}
                <div className="text-left text-blue-600 mb-1">
                  {index + 1}. {question.question}
                </div>
                {/* Answer/Score Row: Replace \n with new lines */}
                <div className="text-left text-gray-700">
                  {question.Score.split("\n").map((line: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, idx: React.Key | null | undefined) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ) : null;
  })
) : (
  <div className="text-center text-gray-600 text-sm">
  </div>
)}
        </div>
      </div>
    </div>
  );
}
