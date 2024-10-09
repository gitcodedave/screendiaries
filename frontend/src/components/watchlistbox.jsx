import { useEffect, useState, useCallback } from "react";
import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { NavLink, Link } from "react-router-dom";

const WatchListBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [hasWatchListItems, setHasWatchListItems] = useState(false)
    const [showFindContent, setShowFindContent] = useState(true)
    const [watchList, setWatchList] = useState([])

    const fetchWatchList = useCallback(async () => {
        try {
            const myWatchListResponse = await API.get(`network/mywatchlist/${cookies.profileID}/`);
            const data = myWatchListResponse.data;
            setWatchList(data);
            setHasWatchListItems(data.length > 0);
            setShowFindContent(data.length <= 0);
        } catch (error) {
            console.log(error, 'Nothing in your watchlist yet!');
        }
    }, [cookies.profileID]);

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
            <table>
                <tbody>
                    {hasWatchListItems && watchList.map((content, i) =>
                        <tr key={`watchlist-item-${i}`}>
                            <td>
                            {<img src={content.poster} height='100px' alt='no-poster'></img>}
                            </td>
                            <td>
                                {content.title}
                            </td>
                            <td>
                                {content.status}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default WatchListBox;