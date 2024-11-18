import { NavLink, useParams } from "react-router-dom";
import { API } from "../api/api";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";


const WhosWatchingBox = () => {
    const params = useParams();
    const content_id = params.content_id;
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [userList, setUserList] = useState([])


    useEffect(() => {
        const fetchWatchListItems = async () => {
            let userList;
            try {
                const followingListResponse = await API.get(`network/friendslist/${cookies.profileID}/`,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    });
                const data = followingListResponse.data;
                userList = data.map((userObject, i) => {
                    return userObject.following
                })
            } catch (error) {
                console.log(error, 'Unable to fetch follow list')
            }
            if (userList.length) {
                try {
                    const user_list = userList.join(',');
                    const watchlistItemsResponse = await API.get(`network/whoswatching/?content_id=${content_id}&user_list=${user_list}`,
                        {
                            headers: {
                                Authorization: `JWT ${cookies.AccessToken}`
                            }
                        });
                    const data = watchlistItemsResponse.data
                    data.map((item, i) => {
                        let { profile_picture } = item.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        item.user_profile.profile_picture = profile_picture
                        return item
                    })
                    setUserList(data)
                } catch (error) {
                    console.log(error, 'Unable to fetch friend watchlist')
                }
            }
        }

        fetchWatchListItems()
    }, [cookies.AccessToken, cookies.profileID, content_id])


    return (
        <div>
            <div className='watchlistcontainer'>
                {!userList.length > 0 && (
                    <div className='emptyqueue'>
                        <div>
                            No one has watched this yet. <br></br>
                        </div>
                    </div>
                )}
                <table className='watchlisttable'>
                    <tbody>
                        {userList.length > 0 && userList.map((item, i) =>
                            <tr key={`watchlist-item-${i}`}>
                                <td>
                                    <div className='friendwatchlistprofile'>
                                        <NavLink to={`/profile/${item.user_profile.id}`}><img src={item.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '40px', width: '40px', objectFit: 'cover', marginRight: '10px' }}></img></NavLink>
                                        {item.user_profile.username}
                                    </div>
                                </td>
                                <td>
                                    {item.title}
                                </td>
                                <td>
                                    {item.status === 'Watched' && <i className="fa-solid fa-check"></i>}
                                    {item.status === 'Currently Watching' && <i className="fa-regular fa-clock"></i>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default WhosWatchingBox;