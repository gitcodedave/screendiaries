import Navbar from '../components/navbar';
import ProfileBox from '../components/profilebox'
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { logout } = useAuth()

    return (
        <div>
            <Navbar/>
             <button onClick={logout}>logout</button>
            <ProfileBox />
        </div>
    );
}

export default ProfilePage;