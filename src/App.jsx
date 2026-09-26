import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Vehicles from './pages/Vehicles.jsx';
import VehicleDetails from './pages/VehicleDetails.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import AddVehicle from './pages/AddVehicle.jsx';
import EditVehicle from './pages/EditVehicle.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import ManageVehicles from './pages/ManageVehicles.jsx';
import ManageBookings from './pages/ManageBookings.jsx';
import ManageMessages from './pages/ManageMessages';
import ManageDelays from './pages/ManageDelays.jsx';
import './App.css';

export default function App() {
  // Wrap the whole app with the auth context so every page can access login state.
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetails />} />
              <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/provider/dashboard" element={<ProtectedRoute roles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
              <Route path="/provider/add-vehicle" element={<ProtectedRoute roles={['provider']}><AddVehicle /></ProtectedRoute>} />
              <Route path="/provider/edit-vehicle/:id" element={<ProtectedRoute roles={['provider']}><EditVehicle /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
              <Route path="/admin/vehicles" element={<ProtectedRoute roles={['admin']}><ManageVehicles /></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><ManageBookings /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute roles={['admin']}><ManageMessages /></ProtectedRoute>} />
              <Route path="/admin/delays" element={<ProtectedRoute roles={['admin']}><ManageDelays /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}