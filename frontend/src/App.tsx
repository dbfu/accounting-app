import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './modules/auth/store/authStore'
import Layout from './components/Layout'
import Login from './modules/auth/pages/Login'
import Register from './modules/auth/pages/Register'
import Dashboard from './modules/dashboard/pages/Dashboard'
import Records from './modules/records/pages/Records'
import Categories from './modules/categories/pages/Categories'
import Statistics from './modules/statistics/pages/Statistics'
import Budget from './modules/budget/pages/Budget'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="records" element={<Records />} />
          <Route path="categories" element={<Categories />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="budget" element={<Budget />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App