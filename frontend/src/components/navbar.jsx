import { NavLink } from "react-router-dom";
import { useState } from "react";
import { API } from "../api/api";
import { useCookies } from "react-cookie";

const Navbar = () => {
    const [searchFriend, setSearchFriend] = useState('')
    const [cookies] = useCookies(['AccessToken'])

    const handleSearchFriendClick = async (e) => {
        e.preventDefault()
        try {
            const search = {
                'search': searchFriend
            }
            const searchResponse = await API.get('/network/userprofiles/',
                {
                    params: search,
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                },
            )
            console.log(searchResponse.data)
        } catch (error) {
            console.log(error, 'Unable to find users')
        }
    }



    return (
        <div className='navbarContainer'>
            <NavLink to='/profile'><img alt='screendiaries-logo' src='/screendiarieslogoflat.png' style={{ height: '40px', marginLeft: '20px' }}></img></NavLink>
            <form onSubmit={handleSearchFriendClick} style={{ marginLeft: '20px' }}>
                <input
                    value={searchFriend}
                    onChange={(e) => setSearchFriend(e.target.value)}
                    style={{ width: '100px' }}
                    placeholder='Find friends'
                >
                </input>
                <img alt='search-icon' onClick={handleSearchFriendClick} src='/search-icon.png' style={{ marginLeft: '10px', height: '12px', marginRight: '30px' }}></img>
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