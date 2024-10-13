import { useEffect, useState, useCallback } from "react";
import { API } from "../api/api"
import { NavLink, Link, useNavigate, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

const WatchListBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [hasWatchListItems, setHasWatchListItems] = useState(false)
    const [showFindContent, setShowFindContent] = useState(true)
    const [showTheirWatchList, setShowTheirWatchList] = useState(false)
    const [watchList, setWatchList] = useState([])
    const navigate = useNavigate()
    const params = useParams()
    const user_id = params.user_id

    const handleRemoveWatchListItemClick = async (content) => {
        const { imdbid } = content
        try {
            const myQueueResponse = await API.delete(`network/mywatchlistdelete/${imdbid}/${cookies.profileID}/`)
            if (myQueueResponse.status === 204)
                fetchWatchList()
        } catch (error) {
            console.log(error, 'Not able to delete watchlist item')
        }
    }

    const handleContentClick = (content) => {
        const { imdbid } = content
        navigate(`/content/${imdbid}/`)
    }

    const fetchWatchList = useCallback(async () => {
        try {
            const myWatchListResponse = await API.get(`network/mywatchlist/${user_id}/`);
            const data = myWatchListResponse.data;
            setWatchList(data);
            setHasWatchListItems(data.length > 0);
            setShowFindContent(data.length <= 0);

            if (Number(user_id) !== cookies.profileID) {
                setShowTheirWatchList(true)
            }

        } catch (error) {
            console.log(error, 'Nothing in your watchlist yet!');
        }
    }, [user_id, cookies.profileID]);

    useEffect(() => {
        fetchWatchList();
    }, [fetchWatchList]);


    return (
        <div>
            <Link style={{ marginLeft: '10px' }} to={`/profile/${user_id}/`}><i style={{ fontSize: '30px', marginTop: '10px'}} className="fa-solid fa-angle-left"></i></Link>
            <div className='watchlistcontainer'>
                {showFindContent && !showTheirWatchList && (
                    <div className='emptyqueue'>
                        <div>
                            There's nothing in your Watchlist yet. <br></br>
                        </div>
                        <div>
                            <NavLink to='/search'><img height={'15px'} style={{ marginTop: '5px' }} alt='search-icon' src='/search-icon.png'></img></NavLink>
                        </div>
                        <Link to={'/search'}>Search</Link>
                    </div>
                )}
                {showFindContent && showTheirWatchList && (
                    <div className='emptyqueue'>
                        <div>
                            There's nothing in their Watchlist yet. <br></br>
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
                                    {content.content_type === 'Movie' && <i className="fa-solid fa-film"></i>}
                                    {content.content_type === 'Series' && <i className="fa-solid fa-tv"></i>}
                                    {content.content_type === 'Episode' && <i className="fa-solid fa-play"></i>}
                                </td>
                                <td>
                                    <div className='queueimageandoverlay'>
                                        {<img src={content.poster} width='75px' alt='no-poster'></img>}
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
                                    {Number(user_id) === cookies.profileID && <i style={{ marginTop: '5px', fontSize: '12px', marginLeft: '10px' }} onClick={() => handleRemoveWatchListItemClick(content)} className="fa-solid fa-xmark"></i>}

                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default WatchListBox;