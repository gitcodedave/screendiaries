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
import OtherProfilePage from '../pages/otherprofilepage';
import FriendsListPage from '../pages/friendslistpage';
import SearchUserPage from '../pages/searchuserpage';
import ActivityFeedPage from '../pages/activityfeedpage';
import FriendWatchListPage from '../pages/FriendWatchListPage';
import ReviewFeedPage from '../pages/reviewfeedpage';
import RatingFeedPage from '../pages/ratingfeedpage';

export function AppRoutes() {
    return (
        <>
            <Routes>
                <Route exact path="/login" element={<LoginPage />} />
                <Route exact path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route exact path="/content/:imdbID" element={<ContentPage />} />
                    <Route exact path="/profile/:profileID" element={<OtherProfilePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/editprofile" element={<EditProfilePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/activityfeed" element={<ActivityFeedPage />} />
                    <Route path="/friendwatchlist" element={<FriendWatchListPage />} />
                    <Route path="/searchuser/:search_query" element={<SearchUserPage />} />
                    <Route path="/mywatchlist/:user_id" element={<WatchListPage />} />
                    <Route path="/myreviewfeed/:user_id" element={<ReviewFeedPage />} />
                    <Route path="/myratingfeed/:user_id" element={<RatingFeedPage />} />
                    <Route path="/friendslist/:user_id" element={<FriendsListPage />} />
                </Route>

                <Route path="/" element={<Navigate to="/profile" />} />
                <Route path="/pagenotfound" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/pagenotfound" />} />
            </Routes>
        </>
    );
}


export default AppRoutes;