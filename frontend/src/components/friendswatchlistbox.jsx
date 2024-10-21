import { useEffect, useState } from "react";
import { API } from "../api/api";
import { useCookies } from "react-cookie";
import { Link, NavLink, useNavigate } from "react-router-dom";


const FriendListBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [watchList, setWatchList] = useState([])
    const navigate = useNavigate()

    const handleContentClick = (content) => {
        const { imdbid } = content
        navigate(`/content/${imdbid}/`)
    }


    useEffect(() => {
        const fetchFriendWatchList = async () => {
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
                    const friendWatchListResponse = await API.get(`network/friendwatchlist/?user_list=${user_list}`,
                        {
                            headers: {
                                Authorization: `JWT ${cookies.AccessToken}`
                            }
                        });
                    const data = friendWatchListResponse.data
                    data.map((item, i) => {
                        let { profile_picture } = item.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        item.user_profile.profile_picture = profile_picture
                        return item
                    })
                    setWatchList(friendWatchListResponse.data)
                } catch (error) {
                    console.log(error, 'Unable to fetch friend watchlist')
                }
            }

        }
        fetchFriendWatchList()
    }, [cookies.profileID, cookies.AccessToken])

    return (
        <div>
            <Link style={{ marginLeft: '10px' }} to={`/profile/`}><i style={{ fontSize: '30px', marginTop: '10px' }} className="fa-solid fa-angle-left"></i></Link>
            <div className='watchlistcontainer'>
                {!watchList.length && (
                    <div className='emptyqueue'>
                        <div>
                            None of your friends have made a WatchList yet. <br></br>
                        </div>
                    </div>
                )}
                <table className='watchlisttable'>
                    <tbody>
                        {watchList.length > 0 && watchList.map((content, i) =>
                            <tr key={`watchlist-item-${i}`}>
                                <td>
                                    <div className='friendwatchlistprofile'>
                                        <NavLink to={`/profile/${content.user_profile.id}`}><img src={content.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '40px', width: '40px', objectFit: 'cover', marginRight: '10px' }}></img></NavLink>
                                        {content.user_profile.username}
                                    </div>
                                </td>
                                <td>
                                    {content.content_type === 'Movie' && <i className="fa-solid fa-film"></i>}
                                    {content.content_type === 'Series' && <i className="fa-solid fa-tv"></i>}
                                    {content.content_type === 'Episode' && <i className="fa-solid fa-play"></i>}
                                </td>
                                <td>
                                    <div className='queueimageandoverlay'>
                                        {<img src={content.poster} width='50px' alt='no-poster'></img>}
                                        <div key={`queue-overlay-${i}`} onClick={() => handleContentClick(content)} className='overlay'>
                                            <i className="fa-regular fa-hand-pointer"></i>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {content.title}
                                </td>
                                <td>
                                    {content.status === 'Watched' && <i className="fa-solid fa-check"></i>}
                                    {content.status === 'Currently Watching' && <i className="fa-regular fa-clock"></i>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FriendListBox;