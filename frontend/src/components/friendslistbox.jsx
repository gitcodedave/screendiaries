import { useEffect, useState, useCallback } from "react";
import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { NavLink, Link, useNavigate, useParams } from "react-router-dom";

const FriendsListBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [hasWatchListItems, setHasWatchListItems] = useState(false)
    const [showFindContent, setShowFindContent] = useState(true)
    const [profilePictureState, setProfilePictureState] = useState(true)
    const [watchList, setWatchList] = useState([])
    const navigate = useNavigate()
    const params = useParams()
    const user_id = params.user_id

    const handleUserClick = (content) => {
        const { following } = content
        navigate(`/profile/${following}/`)
    }

    const fetchFriendsList = useCallback(async () => {
        try {
            const friendsListResponse = await API.get(`network/friendslist/${user_id}/`,
                {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
            const data = friendsListResponse.data;
            
            const cleanedData = data.map((item, i) => {
                let { profile_picture } = item.following_profile
                if(!profile_picture.includes('http://localhost:8000')){
                    profile_picture = 'http://localhost:8000' + profile_picture
                }
                item.following_profile.profile_picture = profile_picture
                return item
            })
            setWatchList(cleanedData);
            setHasWatchListItems(data.length > 0);
            setShowFindContent(data.length <= 0);
        } catch (error) {
            console.log(error, 'Nothing in your watchlist yet!');
        }
    }, [cookies.AccessToken, user_id]);

    useEffect(() => {
        fetchFriendsList();
    }, [fetchFriendsList]);


    return (
        <div className='watchlistcontainer'>
            {showFindContent && (
                <div className='emptyqueue'>
                    <div>
                        You haven't followed anyone yet. <br></br>
                    </div>
                    <div>
                        <NavLink to='/search'><img height={'15px'} style={{ marginTop: '5px' }} alt='search-icon' src='/search-icon.png'></img></NavLink>
                    </div>
                    <Link to={'/search'}>Search</Link>
                </div>
            )}
            <table className='watchlisttable'>
                <tbody>
                    {hasWatchListItems && watchList.map((content, i) =>
                        <tr key={`watchlist-item-${i}`}>
                            <td>
                                <div className='queueimageandoverlay'>
                                    {<img src={content.following_profile.profile_picture} width='75px' alt='no-poster'></img>}
                                    <div key={`queue-overlay-${i}`} onClick={() => handleUserClick(content)} className='overlay'>
                                        <i className="fa-regular fa-hand-pointer"></i>
                                    </div>
                                </div>
                            </td>
                            <td>
                                {content.following_profile.username}
                            </td>
                            <td>
                                {content.status === 'Watched' && <i className="fa-solid fa-check"></i>}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default FriendsListBox;