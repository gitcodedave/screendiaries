import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from '../pages/auth';
import Profile from '../pages/profile';
import ProtectedRoute from './ProtectedRoute';

export function AppRoutes() {
    return (
        <>
            <Routes>
                <Route exact path="/auth" element={<Auth/>} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/" element={<Navigate to="/profile" />} />
            </Routes>
        </>
    );
}


export default AppRoutes;