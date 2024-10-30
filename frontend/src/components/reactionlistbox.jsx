import { API } from "../api/api";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";


const ReactionListBox = () => {
    const navigate = useNavigate()
    const params = useParams()
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [userList, setUserList] = useState([])

    const handleUserClick = (content) => {
        const { id } = content.user_profile
        if (id === cookies.profileID) {
            navigate(`/profile/`)
        } else {
            navigate(`/profile/${id}/`)
        }
    }

    useEffect(() => {
        const fetchReactionList = async () => {
            let reactionListResponse
            try {
                reactionListResponse = await API.get(`network/reactionlist/${params.activity_id}/`,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    });
                const data = reactionListResponse.data.reactions
                const cleanedData = data.map((item, i) => {
                    let { profile_picture } = item.user_profile
                    if (!profile_picture.includes('http://localhost:8000')) {
                        profile_picture = 'http://localhost:8000' + profile_picture
                    }
                    item.user_profile.profile_picture = profile_picture
                    return item
                })
                setUserList(cleanedData)
            } catch (error) {
                console.log(error, 'Unable to fetch follow list')
            }
        }
        fetchReactionList()
    }, [cookies.profileID, cookies.AccessToken, params.activity_id])



    return (
        <div>
            <div className='watchlistcontainer'>
                {userList.length === 0 && (
                    <div className='emptyqueue'>
                        <div>
                            No one has reacted to this yet. <br></br>
                        </div>
                    </div>
                )}
                <table className='watchlisttable'>
                    <tbody>
                        {userList.length > 0 && userList.map((content, i) =>
                            <tr key={`watchlist-item-${i}`}>
                                <td>
                                    <div className='queueimageandoverlay'>
                                        {<img src={content.user_profile.profile_picture} style={{clipPath: 'circle()', objectFit: 'cover', height: '40px', width: '40px' }} alt='profile-picture'></img>}
                                        <div key={`queue-overlay-${i}`} onClick={() => handleUserClick(content)} className='overlay'>
                                            <i className="fa-regular fa-hand-pointer"></i>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {content.user_profile.username}
                                </td>
                                <td>
                                    {content.reaction === 'Thumbs Up' && (
                                        <i className="fa-solid fa-thumbs-up"></i>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ReactionListBox;