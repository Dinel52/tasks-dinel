import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Navigate } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import './App.css';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import UsersManagement from './pages/users';
import UserHistory from './pages/usershistory';
import Layout from './components/Layout';
import HomePage from './pages/home';
import Settings from './pages/settings';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route index element={<Navigate to="/home" replace />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route element={<Layout />}>
          <Route path='/home' element={<HomePage />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/reports" element={''} />
          <Route path="/admin/users/:id/history" element={<UserHistory />} />
          <Route path="/profile" element={''} />
          <Route path="/settings" element={<Settings/>} />
        </Route>
      </Route>
      <Route
        path='*'
        element={
          <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">404 - Not Found</h1>
            <p className="mb-8">The page you're looking for doesn't exist.</p>
            <a href="/" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              Back to Home
            </a>
          </div>
        }
      />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
