import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const ProfileNavbar = () => {
    const [searchFriend, setSearchFriend] = useState('')
    const navigate = useNavigate()

    const handleSearch = (event) => {
        event.preventDefault();
        navigate(`/searchuser/${searchFriend}`);
    };

    return (
        <div className='navbarContainer'>
            <NavLink to='/profile'><img alt='screendiaries-logo' src='/screendiarieslogoalt.png' style={{ height: '30px', marginLeft: '20px' }}></img></NavLink>
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

export default ProfileNavbar;