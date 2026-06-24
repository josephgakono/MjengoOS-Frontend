import './App.css'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes , Outlet } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import DashboardLayout from './components/DashboardLayout'
import CustomerDashboard from './pages/CustomerDashboard'
import WorkerDashboard from './pages/WorkerDashboard'


function App() {
  return (
    <>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route
          element={
            <>
              <Navbar />
              <Outlet /> {/* This renders Home or Auth components here */}
            </>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
        </Route>
          <Route path="customer" element={<CustomerDashboard />} />
          
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App

