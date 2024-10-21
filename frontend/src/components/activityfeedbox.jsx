import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";


const ActivityFeedBox = ({ onQueueUpdate, updateQueueSignal }) => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [activityFeed, setActivityFeed] = useState([])
    const [showActivityFeed, setShowActivityFeed] = useState(false)

    const updateActivityQueue = (newActivityFeed, imdbid) => {
        newActivityFeed.map((item, i) => {
            if (item.activity_type === 'Review') {
                if (item.review.content.imdbid === imdbid) {
                    item.in_queue = !item.in_queue
                }
            }
            if (item.activity_type === 'Rating') {
                if (item.rating.content.imdbid === imdbid) {
                    item.in_queue = !item.in_queue
                }
            }
            return item
        })
    }

    const handleReactClick = () => {
        return;
    }

    const updateActivityWatchlist = (newActivityFeed, imdbid, status) => {
        newActivityFeed.map((item, i) => {
            if (item.activity_type === 'Review') {
                if (item.review.content.imdbid === imdbid) {
                    item.in_watchlist = status
                }
            }
            if (item.activity_type === 'Rating') {
                if (item.rating.content.imdbid === imdbid) {
                    item.in_watchlist = status
                }
            }
            return item
        })
    }


    const handleAddToQueueClick = async (content, imdbid) => {
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
            updateActivityQueue(newActivityFeed, imdbid)
            setActivityFeed(newActivityFeed)
            onQueueUpdate();
        } catch (error) {
            console.log(error, 'Not able to add to queue')
        }
    }

    const handleRemoveFromQueueClick = async (content, imdbid) => {
        try {
            let contentID;
            if (content.activity_type === 'Review') {
                contentID = content.review.content.imdbid
            } else {
                contentID = content.rating.content.imdbid
            }
            await API.delete(`network/myqueuedelete/${contentID}/${cookies.profileID}/`)
            const newActivityFeed = [...activityFeed]
            updateActivityQueue(newActivityFeed, imdbid)
            setActivityFeed(newActivityFeed)
            onQueueUpdate();
        } catch (error) {
            console.log(error, 'Not able to delete queue item')
        }
    }


    const handleWatchedClick = async (content, imdbid) => {

        try {
            const watchListData = {
                'user_profile': cookies.profileID,
                'content': imdbid,
                'status': 'Watched'
            }
            const addToWatchListResponse = await API.post(`/network/watchlistitems/`, watchListData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addToWatchListResponse.status === 201) {
                await handleRemoveFromQueueClick(content, imdbid)
                const newActivityFeed = [...activityFeed]
                updateActivityWatchlist(newActivityFeed, imdbid, 'Watched')
                setActivityFeed(newActivityFeed)
            }
        } catch (error) {
            console.log(error, 'Not able to add to watchlist, updating')
            try {
                const checkInWatchlist = await API.get(`/network/checkinwatchlist/${imdbid}/${cookies.profileID}/`, {
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
                    updateActivityWatchlist(newActivityFeed, imdbid, 'Watched')
                    setActivityFeed(newActivityFeed)
                    onQueueUpdate();
                } catch (error) {
                    console.log(error, 'Unable to patch watchlist')
                }


            } catch (error) {
                console.log(error, 'Unable to find in watchlist')
            }

        }

    }

    const handleCurrentlyWatchingClick = async (content, imdbid) => {
        try {
            const watchListData = {
                'user_profile': cookies.profileID,
                'content': imdbid,
                'status': 'Currently Watching'
            }
            const addToWatchListResponse = await API.post(`/network/watchlistitems/`, watchListData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addToWatchListResponse.status === 201) {
                await handleRemoveFromQueueClick(content, imdbid)
                const newActivityFeed = [...activityFeed]
                updateActivityWatchlist(newActivityFeed, imdbid, 'Currently Watching')
                setActivityFeed(newActivityFeed)
            }
        } catch (error) {
            console.log(error, 'Not able to add to watchlist')
        }

    }

    const handleNotWatchedClick = async (content, imdbid) => {
        try {
            await API.delete(`network/mywatchlistdelete/${imdbid}/${cookies.profileID}/`)
            const newActivityFeed = [...activityFeed]
            updateActivityWatchlist(newActivityFeed, imdbid, null)
            setActivityFeed(newActivityFeed)
            onQueueUpdate();
        } catch (error) {
            console.log(error, 'Not able to delete watchlist item')
        }
    }



    useEffect(() => {
        const fetchActivityFeed = async () => {
            let userList = []
            let followingListResponse;
            try {
                followingListResponse = await API.get(`network/friendslist/${cookies.profileID}/`,
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
            if (followingListResponse.status === 200) {
                try {
                    userList.push(cookies.profileID)
                    const user_list = userList.join(',');
                    const activityFeedResponse = await API.get(`network/myactivityfeed/?user_list=${user_list}&user_id=${cookies.profileID}`,
                        {
                            headers: {
                                Authorization: `JWT ${cookies.AccessToken}`
                            }
                        });
                    const data = activityFeedResponse.data;
                        console.log(data)
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
                    if (activityFeedResponse.data.length) {
                        setShowActivityFeed(true)
                    }
                } catch (error) {
                    console.log(error, 'Unable to fetch activity feed')
                }
            }

        }
        fetchActivityFeed()
    }, [cookies.profileID, cookies.AccessToken, updateQueueSignal])



    return (
        <div className='activityfeedpage'>
            <div className='activityfeedcontainer'>
                {!activityFeed.length && (
                    <div className='emptyqueue'>
                        <div>
                            None of your friends have posted anything yet. <br></br>
                            Be the first! <br></br>
                        </div>
                        <div>
                            <NavLink to='/search'><img height={'15px'} style={{ marginTop: '5px' }} alt='search-icon' src='/search-icon.png'></img></NavLink>
                        </div>
                        <Link to={'/search'}>Search</Link>
                    </div>
                )}
                {showActivityFeed && activityFeed.map((item, i) => (
                    <div className='activityfeeditem' key={`feed-item=${i}`}>
                        {item.activity_type === 'Review' &&
                            <div className='activityfeeditemblock'>
                                <div className='activityfeedtype'>
                                    <NavLink to={`/profile/${item.review.user_profile.id}`}><img src={item.review.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover', marginRight: '10px' }} ></img></NavLink>
                                    <span style={{ fontFamily: 'Playfair display', fontWeight: 'bold', lineHeight: '5px' }}>{item.review.user_profile.username}</span> <span style={{ marginLeft: '10px' }}>Reviewed a {item.review.content.content_type}:</span>
                                </div>
                                <div className='activityfeedreviewblock'>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {item.review.rating} <i className="fa-solid fa-star"></i>
                                    </span>
                                    <div className='activityfeedreview'>
                                        {item.review.review_text}
                                    </div>
                                </div>
                                <div className='activityfeedcontentblock'>
                                    <div>
                                        {item && <NavLink to={`/content/${item.review.content.imdbid}`}><img className="activityfeedcontentposter" src={item.review.content.poster} alt='no-poster'></img></NavLink>}
                                    </div>
                                    <div className='contentinfo'>
                                        <div className='contentinfoitem'>
                                            <strong>{item.review.content.title}</strong>
                                        </div>
                                        <div className='activityfeedcontentallbuttons'>
                                            <div className='activityfeedcontentinfobuttons'>
                                                {item.in_watchlist === null && !item.in_queue && <button className='activityfeedqueue' onClick={() => handleAddToQueueClick(item, item.review.content.imdbid)}><i className="fas fa-plus"></i> Add to queue</button>}
                                                {item.in_watchlist === null && item.in_queue && <button className='activityfeedadded' onClick={() => handleRemoveFromQueueClick(item, item.review.content.imdbid)}>In my queue <i className="fas fa-check"></i></button>}
                                                {item.in_watchlist === 'Watched' && <button className='activityfeedwatched' onClick={() => handleNotWatchedClick(item, item.review.content.imdbid)}>Watched <i className="fas fa-check"></i></button>}
                                                {item.in_watchlist !== 'Watched' && <button className='activityfeednotwatched' onClick={() => handleWatchedClick(item, item.review.content.imdbid)}>Watched <i className="fa-solid fa-question"></i></button>}
                                            </div>
                                            <div className='contentinfobuttons'>
                                                {item.in_watchlist === null && item.in_watchlist !== 'Currently Watching' && <button className='activityfeedcurrentlywatching' onClick={() => handleCurrentlyWatchingClick(item, item.review.content.imdbid)}><i className="fas fa-clock"></i> Watching</button>}
                                                {<button className='activityfeedwhoswatching'><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='activityfeedengagement'>
                                    <div>
                                        <i onClick={() => handleReactClick(item, item.review.content.imdbid)} className="fa-solid fa-thumbs-up"></i> React
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
                        {item.activity_type === 'Rating' &&
                            <div className='activityfeeditemblock'>
                                <div className='activityfeedtype'>
                                    <NavLink to={`/profile/${item.rating.user_profile.id}`}><img src={item.rating.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover', marginRight: '10px' }} ></img></NavLink>
                                    <span style={{ fontFamily: 'Playfair display', fontWeight: 'bold', lineHeight: '1px' }}>{item.rating.user_profile.username}</span> <span style={{ marginLeft: '10px' }}>Rated a {item.rating.content.content_type}<span style={{ color: '#5E665B' }}> <strong>{` ${item.rating.rating}`} </strong><i className="fa-solid fa-star"></i></span> </span>
                                </div>
                                <div className='activityfeedcontentblock'>
                                    <div>
                                        {item && <NavLink to={`/content/${item.rating.content.imdbid}`}><img className="activityfeedcontentposter" src={item.rating.content.poster} alt='no-poster'></img></NavLink>}
                                    </div>
                                    <div className='contentinfo'>
                                        <div className='contentinfoitem'>
                                            <strong>{item.rating.content.title}</strong>
                                        </div>
                                        <div className='activityfeedcontentallbuttons'>
                                            <div className='activityfeedcontentinfobuttons'>
                                                {item.in_watchlist === null && !item.in_queue && <button className='activityfeedqueue' onClick={() => handleAddToQueueClick(item, item.rating.content.imdbid)}><i className="fas fa-plus"></i> Add to queue</button>}
                                                {item.in_watchlist === null && item.in_queue && <button className='activityfeedadded' onClick={() => handleRemoveFromQueueClick(item, item.rating.content.imdbid)}>In my queue <i className="fas fa-check"></i></button>}
                                                {item.in_watchlist === 'Watched' && <button className='activityfeedwatched' onClick={() => handleNotWatchedClick(item, item.rating.content.imdbid)}>Watched <i className="fas fa-check"></i></button>}
                                                {item.in_watchlist !== 'Watched' && <button className='activityfeednotwatched' onClick={() => handleWatchedClick(item, item.rating.content.imdbid)}>Watched <i className="fa-solid fa-question"></i></button>}
                                            </div>
                                            <div className='contentinfobuttons'>
                                                {item.in_watchlist === null && item.in_watchlist !== 'Currently Watching' && <button className='activityfeedcurrentlywatching' onClick={() => handleCurrentlyWatchingClick(item, item.rating.content.imdbid)}><i className="fas fa-clock"></i> Watching</button>}
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
    )
}

export default ActivityFeedBox;