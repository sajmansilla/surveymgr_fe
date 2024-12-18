import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { LandingPage } from '@/components/landingpage';
import { SurveyDashboard, SurveyPreview } from '@/components/surveys';
import AddPeople from '@/components/AddPeople';
import AddTeams from '@/components/AddTeams';
import AddTeamMembers from '@/components/AddTeamMembers';
import AddCategories from '@/components/AddCategories';
import AddQuestions from '@/components/AddQuestions';
import CreateSurvey from '@/components/CreateSurvey';
import {ReportsDashboard} from '@/components/reports';

import { ViewSurvey } from '@/components/viewsurvey';
import TeamGaiaSurvey from '@/components/app_survey';
import Header from '@/components/Header';
import '@/App.css';

// Componente para condicionalmente renderizar el Header
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/'; // Oculta el header solo en "/"

  return (
    <>
      {!isLandingPage && <Header />}
      <div className={!isLandingPage ? 'pt-20' : ''}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/surveys" element={<SurveyDashboard />} />
          <Route path="/survey/:survey_id" element={<SurveyPreview />} />
          <Route path="/people" element={<AddPeople />} />
          <Route path="/teams" element={<AddTeams />} />
          <Route path="/assignments" element={<AddTeamMembers />} />
          <Route path="/categories" element={<AddCategories />} />
          <Route path="/questions" element={<AddQuestions />} />
          <Route path="/create-survey" element={<CreateSurvey />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/reports/:survey_id" element={<ReportsDashboard />} />
          <Route path="/view-survey/:survey_id" element={<ViewSurvey />} />
          <Route path="/team-gaia-survey" element={<TeamGaiaSurvey />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
