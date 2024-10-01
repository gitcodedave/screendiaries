import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/loginpage';
import Profile from '../pages/profile';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/notfound404';

export function AppRoutes() {
    return (
        <>
            <Routes>
                <Route exact path="/login" element={<LoginPage/>} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="/" element={<Navigate to="/profile" />} />
                <Route path="/pagenotfound" element={<NotFoundPage/>} />
                <Route path="*" element={<Navigate to ="/pagenotfound"/>} />
            </Routes>
        </>
    );
}


export default AppRoutes;