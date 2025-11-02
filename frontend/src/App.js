import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="payroll" element={<Payroll />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
