import { useEffect, useState } from "react";
import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { Link, useNavigate, useParams } from "react-router-dom";

const SearchUserBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [hasWatchListItems, setHasWatchListItems] = useState(false)
    const [showFindContent, setShowFindContent] = useState(true)
    const [userList, setUserList] = useState([])
    const navigate = useNavigate()
    const params = useParams()
    const searchQuery = params.search_query

    const handleUserClick = (content) => {
        const { id } = content
        if (id === cookies.profileID) {
            navigate(`/profile/`)
        } else {
            navigate(`/profile/${id}/`)
        }
    }

    useEffect(() => {
        const searchUsers = async () => {
            try {
                const search = {
                    'search': searchQuery
                }
                const searchResponse = await API.get('/network/userprofiles/',
                    {
                        params: search,
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    },
                )
                const data = searchResponse.data
                const cleanedData = data.map((item, i) => {
                    let { profile_picture } = item
                    if (!profile_picture.includes('http://localhost:8000')) {
                        profile_picture = 'http://localhost:8000' + profile_picture
                    }
                    item.profile_picture = profile_picture
                    return item
                })
                setUserList(cleanedData)
                setHasWatchListItems(data.length > 0);
                setShowFindContent(data.length <= 0);
            } catch (error) {
                console.log(error, 'Unable to find users')
            }
        }

        searchUsers()
    }, [cookies.AccessToken, cookies.profileID, navigate, searchQuery]);


    return (
        <div>
            <Link style={{ marginLeft: '10px' }} to={`/profile/${cookies.profileID}/`}><i style={{ fontSize: '30px', marginTop: '10px' }} className="fa-solid fa-angle-left"></i></Link>
            <div className='watchlistcontainer'>
                {showFindContent && (
                    <div className='emptyqueue'>
                        <div>
                            Couldn't find users. Try a new search! <br></br>
                        </div>
                    </div>
                )}
                <table className='watchlisttable'>
                    <tbody>
                        {hasWatchListItems && userList.map((content, i) =>
                            <tr key={`watchlist-item-${i}`}>
                                <td>
                                    <div className='queueimageandoverlay'>
                                        {<img src={content.profile_picture} style={{ clipPath: 'circle()', objectFit: 'cover', height: '40px', width: '40px' }} alt='no-poster'></img>}
                                        <div key={`queue-overlay-${i}`} onClick={() => handleUserClick(content)} className='overlay'>
                                            <i className="fa-regular fa-hand-pointer"></i>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {content.username}
                                </td>
                                <td>
                                    {content.status === 'Watched' && <i className="fa-solid fa-check"></i>}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SearchUserBox;