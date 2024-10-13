import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const Navbar = () => {
    const [searchFriend, setSearchFriend] = useState('')
    const [profilePictureState, setProfilePictureState] = useState('')
    const navigate = useNavigate()
    const [cookies] = useCookies(['profileID', 'AccessToken', 'profile_picture'])

    const handleSearch = (event) => {
        event.preventDefault();
        navigate(`/searchuser/${searchFriend}`);
    };

    useEffect(() => {
        let profile_picture = cookies.profile_picture
        if (!profile_picture.includes('http://localhost:8000')) {
            profile_picture = 'http://localhost:8000' + profile_picture
        }
        setProfilePictureState(profile_picture)
    }, [cookies.profile_picture])

    return (
        <div className='navbarContainer'>
            <NavLink to='/profile'><img src={profilePictureState} style={{padding: '0px', outlineWidth: '0.5px', outlineColor: '#92765f', outlineStyle: 'solid', marginLeft: '10px', clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover'}} alt='profile pic'></img></NavLink>

            <form onSubmit={handleSearch} style={{ marginLeft: '20px' }}>
                <input
                    value={searchFriend}
                    onChange={(e) => setSearchFriend(e.target.value)}
                    style={{ width: '100px' }}
                    placeholder='Find friends'
                    type="text"
                />
                <button type="submit" style={{ background: 'none', border: 'none', padding: 0, marginLeft: '10px' }}>
                    <img alt='search-icon' src='/search-icon.png' style={{ height: '12px', marginRight: '30px' }} />
                </button>
            </form>
            <div className='push'>
                <NavLink to='/search'><i style={{ fontSize: '25px', marginRight: '10px' }} className="fa-solid fa-play"></i></NavLink>
                <img alt='message-icon' src='/message-icon.png' style={{ height: '20px', marginLeft: '5px', marginRight: '20px' }}></img>
            </div>
        </div>
    )
}

export default Navbar;