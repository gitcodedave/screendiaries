import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
    const [searchFriend, setSearchFriend] = useState('')
    const navigate = useNavigate()

    const handleSearch = (event) => {
        event.preventDefault();
        navigate(`/searchuser/${searchFriend}`);
    };



    return (
        <div className='navbarContainer'>
            <NavLink to='/profile'><img alt='screendiaries-logo' src='/screendiarieslogoflat.png' style={{ height: '40px', marginLeft: '20px' }}></img></NavLink>
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
                <NavLink style={{ textDecoration: 'none' }} to='/search'><span style={{ marginRight: '2px', 'color': '#ccc3bc' }}> Content </span></NavLink>
                <NavLink to='/search'><i style={{ marginBottom: '5px', marginRight: '5px' }} className="fa-solid fa-play"></i></NavLink>
                <img alt='message-icon' src='/message-icon.png' style={{ height: '20px', marginLeft: '5px', marginRight: '20px' }}></img>
            </div>
        </div>
    )
}

export default Navbar;