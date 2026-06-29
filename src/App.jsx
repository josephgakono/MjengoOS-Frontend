import './App.css'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import CustomerDashboard from './pages/CustomerDashboard'
import QuotationsPage from "./components/customer/quotations/QuotationsPage";
import Jobs from './pages/Jobs'
import Contact from './pages/Contact'

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
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/quotations" element={<QuotationsPage />}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

