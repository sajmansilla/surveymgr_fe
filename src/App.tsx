// App.tsx

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from '@/components/LandingPage';
import Surveys from '@/components/Surveys';
import CreateSurvey from '@/components/CreateSurvey';
import Report from '@/components/Report';
import '@/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/create-survey" element={<CreateSurvey />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;