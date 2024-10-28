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
import UpdatePage from '../pages/updatepage';
import ActivityPage from '../pages/activitypage';
import ReactionListPage from '../pages/reactionlistpage';

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
                    <Route path="/updates" element={<UpdatePage />} />
                    <Route path="/editprofile" element={<EditProfilePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/activityfeed" element={<ActivityFeedPage />} />
                    <Route path="/activity/:activity_id" element={<ActivityPage />} />
                    <Route path="/reactionlist/:activity_id" element={<ReactionListPage />} />
                    <Route path="/friendwatchlist" element={<FriendWatchListPage />} />
                    <Route path="/searchuser/:search_query" element={<SearchUserPage />} />
                    <Route path="/mywatchlist/:user_id" element={<WatchListPage />} />
                    <Route path="/reviewfeed/:user_id" element={<ReviewFeedPage />} />
                    <Route path="/ratingfeed/:user_id" element={<RatingFeedPage />} />
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