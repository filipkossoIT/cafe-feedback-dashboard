import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import { RequireAuth } from './components/RequireAuth'
import Landing from './routes/Landing'
import Signup from './routes/Signup'
import Login from './routes/Login'
import FeedbackForm from './routes/FeedbackForm'
import Dashboard from './routes/Dashboard'
import Settings from './routes/Settings'
import NotFound from './routes/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/f/:slug" element={<FeedbackForm />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
