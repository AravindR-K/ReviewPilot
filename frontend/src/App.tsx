import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reviews from './pages/Reviews';
import SubmitReview from './pages/SubmitReview';
import ApprovalQueue from './pages/ApprovalQueue';
import TaskBoard from './pages/TaskBoard';
import Insights from './pages/Insights';
import AgentStatusPage from './pages/AgentStatus';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/submit" element={<SubmitReview />} />
          <Route path="/approvals" element={<ApprovalQueue />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/agents" element={<AgentStatusPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
