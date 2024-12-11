import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import SurveyFilters from './SurveyFilters';
import SurveyRow from './SurveyRow';
import { Survey } from '@/types';
import { Table, TableBody, TableHeader, TableHead, TableRow } from "@/components/ui/table";

// Refactor logic for filtering surveys
const filterSurveys = (surveys: Survey[], filter: string) => {
  const today = new Date();
  switch (filter) {
    case 'active':
      return surveys.filter(survey => 
        new Date(survey.dateEnd) > today && 
        new Date(survey.dateStart) <= today
      );
    case 'completed':
      return surveys.filter(survey => new Date(survey.dateEnd) <= today);
    case 'future':
      return surveys.filter(survey => survey.dateStart && new Date(survey.dateStart) >= today);
    default:
      return surveys;
  }
};

const SurveyDashboard: React.FC = () => {
  const [surveyData, setSurveyData] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  // Fetch data from API
  const fetchSurveyData = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/survey-dashboard`);
      const data = await response.json();
      setSurveyData(data.surveys);
      setFilteredSurveys(data.surveys);
    } catch (error) {
      console.error('Error fetching survey data:', error);
    }
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    fetchSurveyData();
  }, [fetchSurveyData]);

  // Update filtered surveys when filter changes
  useEffect(() => {
    setFilteredSurveys(filterSurveys(surveyData, filter));
  }, [filter, surveyData]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Surveys</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/create-survey')}>
          <Plus className="mr-2 h-4 w-4" /> Create new
        </Button>
      </div>
      <SurveyFilters filter={filter} setFilter={setFilter} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Name</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Responses</TableHead>
            <TableHead>%</TableHead>
            <TableHead>Date Start</TableHead>
            <TableHead>Date End</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSurveys.map(survey => (
            <SurveyRow key={survey.id} survey={survey} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SurveyDashboard;
