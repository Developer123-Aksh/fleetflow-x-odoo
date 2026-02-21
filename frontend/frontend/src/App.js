import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Dispatcher from './pages/Dispatcher';
import Drivers from './pages/Drivers';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import './styles.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <div className="content">
      {children}
    </div>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/dispatch" element={<Dispatcher />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/fuel" element={<FuelExpenses />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
