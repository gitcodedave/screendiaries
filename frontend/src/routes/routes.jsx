import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/loginpage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/notfound404';
import RegisterPage from '../pages/registerpage';
import ProfilePage from '../pages/profilepage';
import EditProfilePage from '../pages/editprofilepage';
import SearchPage from '../pages/searchpage';
import ContentPage from '../pages/contentpage';
import WatchListPage from '../pages/watchlistpage';

export function AppRoutes() {
    return (
        <>
            <Routes>
                <Route exact path="/login" element={<LoginPage />} />
                <Route exact path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route exact path="/content/:imdbID" element={<ContentPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/editprofile" element={<EditProfilePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/mywatchlist" element={<WatchListPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/profile" />} />
                <Route path="/pagenotfound" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/pagenotfound" />} />
            </Routes>
        </>
    );
}


export default AppRoutes;