import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { NavLink, Link, useParams } from "react-router-dom";


const RatingFeedBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [activityFeed, setActivityFeed] = useState([])
    const [showActivityFeed, setShowActivityFeed] = useState(false)
    const params = useParams()
    const user_id = params.user_id


    const handleAddToQueueClick = async (content, i) => {
        try {
            let queueData;
            if (content.activity_type === 'Review') {
                queueData = {
                    'user_profile': cookies.profileID,
                    'content': content.review.content.imdbid
                }
            } else {
                queueData = {
                    'user_profile': cookies.profileID,
                    'content': content.rating.content.imdbid
                }
            }
            await API.post(`/network/queueitems/`, queueData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            const newActivityFeed = [...activityFeed]
            newActivityFeed[i] = { ...newActivityFeed[i], in_queue: true }
            setActivityFeed(newActivityFeed)
        } catch (error) {
            console.log(error, 'Not able to add to queue')
        }
    }

    const handleRemoveFromQueueClick = async (content, i) => {
        try {
            let contentID;
            if (content.activity_type === 'Review') {
                contentID = content.review.content.imdbid
            } else {
                contentID = content.rating.content.imdbid
            }
            await API.delete(`network/myqueuedelete/${contentID}/${cookies.profileID}/`)
            const newActivityFeed = [...activityFeed]
            newActivityFeed[i] = { ...newActivityFeed[i], in_queue: false }
            setActivityFeed(newActivityFeed)
        } catch (error) {
            console.log(error, 'Not able to delete queue item')
        }
    }

    const handleWatchedClick = async (content, i) => {
        let contentID;
        if (content.activity_type === 'Review') {
            contentID = content.review.content.imdbid
        } else {
            contentID = content.rating.content.imdbid
        }
        try {
            const watchListData = {
                'user_profile': cookies.profileID,
                'content': contentID,
                'status': 'Watched'
            }
            const addToWatchListResponse = await API.post(`/network/watchlistitems/`, watchListData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addToWatchListResponse.status === 201) {
                await handleRemoveFromQueueClick(content, i)
                const newActivityFeed = [...activityFeed]
                newActivityFeed[i] = { ...newActivityFeed[i], in_watchlist: 'Watched' }
                setActivityFeed(newActivityFeed)
            }
        } catch (error) {
            console.log(error, 'Not able to add to watchlist, updating')
            try {
                const checkInWatchlist = await API.get(`/network/checkinwatchlist/${contentID}/${cookies.profileID}/`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                const watchListData = checkInWatchlist.data
                try {
                    const { id } = watchListData
                    const updateWatchListData = {
                        "status": "Watched"
                    }
                    await API.patch(`/network/watchlistitems/${id}/`, updateWatchListData, {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    });
                    const newActivityFeed = [...activityFeed]
                    newActivityFeed[i] = { ...newActivityFeed[i], in_queue: false, in_watchlist: 'Watched' }
                    setActivityFeed(newActivityFeed)
                } catch (error) {
                    console.log(error, 'Unable to patch watchlist')
                }


            } catch (error) {
                console.log(error, 'Unable to find in watchlist')
            }

        }

    }

    const handleCurrentlyWatchingClick = async (content, i) => {
        let contentID;
        if (content.activity_type === 'Review') {
            contentID = content.review.content.imdbid
        } else {
            contentID = content.rating.content.imdbid
        }
        try {
            const watchListData = {
                'user_profile': cookies.profileID,
                'content': contentID,
                'status': 'Currently Watching'
            }
            const addToWatchListResponse = await API.post(`/network/watchlistitems/`, watchListData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addToWatchListResponse.status === 201) {
                await handleRemoveFromQueueClick(content, i)
                const newActivityFeed = [...activityFeed]
                newActivityFeed[i] = { ...newActivityFeed[i], in_watchlist: 'Currently Watching' }
                setActivityFeed(newActivityFeed)
            }
        } catch (error) {
            console.log(error, 'Not able to add to watchlist')
        }

    }

    const handleNotWatchedClick = async (content, i) => {
        let contentID;
        if (content.activity_type === 'Review') {
            contentID = content.review.content.imdbid
        } else {
            contentID = content.rating.content.imdbid
        }
        try {
            await API.delete(`network/mywatchlistdelete/${contentID}/${cookies.profileID}/`)
            const newActivityFeed = [...activityFeed]
            newActivityFeed[i] = { ...newActivityFeed[i], in_queue: false, in_watchlist: null }
            setActivityFeed(newActivityFeed)
        } catch (error) {
            console.log(error, 'Not able to delete watchlist item')
        }
    }



    useEffect(() => {
        const fetchRatingFeed = async () => {
            try {
                const activityFeedResponse = await API.get(`network/myratingfeed/${user_id}`,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    });
                const data = activityFeedResponse.data;
                data.map((item, i) => {
                    if (item.activity_type === 'Review') {
                        let { profile_picture } = item.review.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        item.review.user_profile.profile_picture = profile_picture
                    } else {
                        let { profile_picture } = item.rating.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        item.rating.user_profile.profile_picture = profile_picture
                    }
                    return item
                })
                setActivityFeed(activityFeedResponse.data)
                if (activityFeedResponse.data.length > 0) {
                    setShowActivityFeed(true)
                }
            } catch (error) {
                console.log(error, 'Unable to fetch activity feed')
            }

        }
        fetchRatingFeed()
    }, [cookies.profileID, cookies.AccessToken, user_id])

    return (
        <div>
            <Link style={{ marginLeft: '10px' }} to={`/profile/${user_id}/`}><i style={{ fontSize: '30px', marginTop: '10px' }} className="fa-solid fa-angle-left"></i></Link>
            <div className='activityfeedpage'>
                <div className='activityfeedcontainer'>
                    {!activityFeed.length && user_id === cookies.profileID && (
                        <div className='emptyqueue'>
                            <div>
                                You haven't rated anything yet. <br></br>
                                Find some content! <br></br>
                            </div>
                            <div>
                                <NavLink to='/search'><img height={'15px'} style={{ marginTop: '5px' }} alt='search-icon' src='/search-icon.png'></img></NavLink>
                            </div>
                            <Link to={'/search'}>Search</Link>
                        </div>
                    )}
                    {!activityFeed.length && user_id !== cookies.profileID && (
                        <div className='emptyqueue'>
                            <div>
                                This user hasn't rated anything yet. <br></br>
                            </div>
                        </div>
                    )}
                    {showActivityFeed && activityFeed.map((item, i) => (
                        <div className='activityfeeditem' key={`feed-item=${i}`}>
                            {item.activity_type === 'Rating' &&
                                <div className='activityfeeditemblock'>
                                    <div className='activityfeedcontentblock'>
                                        <div>
                                            {item && <NavLink to={`/content/${item.rating.content.imdbid}`}><img className="activityfeedcontentposter" src={item.rating.content.poster} alt='no-poster'></img></NavLink>}
                                        </div>
                                        <div className='contentinfo'>
                                            <div className='contentinfoitem'>
                                                <strong>{item.rating.content.title}</strong> <span style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                                    {item.rating.rating} <i className="fa-solid fa-star"></i>
                                                </span> <br></br>
                                                {item.rating.content.content_type}
                                            </div>
                                            <div className='activityfeedcontentallbuttons'>
                                                <div className='activityfeedcontentinfobuttons'>
                                                    {item.in_watchlist === null && !item.in_queue && <button className='activityfeedqueue' onClick={() => handleAddToQueueClick(item, i)}><i className="fas fa-plus"></i> Add to queue</button>}
                                                    {item.in_watchlist === null && item.in_queue && <button className='activityfeedadded' onClick={() => handleRemoveFromQueueClick(item, i)}>In my queue <i className="fas fa-check"></i></button>}
                                                    {item.in_watchlist === 'Watched' && <button className='activityfeedwatched' onClick={() => handleNotWatchedClick(item, i)}>Watched <i className="fas fa-check"></i></button>}
                                                    {item.in_watchlist !== 'Watched' && <button className='activityfeednotwatched' onClick={() => handleWatchedClick(item, i)}>Watched <i className="fa-solid fa-question"></i></button>}
                                                </div>
                                                <div className='contentinfobuttons'>
                                                    {item.in_watchlist === null && item.in_watchlist !== 'Currently Watching' && <button className='activityfeedcurrentlywatching' onClick={() => handleCurrentlyWatchingClick(item, i)}><i className="fas fa-clock"></i> Watching</button>}
                                                    {<button className='activityfeedwhoswatching'><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='activityfeedengagement'>
                                        <div>
                                            <i className="fa-solid fa-thumbs-up"></i> React
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-message"></i> Comment
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-share-from-square"></i> Send To Friend
                                        </div>
                                    </div>
                                </div>
                            }
                            {item.activity_type === 'Review' &&
                                <div className='activityfeeditemblock'>
                                    <div className='activityfeedcontentblock'>
                                        <div>
                                            {item && <NavLink to={`/content/${item.review.content.imdbid}`}><img className="activityfeedcontentposter" src={item.review.content.poster} alt='no-poster'></img></NavLink>}
                                        </div>
                                        <div className='contentinfo'>
                                            <div className='contentinfoitem'>
                                                <strong>{item.review.content.title}</strong>                                    <span style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                                    {item.review.rating} <i className="fa-solid fa-star"></i>
                                                </span> <br></br>
                                                {item.review.content.content_type}
                                            </div>
                                            <div className='activityfeedcontentallbuttons'>
                                                <div className='activityfeedcontentinfobuttons'>
                                                    {item.in_watchlist === null && !item.in_queue && <button className='activityfeedqueue' onClick={() => handleAddToQueueClick(item, i)}><i className="fas fa-plus"></i> Add to queue</button>}
                                                    {item.in_watchlist === null && item.in_queue && <button className='activityfeedadded' onClick={() => handleRemoveFromQueueClick(item, i)}>In my queue <i className="fas fa-check"></i></button>}
                                                    {item.in_watchlist === 'Watched' && <button className='activityfeedwatched' onClick={() => handleNotWatchedClick(item, i)}>Watched <i className="fas fa-check"></i></button>}
                                                    {item.in_watchlist !== 'Watched' && <button className='activityfeednotwatched' onClick={() => handleWatchedClick(item, i)}>Watched <i className="fa-solid fa-question"></i></button>}
                                                </div>
                                                <div className='contentinfobuttons'>
                                                    {item.in_watchlist === null && item.in_watchlist !== 'Currently Watching' && <button className='activityfeedcurrentlywatching' onClick={() => handleCurrentlyWatchingClick(item, i)}><i className="fas fa-clock"></i> Watching</button>}
                                                    {<button className='activityfeedwhoswatching'><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='activityfeedengagement'>
                                        <div>
                                            <i className="fa-solid fa-thumbs-up"></i> React
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-message"></i> Comment
                                        </div>
                                        <div>
                                            <i className="fa-solid fa-share-from-square"></i> Send To Friend
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RatingFeedBox;