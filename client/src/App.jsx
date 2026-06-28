import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import DressDetail from './pages/DressDetail';
import CalendarPage from './pages/CalendarPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDresses from './pages/AdminDresses';
import AdminStats from './pages/AdminStats';
import NotFound from './pages/NotFound';

export default function App() {
  // Hide the public footer on admin pages for a more app-like feel.
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* Keying on pathname remounts the main region on navigation, which
          re-triggers the fade-in for a smooth page transition. */}
      <main key={pathname} className="flex-1 animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/dresses/:id" element={<DressDetail />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dresses"
            element={
              <ProtectedRoute>
                <AdminDresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute>
                <AdminStats />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
