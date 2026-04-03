// src/App.tsx – Router setup with all pages
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ToastContainer from './components/Toast'
import Landing from './pages/Landing'
import ReportForm from './pages/ReportForm'
import MyReports from './pages/MyReports'
import CampusMap from './pages/CampusMap'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* Toast notifications rendered above everything */}
        <ToastContainer />

        <div className="flex flex-col min-h-screen font-body">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/"          element={<Landing />} />
              <Route path="/report"    element={<ReportForm />} />
              <Route path="/my-reports" element={<MyReports />} />
              <Route path="/map"       element={<CampusMap />} />
              <Route path="/admin"     element={<AdminDashboard />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
