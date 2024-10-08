import { useEffect, useState, useCallback } from "react";
import { API } from "../api/api"
import { NavLink, Link, useNavigate, useParams } from "react-router-dom";

const WatchListBox = () => {
    const [hasWatchListItems, setHasWatchListItems] = useState(false)
    const [showFindContent, setShowFindContent] = useState(true)
    const [watchList, setWatchList] = useState([])
    const navigate = useNavigate()
    const params = useParams()
    const user_id = params.user_id

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
        } catch (error) {
            console.log(error, 'Nothing in your watchlist yet!');
        }
    }, [user_id]);

    useEffect(() => {
        fetchWatchList();
    }, [fetchWatchList]);


    return (
        <div className='watchlistcontainer'>
            {showFindContent && (
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
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default WatchListBox;