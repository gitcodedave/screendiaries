import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "../api/api";
import { useCookies } from "react-cookie";

const ProfileNavbar = () => {
    const [searchFriend, setSearchFriend] = useState('')
    const [updateCount, setUpdateCount] = useState('')
    const [cookies] = useCookies(['profileID', 'AccessToken']);

    const navigate = useNavigate()

    const handleSearch = (event) => {
        event.preventDefault();
        navigate(`/searchuser/${searchFriend}`);
    };


    useEffect(() => {
        const fetchUpdateCount = async () => {
            try {
                const updateCountResponse = await API.get(`network/myupdatecount/${cookies.profileID}/`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (updateCountResponse.status === 200) {
                    const data = updateCountResponse.data;
                    setUpdateCount(data)
                }
            } catch (error) {
                console.log(error, 'Unable to get update count')
            }
        }
        fetchUpdateCount()
    }, [cookies.AccessToken, cookies.profileID])

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
                <span style={{ fontWeight: 'bold', marginRight: '3px' }}>{updateCount}</span>
                <NavLink to='/updates'><i style={{ fontSize: '25px', marginRight: '10px' }} className="fa-solid fa-envelope"></i></NavLink>
                <NavLink to='/search'><i style={{ fontSize: '25px', marginRight: '10px' }} className="fa-solid fa-play"></i></NavLink>
                <img alt='message-icon' src='/message-icon.png' style={{ height: '20px', marginLeft: '5px', marginRight: '20px' }}></img>
            </div>
        </div>
    )
}

export default ProfileNavbar;