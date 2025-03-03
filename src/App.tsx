import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { LandingPage } from '@/components/landingpage';
import { SurveyDashboard, SurveyPreview, SurveyForm } from '@/components/surveys';
import ErrorPage from './components/ErrorPage';
import AddPeople from '@/components/AddPeople';
import AddTeams from '@/components/AddTeams';
import AddTeamMembers from '@/components/AddTeamMembers';
import AddCategories from '@/components/AddCategories';
import AddQuestions from '@/components/AddQuestions';
import CreateSurvey from '@/components/CreateSurvey';
import { ReportsDashboard } from '@/components/reports';
import { OverallReport } from '@/components/reports';
import { ViewSurvey } from '@/components/viewsurvey';
import Header from '@/components/Header';
import ThanksPage from '@/components/surveys/ThanksPage';
import { TeamReportsPDF } from '@/components/reports';


import '@/App.css';

// Componente para condicionalmente renderizar el Header
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/'; // Hide header on landing page
  const isSurveyForm = location.pathname.includes('/answer-survey') // Hide header on survey form
  const isErrorPage = location.pathname.includes('/error') // Hide header on error page
  const isThanksPage = location.pathname.includes('/thanks') // Hide header on Thanks page
  const isViewOverallReport = location.pathname.includes('/viewOverallReport')
  const isViewTeamReport = location.pathname.includes('/viewTeamReport')
  const isViewTeamReportPDF = location.pathname.includes('/viewTeamReportPDF')

  const hideHeader = isLandingPage || isSurveyForm || isErrorPage || isThanksPage || isViewOverallReport || isViewTeamReport || isViewTeamReportPDF;

  return (
    <>
      {!hideHeader && <Header />}
      <div className={(!hideHeader) ? 'pt-20' : ''}>
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
          <Route path="/answer-survey/:survey_id/:token" element={<SurveyForm />} />
          <Route path="/view-survey/:survey_id" element={<ViewSurvey />} />
          <Route path="/people" element={<AddPeople />} />
          <Route path="/teams" element={<AddTeams />} />
          <Route path="/assignments" element={<AddTeamMembers />} />
          <Route path="/categories" element={<AddCategories />} />
          <Route path="/questions" element={<AddQuestions />} />
          <Route path="/create-survey" element={<CreateSurvey />} />
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/reports/:surveyId/:teamId" element={<ReportsDashboard />} />
          <Route path="/viewTeamReport/:token" element={<ReportsDashboard />} />
          <Route path="/viewTeamReportPDF/:token" element={<TeamReportsPDF />} />
          <Route path="/reports/overallReport" element={<OverallReport />} />
          <Route path="/reports/overallReport/:surveyId" element={<OverallReport />} />
          <Route path="/viewOverallReport/:token" element={<OverallReport />} />
          <Route path="/viewOverallReport/:token/:surveyId" element={<OverallReport />} />
          <Route path="/reports/:survey_id" element={<ReportsDashboard />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/thanks" element={<ThanksPage />} />
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;
