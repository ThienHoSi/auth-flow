import { Route, Routes } from 'react-router'
import './App.css'
import HomePage from './views/HomePage'
import DashboardPage from './views/DashboardPage'

function App() {
  return <Routes>
    <Route index element={<HomePage />} />
    <Route path='/dashboard' element={<DashboardPage />} />
  </Routes>
}

export default App
