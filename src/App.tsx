// App.tsx

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/components/landingpage';
import { SurveyDashboard } from '@/components/surveys';
import CreateSurvey from '@/components/CreateSurvey';
import Report from '@/components/Report';
import EditSurvey from '@/components/EditSurvey';
import '@/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/surveys" element={<SurveyDashboard />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        <Route path="/report" element={<Report />} />
        <Route path="/edit-survey/:id" element={<EditSurvey />} />
      </Routes>
    </Router>
  );
}

export default App;