import './App.css'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import CustomerDashboard from './pages/CustomerDashboard'
import QuotationsPage from "./components/customer/quotations/QuotationsPage";
import Jobs from './pages/Jobs'
import Contact from './pages/Contact'
import WorkerDashboard from './pages/WorkerDashboard'
import HowItWorks from './pages/HowItWorks'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/find-jobs" element={<Jobs/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/how-it-works" element={<HowItWorks/>}/>
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

