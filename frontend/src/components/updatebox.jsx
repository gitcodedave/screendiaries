import { useState, useCallback, useEffect } from "react";
import { API } from "../api/api";
import { useCookies } from "react-cookie";
import { NavLink } from "react-router-dom";

const UpdateBox = () => {
    const [updateList, setUpdateList] = useState([])
    const [cookies] = useCookies(['profileID', 'AccessToken']);



    const fetchUpdates = useCallback(async () => {
        try {
            const myUpdatesResponse = await API.get(`network/myupdates/${cookies.profileID}/`, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            const data = myUpdatesResponse.data;
            if (data.length > 0) {
                const cleanedData = data.map((item, i) => {
                    let { profile_picture } = item.follower
                    if (!profile_picture.includes('http://localhost:8000')) {
                        profile_picture = 'http://localhost:8000' + profile_picture
                    }
                    item.follower.profile_picture = profile_picture
                    return item
                })
                setUpdateList(cleanedData);
                try {
                    await API.get(`network/myupdatesread/${cookies.profileID}/`, {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    });
                } catch (error) {
                    console.log(error, 'Unable to mark updates as Read')
                }
            }
        } catch (error) {
            console.log(error, 'No updates yet!');
        }
    }, [cookies.profileID, cookies.AccessToken]);

    useEffect(() => {
        fetchUpdates()
    }, [fetchUpdates])

    return (
        <div className='updatescontainer'>
            {updateList.length === 0 && (
                <div className='emptyqueue'>
                    <div>
                        No new updates yet. <br></br>
                    </div>
                </div>
            )}
            <div className='updatestable'>
                <table>
                    <tbody>
                        {updateList.length > 0 && updateList.map((update, i) => (
                            <tr className={`updatestablerow${update.read_status.toString()}`} key={`update-row-${i}`}>
                                <td>
                                    {update.update_type === 'Follow' && (
                                        <div className='updatestabledata'>
                                            <NavLink to={`/profile/${update.follower.id}`}><img src={update.follower.profile_picture} style={{ clipPath: 'circle()', objectFit: 'cover', height: '40px', width: '40px' }} alt='profile-picture'></img></NavLink>
                                            <div>
                                            <NavLink to={`/profile/${update.follower.id}`} style={{textDecoration: 'none'}}> <strong>{update.follower.username}</strong> followed you!</NavLink>
                                            </div>
                                        </div>
                                    )
                                    }
                                    {update.update_type === 'Reaction' && (
                                        <div className='updatestabledata'>
                                            <NavLink to={`/profile/${update.follower.id}`}><img src={update.follower.profile_picture} style={{ clipPath: 'circle()', objectFit: 'cover', height: '40px', width: '40px' }} alt='profile-picture'></img></NavLink>
                                            <div>
                                            <NavLink to={`/activity/${Number(update.activity_feed_item.id)}`} style={{textDecoration: 'none'}}> <strong>{update.follower.username}</strong> reacted to your {update.activity_feed_item.activity_type}!</NavLink>
                                            </div>
                                        </div>
                                    )
                                    }
                                    {update.update_type === 'Reply' && (
                                        <div className='updatestabledata'>
                                            <NavLink to={`/profile/${update.follower.id}`}><img src={update.follower.profile_picture} style={{ clipPath: 'circle()', objectFit: 'cover', height: '40px', width: '40px' }} alt='profile-picture'></img></NavLink>
                                            <div>
                                            <NavLink to={`/activity/${Number(update.activity_feed_item.id)}`} style={{textDecoration: 'none'}}> <strong>{update.follower.username}</strong> replied to your comment!</NavLink>
                                            </div>
                                        </div>
                                    )
                                    }
                                    {update.update_type === 'Comment' && (
                                        <div className='updatestabledata'>
                                            <NavLink to={`/profile/${update.follower.id}`}><img src={update.follower.profile_picture} style={{ clipPath: 'circle()', objectFit: 'cover', height: '40px', width: '40px' }} alt='profile-picture'></img></NavLink>
                                            <div>
                                            <NavLink to={`/activity/${Number(update.activity_feed_item.id)}`} style={{textDecoration: 'none'}}> <strong>{update.follower.username}</strong> commented on your {update.activity_feed_item.activity_type}!</NavLink>
                                            </div>
                                        </div>
                                    )
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UpdateBox;