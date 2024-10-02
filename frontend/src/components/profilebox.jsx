import { useEffect, useState } from 'react';
import { API } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const ProfileBox = () => {
    const [profileNameState, setProfileNameState] = useState('')
    const [bioState, setBioState] = useState('')
    const [profilePictureState, setProfilePictureState] = useState('')
    const [cookies] = useCookies(['AccessToken']);
    const navigate = useNavigate()

    const handleEditProfileClick = (event) =>{
        event.preventDefault()
        navigate('/editprofile')
    }
    useEffect(() => {
        const fetchUser = async () => {
            const accessToken = cookies.AccessToken
            try {
                const userDataResponse = await API.get('/auth/users/me/', {
                    headers: {
                        Authorization: `JWT ${accessToken}`
                    }
                })
                const userData = userDataResponse.data
                setProfileNameState(userData.username)
                const userProfileResponse = await API.get(`/network/userprofiles/me`, {
                    headers: {
                        Authorization: `JWT ${accessToken}`
                    }
                })
                let { bio, profile_picture } = userProfileResponse.data
                setProfilePictureState(profile_picture)
                setBioState(bio)
            } catch (error) {
                console.error('Error refreshing token:', error);
                return null;
            }
        }
        fetchUser()
    }, [cookies.AccessToken])

    return (
        <div>
            <div className='profilename'>
                {profileNameState}{bioState}
                <button onClick={handleEditProfileClick}>Edit Profile</button>
            </div>
            <img src={profilePictureState} alt='profile pic' width='100px'></img>
        </div>
        
    );
};


export default ProfileBox;