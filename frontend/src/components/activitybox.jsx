import { NavLink, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { API } from "../api/api";
import { useEffect, useState } from "react";

const ActivityBox = () => {
    const params = useParams()
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [activity, setActivity] = useState({})
    const [showActivity, setShowActivity] = useState(false)
    const [commentState, setCommentState] = useState('')


    const handleCommentClick = () => {
        setCommentState('')
        const newActivity = { ...activity }
        newActivity.show_comment_box = !newActivity.show_comment_box
        setActivity(newActivity)
    }

    const handleCommentChange = (e) => {
        e.preventDefault()
        setCommentState(e.target.value)
        return;
    }

    const handleSubmitCommentClick = async () => {
        let submitCommentResponse;

        const commentData = {
            "comment_text": commentState,
            "parent": null,
            "activity_feed_id": activity.id,
            "user_profile_id": cookies.profileID,
            "likes": null
        }
        try {
            submitCommentResponse = await API.post('/network/comments/', commentData,
                {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                }
            )
            if (submitCommentResponse.status === 201) {
                setCommentState('')
                let newActivity = { ...activity }
                newActivity.show_comment_box = false
                const data = submitCommentResponse.data
                newActivity.comments.push(data)
                setActivity(newActivity)
                let allForms = document.querySelectorAll('input');
                allForms.forEach(eachInput => eachInput.value = '');
                try {
                    let otherUserID = data.activity_feed.user_profile
                    const updateData = {
                        "update_type": 'Comment',
                        "user_profile": otherUserID,
                        "follower": cookies.profileID,
                        "activity_feed_item": data.activity_feed.id
                    }
                    const addUpdateResponse = await API.post(`/network/updates/`, updateData, {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    });
                    if (addUpdateResponse.status === 201) {
                        return;
                    }
                } catch (error) {
                    console.log(error, 'Unable to create an update for reaction')
                }
            }
        } catch (error) {
            console.log(error, 'Unable to add to new comment')
        }
    }


    const updateActivityQueue = (newActivity) => {
        let updatedActivity = newActivity
        if (updatedActivity.activity_type === 'Review') {
            updatedActivity.in_queue = !updatedActivity.in_queue
        }
        if (updatedActivity.activity_type === 'Rating') {
            updatedActivity.in_queue = !updatedActivity.in_queue
        }
        return updatedActivity
    }

    const updateActivityWatchlist = (newActivity, status) => {
        if (newActivity.activity_type === 'Review') {
            newActivity.in_watchlist = status
        }
        if (newActivity.activity_type === 'Rating') {
            newActivity.in_watchlist = status
        }
        return newActivity
    }


    const updateActivityReactions = (newActivity, newReaction) => {
        const updatedActivity = newActivity.reactions.push(newReaction)
        return updatedActivity
    }


    const handleReactClick = async (content) => {
        const reactionData = {
            "reaction": 'Thumbs Up',
            "comment": null,
            "activity_feed": content.id,
            "review": null,
            "rating": null,
            "user_profile": cookies.profileID
        }
        try {
            const addReactionResponse = await API.post(`/network/reactions/`, reactionData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addReactionResponse.status === 201) {
                const newActivity = {...activity}
                updateActivityReactions(newActivity, addReactionResponse.data)
                setActivity(newActivity)
            }

            try {
                let otherUserID;
                if (content.activity_type === 'Review') {
                    otherUserID = content.review.user_profile.id
                }
                if (content.activity_type === 'Rating') {
                    otherUserID = content.rating.user_profile.id
                }
                const updateData = {
                    "update_type": 'Reaction',
                    "user_profile": otherUserID,
                    "follower": cookies.profileID,
                    "activity_feed_item": content.id
                }
                const addUpdateResponse = await API.post(`/network/updates/`, updateData, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (addUpdateResponse.status === 201) {
                    return;
                }
            } catch (error) {
                console.log(error, 'Unable to create an update for reaction')
            }

        } catch (error) {
            if (error.status === 400) {
                console.log("You've already liked this!")
            } else {
                console.log(error, 'Unable to add reaction')
            }
        }
        return;
    }


    const handleAddToQueueClick = async (content) => {
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
            let newActivity = { ...activity }
            newActivity = updateActivityQueue(newActivity)
            setActivity(newActivity)
        } catch (error) {
            console.log(error, 'Not able to add to queue')
        }
    }

    const handleRemoveFromQueueClick = async (content) => {
        try {
            let contentID;
            if (content.activity_type === 'Review') {
                contentID = content.review.content.imdbid
            } else {
                contentID = content.rating.content.imdbid
            }
            await API.delete(`network/myqueuedelete/${contentID}/${cookies.profileID}/`)
            let newActivity = { ...activity }
            updateActivityQueue(newActivity)
            setActivity(newActivity)
        } catch (error) {
            console.log(error, 'Not able to delete queue item')
        }
    }

    const handleWatchedClick = async (content, imdbid) => {
        try {
            const watchListData = {
                user_profile: cookies.profileID,
                content: imdbid,
                status: 'Watched'
            };

            const addToWatchListResponse = await API.post(`/network/watchlistitems/`, watchListData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });

            if (addToWatchListResponse.status === 201) {
                await handleRemoveFromQueueClick(content);
                setActivity(prevActivity => ({
                    ...prevActivity,
                    in_queue: false,
                    in_watchlist: 'Watched'
                }));
            }
        } catch (error) {
            console.log(error, 'Not able to add to watchlist, updating');
            try {
                const checkInWatchlist = await API.get(`/network/checkinwatchlist/${imdbid}/${cookies.profileID}/`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                const watchListData = checkInWatchlist.data;
                const { id } = watchListData;
                const updateWatchListData = { status: "Watched" };
                await API.patch(`/network/watchlistitems/${id}/`, updateWatchListData, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });

                setActivity(prevActivity => ({
                    ...prevActivity,
                    in_queue: false,
                    in_watchlist: 'Watched'
                }));
            } catch (error) {
                console.log(error, 'Unable to patch watchlist');
            }
        }
    };

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
                await handleRemoveFromQueueClick(content)
                setActivity(prevActivity => ({
                    ...prevActivity,
                    in_queue: false,
                    in_watchlist: 'Currently Watching'
                }));
            }
        } catch (error) {
            console.log(error, 'Not able to add to watchlist')
        }
    }

    const handleNotWatchedClick = async (content, imdbid) => {
        try {
            await API.delete(`network/mywatchlistdelete/${imdbid}/${cookies.profileID}/`)
            let newActivity = { ...activity }
            updateActivityWatchlist(newActivity, null)
            setActivity(newActivity)
        } catch (error) {
            console.log(error, 'Not able to delete watchlist item')
        }
    }

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const activityResponse = await API.get(`/network/activity/${params.activity_id}/${cookies.profileID}/`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (activityResponse.status === 200) {
                    const data = activityResponse.data
                    if (data.activity_type === '') {
                        return;
                    }
                    if (data.activity_type === 'Review') {
                        let { profile_picture } = data.review.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        data.review.user_profile.profile_picture = profile_picture
                    } else {
                        let { profile_picture } = data.rating.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        data.rating.user_profile.profile_picture = profile_picture
                    }
                    data.comments.map((comment, i) => {
                        let { profile_picture } = comment.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        comment.user_profile.profile_picture = profile_picture
                        return comment;
                    })
                    setActivity(data)
                    setShowActivity(true)
                }
            } catch (error) {
                console.log(error, 'Error fetching activity');
            }
        }
        fetchActivity()
    }, [cookies.profileID, cookies.AccessToken, params.activity_id])

    return (
        <div className='activityfeedpage'>
            <div className='activityfeedcontainer'>
                {showActivity && (
                    <div className='activityfeeditem' key={`feed-activity-item`}>
                        {activity.activity_type === 'Review' &&
                            <div className='activityfeeditemblock'>
                                <div className='activityfeedtype'>
                                    <NavLink to={`/profile/${activity.review.user_profile.id}`}><img src={activity.review.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover', marginRight: '10px' }} ></img></NavLink>
                                    <span style={{ fontFamily: 'Playfair display', fontWeight: 'bold', lineHeight: '5px' }}>{activity.review.user_profile.username}</span> <span style={{ marginLeft: '10px' }}>Reviewed a {activity.review.content.content_type}:</span>
                                </div>
                                <div className='activityfeedreviewblock'>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {activity.review.rating} <i className="fa-solid fa-star"></i>
                                    </span>
                                    <div className='activityfeedreview'>
                                        {activity.review.review_text}
                                    </div>
                                </div>
                                <div className='activityfeedcontentblock'>
                                    <div>
                                        {activity && <NavLink to={`/content/${activity.review.content.imdbid}`}><img className="activityfeedcontentposter" src={activity.review.content.poster} alt='no-poster'></img></NavLink>}
                                    </div>
                                    <div className='contentinfo'>
                                        <div className='contentinfoactivity'>
                                            <strong>{activity.review.content.title}</strong>
                                        </div>
                                        <div className='activityfeedcontentallbuttons'>
                                            <div className='activityfeedcontentinfobuttons'>
                                                {activity.in_watchlist === null && !activity.in_queue && <button className='activityfeedqueue' onClick={() => handleAddToQueueClick(activity)}><i className="fas fa-plus"></i> Add to queue</button>}
                                                {activity.in_watchlist === null && activity.in_queue && <button className='activityfeedadded' onClick={() => handleRemoveFromQueueClick(activity)}>In my queue <i className="fas fa-check"></i></button>}
                                                {activity.in_watchlist === 'Watched' && <button className='activityfeedwatched' onClick={() => handleNotWatchedClick(activity, activity.review.content.imdbid)}>Watched <i className="fas fa-check"></i></button>}
                                                {activity.in_watchlist !== 'Watched' && <button className='activityfeednotwatched' onClick={() => handleWatchedClick(activity, activity.review.content.imdbid)}>Watched <i className="fa-solid fa-question"></i></button>}
                                            </div>
                                            <div className='contentinfobuttons'>
                                                {activity.in_watchlist === null && activity.in_watchlist !== 'Currently Watching' && <button className='activityfeedcurrentlywatching' onClick={() => handleCurrentlyWatchingClick(activity, activity.review.content.imdbid)}><i className="fas fa-clock"></i> Watching</button>}
                                                {<button className='activityfeedwhoswatching'><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='activityfeedengagement'>
                                    <div>
                                        <NavLink to={`/reactionlist/${activity.id}`} style={{ textDecoration: 'none' }}>{activity.reactions.length > 0 && activity.reactions.length}</NavLink> <span className='clickableimage'><i onClick={() => handleReactClick(activity)} className="fa-solid fa-thumbs-up"></i></span> Like
                                    </div>
                                    <div>
                                        <span className='commentbutton'><i onClick={() => handleCommentClick()} className="fa-solid fa-message"></i></span> Comment
                                    </div>
                                    <div>
                                        <i className="fa-solid fa-share-from-square"></i> Send To Friend
                                    </div>
                                </div>
                                {activity.show_comment_box === true && (
                                    <div className='leavecommentcontainer'>
                                        <textarea className='leavereview' value={commentState} onChange={handleCommentChange} rows={5} cols={40} placeholder=" leave a comment..."></textarea>
                                        <button className='submitcomment' onClick={() => handleSubmitCommentClick()}>submit</button>
                                    </div>
                                )}
                                {activity.comments.length > 0 && activity.comments.map((comment, i) => (
                                    <div key={`comment-${i}`} className='commentcontainer'>
                                        <NavLink to={`/profile/${comment.user_profile.id}`}><img src={comment.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover' }} ></img></NavLink>
                                        <div className='commentbox'>
                                            <strong>{comment.user_profile.username}</strong>
                                            <span style={{ fontSize: '14px', marginBottom: '5px' }}>{comment.comment_text}</span>
                                            <span className='datestring'>{new Date(comment.timestamp).toDateString().slice(4)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                        {activity.activity_type === 'Rating' &&
                            <div className='activityfeeditemblock'>
                                <div className='activityfeedtype'>
                                    <NavLink to={`/profile/${activity.rating.user_profile.id}`}><img src={activity.rating.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover', marginRight: '10px' }} ></img></NavLink>
                                    <span style={{ fontFamily: 'Playfair display', fontWeight: 'bold', lineHeight: '1px' }}>{activity.rating.user_profile.username}</span> <span style={{ marginLeft: '10px' }}>Rated a {activity.rating.content.content_type}<span style={{ color: '#5E665B' }}> <strong>{` ${activity.rating.rating}`} </strong><i className="fa-solid fa-star"></i></span> </span>
                                </div>
                                <div className='activityfeedcontentblock'>
                                    <div>
                                        {activity && <NavLink to={`/content/${activity.rating.content.imdbid}`}><img className="activityfeedcontentposter" src={activity.rating.content.poster} alt='no-poster'></img></NavLink>}
                                    </div>
                                    <div className='contentinfo'>
                                        <div className='contentinfoactivity'>
                                            <strong>{activity.rating.content.title}</strong>
                                        </div>
                                        <div className='activityfeedcontentallbuttons'>
                                            <div className='activityfeedcontentinfobuttons'>
                                                {activity.in_watchlist === null && !activity.in_queue && <button className='activityfeedqueue' onClick={() => handleAddToQueueClick(activity)}><i className="fas fa-plus"></i> Add to queue</button>}
                                                {activity.in_watchlist === null && activity.in_queue && <button className='activityfeedadded' onClick={() => handleRemoveFromQueueClick(activity)}>In my queue <i className="fas fa-check"></i></button>}
                                                {activity.in_watchlist === 'Watched' && <button className='activityfeedwatched' onClick={() => handleNotWatchedClick(activity, activity.rating.content.imdbid)}>Watched <i className="fas fa-check"></i></button>}
                                                {activity.in_watchlist !== 'Watched' && <button className='activityfeednotwatched' onClick={() => handleWatchedClick(activity, activity.rating.content.imdbid)}>Watched <i className="fa-solid fa-question"></i></button>}
                                            </div>
                                            <div className='contentinfobuttons'>
                                                {activity.in_watchlist === null && activity.in_watchlist !== 'Currently Watching' && <button className='activityfeedcurrentlywatching' onClick={() => handleCurrentlyWatchingClick(activity, activity.rating.content.imdbid)}><i className="fas fa-clock"></i> Watching</button>}
                                                {<button className='activityfeedwhoswatching'><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='activityfeedengagement'>
                                    <div>
                                        <NavLink to={`/reactionlist/${activity.id}`} style={{ textDecoration: 'none' }}>{activity.reactions.length > 0 && activity.reactions.length}</NavLink> <span className='clickableimage'><i onClick={() => handleReactClick(activity)} className="fa-solid fa-thumbs-up"></i></span> Like
                                    </div>
                                    <div>
                                        <span className='commentbutton'><i onClick={() => handleCommentClick()} className="fa-solid fa-message"></i></span> Comment
                                    </div>
                                    <div>
                                        <i className="fa-solid fa-share-from-square"></i> Send To Friend
                                    </div>
                                </div>
                                {activity.show_comment_box === true && (
                                    <div className='leavecommentcontainer'>
                                        <textarea className='leavereview' value={commentState} onChange={handleCommentChange} rows={5} cols={40} placeholder=" leave a comment..."></textarea>
                                        <button className='submitcomment' onClick={() => handleSubmitCommentClick()}>submit</button>
                                    </div>
                                )}
                                {activity.comments.length > 0 && activity.comments.map((comment, i) => (
                                    <div key={`comment-${i}`} className='commentcontainer'>
                                        <NavLink to={`/profile/${comment.user_profile.id}`}><img src={comment.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover' }} ></img></NavLink>
                                        <div className='commentbox'>
                                            <strong>{comment.user_profile.username}</strong>
                                            <span style={{ fontSize: '14px', marginBottom: '5px' }}>{comment.comment_text}</span>
                                            <span className='datestring'>{new Date(comment.timestamp).toDateString().slice(4)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}

export default ActivityBox;