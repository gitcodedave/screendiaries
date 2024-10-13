import ProfileBox from '../components/profilebox'
import ProfileNavbar from '../components/profilenavbar';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { logout } = useAuth()


    return (
        <div>
            <ProfileNavbar />
            <ProfileBox />
            <div className='logoutbutton'>
            <button onClick={logout}>Logout</button>
            </div>
        </div>
    );
}

export default ProfilePage;