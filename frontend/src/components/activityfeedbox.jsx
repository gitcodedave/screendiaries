import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { Fragment, useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";


const ActivityFeedBox = ({ onQueueUpdate, updateQueueSignal }) => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [activityFeed, setActivityFeed] = useState([])
    const [showActivityFeed, setShowActivityFeed] = useState(false)
    const [commentState, setCommentState] = useState('')
    const [commentReplyState, setCommentReplyState] = useState('')

    const navigate = useNavigate()

    const handleWhosWatchingClick = (content_id) => {
        navigate(`/whoswatching/${content_id}/`)
    }

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

    const updateActivityReactions = (newActivityFeed, i, newReaction) => {
        const updatedFeed = newActivityFeed[i].reactions.push(newReaction)
        return updatedFeed
    }

    const updateActivityCommentReactions = (newActivityFeed, i, k, newReaction) => {
        const updatedFeed = newActivityFeed[i].comments[k].reactions.push(newReaction)
        return updatedFeed
    }

    const handleCommentReactClick = async (i, comment, k) => {
        let activityFeedID;
        if (typeof comment.activity_feed === 'number') {
            activityFeedID = comment.activity_feed
        } else {
            activityFeedID = comment.activity_feed.id
        }
        const reactionData = {
            "reaction": 'Thumbs Up',
            "comment": comment.id,
            "activity_feed": activityFeedID,
            "review": null,
            "rating": null,
            "user_profile": cookies.profileID,
        }
        try {
            const addReactionResponse = await API.post(`/network/reactions/`, reactionData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addReactionResponse.status === 201) {
                const newActivityFeed = [...activityFeed]
                updateActivityCommentReactions(newActivityFeed, i, k, addReactionResponse.data)
                setActivityFeed(newActivityFeed)
            }

            try {
                const otherUserID = comment.user_profile.id
                const updateData = {
                    "update_type": 'CommentReaction',
                    "user_profile": otherUserID,
                    "follower": cookies.profileID,
                    "activity_feed_item": activityFeedID
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

    const handleCommentReplyClick = async (i, k) => {
        setCommentReplyState('')
        const newFeed = [...activityFeed]
        newFeed[i].comments.map((comment, l) => {
            if (l === k) {
                comment.show_comment_box = true
            } else {
                comment.show_comment_box = false
            }
            return comment
        })
        setActivityFeed(newFeed)
    }

    const handleCommentReplyChange = (e) => {
        e.preventDefault()
        setCommentReplyState(e.target.value)
        return;
    }

    const handleSubmitCommentReplyClick = async (i, comment, k) => {
        let submitCommentResponse;

        const commentData = {
            "comment_text": commentReplyState,
            "parent": comment.id,
            "activity_feed_id": activityFeed[i].id,
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
                setCommentReplyState('')
                let newFeed = [...activityFeed]
                newFeed[i].comments[k].show_comment_box = false
                const data = submitCommentResponse.data
                data.reactions = []
                data.replies = []
                newFeed[i].comments[k].replies.push(data)
                setActivityFeed(newFeed)
                let allForms = document.querySelectorAll('input');
                allForms.forEach(eachInput => eachInput.value = '');
                try {
                    let otherUserID = data.activity_feed.user_profile
                    const updateData = {
                        "update_type": 'Reply',
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

    const handleReactClick = async (content, i) => {
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
                const newActivityFeed = [...activityFeed]
                updateActivityReactions(newActivityFeed, i, addReactionResponse.data)
                setActivityFeed(newActivityFeed)
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

    const handleCommentClick = (i) => {
        setCommentState('')
        const newFeed = [...activityFeed]
        newFeed.map((item, j) => {
            if (j === i) {
                item.show_comment_box = true
            } else {
                item.show_comment_box = false
            }
            return item
        })
        setActivityFeed(newFeed)
    }

    const handleCommentChange = (e) => {
        e.preventDefault()
        setCommentState(e.target.value)
        return;
    }

    const handleSubmitCommentClick = async (i) => {
        let submitCommentResponse;

        const commentData = {
            "comment_text": commentState,
            "parent": null,
            "activity_feed_id": activityFeed[i].id,
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
                let newFeed = [...activityFeed]
                newFeed[i].show_comment_box = false
                const data = submitCommentResponse.data
                data.reactions = []
                data.replies = []
                newFeed[i].comments.push(data)
                setActivityFeed(newFeed)
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
                        item.comments.map((comment, i) => {
                            let { profile_picture } = comment.user_profile
                            if (!profile_picture.includes('http://localhost:8000')) {
                                profile_picture = 'http://localhost:8000' + profile_picture
                            }
                            comment.user_profile.profile_picture = profile_picture
                            comment.replies.map((reply, j) => {
                                let { profile_picture } = reply.user_profile
                                if (!profile_picture.includes('http://localhost:8000')) {
                                    profile_picture = 'http://localhost:8000' + profile_picture
                                }
                                reply.user_profile.profile_picture = profile_picture
                                return reply
                            })
                            comment.show_comment_box = false
                            return comment;
                        })
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
                                                {<button className='activityfeedwhoswatching' onClick={() => handleWhosWatchingClick(item.review.content.imdbid)}><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='activityfeedengagement'>
                                    <div>
                                        <NavLink to={`/reactionlist/${item.id}`} style={{ textDecoration: 'none' }}>{item.reactions.length > 0 && item.reactions.length}</NavLink> <span className='clickableimage'><i onClick={() => handleReactClick(item, i)} className="fa-solid fa-thumbs-up"></i></span> Like
                                    </div>
                                    <div>
                                        <span className='commentbutton'><i onClick={() => handleCommentClick(i)} className="fa-solid fa-message"></i></span> Comment
                                    </div>
                                    <div>
                                        <i className="fa-solid fa-share-from-square"></i> Send To Friend
                                    </div>
                                </div>
                                {item.show_comment_box === true && (
                                    <div className='leavecommentcontainer'>
                                        <textarea className='leavereview' value={commentState} onChange={handleCommentChange} rows={5} cols={40} placeholder=" leave a comment..."></textarea>
                                        <button className='submitcomment' onClick={() => handleSubmitCommentClick(i)}>submit</button>
                                    </div>
                                )}
                                {item.comments.length > 0 && item.comments.map((comment, k) => (
                                    <Fragment key={`comment-${k}`} >
                                        <div className='commentcontainer'>
                                            <NavLink to={`/profile/${comment.user_profile.id}`}><img src={comment.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover' }} ></img></NavLink>
                                            <div className='commentbox'>
                                                <strong>{comment.user_profile.username}</strong>
                                                <span style={{ fontSize: '14px', marginBottom: '5px', marginTop: '2px' }}>{comment.comment_text}</span>
                                                <span className='datestring'>{new Date(comment.timestamp).toDateString().slice(4)}</span>
                                            </div>
                                        </div>
                                        <div className='commentfeedengagement'>
                                            <div>
                                                {comment.reactions.length > 0 && comment.reactions.length} <span className='clickableimage'><i onClick={() => handleCommentReactClick(i, comment, k)} className="fa-solid fa-thumbs-up"></i></span> Like
                                            </div>
                                            <div>
                                                <span className='commentbutton'><i onClick={() => handleCommentReplyClick(i, k)} className="fa-solid fa-message"></i></span> Comment
                                            </div>
                                            <div>
                                            </div>
                                        </div>
                                        {comment.show_comment_box === true && (
                                            <div className='leavecommentreplycontainer'>
                                                <textarea className='leavecommentreply' value={commentReplyState} onChange={handleCommentReplyChange} rows={4} cols={30} placeholder=" leave a reply..."></textarea>
                                                <button className='submitcommentreply' onClick={() => handleSubmitCommentReplyClick(i, comment, k)}>reply</button>
                                            </div>
                                        )}
                                        {comment.replies.length > 0 && comment.replies.map((reply, j) => (
                                            <div key={`reply-${j}`} className='commentreplycontainer'>
                                                <NavLink to={`/profile/${reply.user_profile.id}`}><img src={reply.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '20px', width: '20px', objectFit: 'cover' }} ></img></NavLink>
                                                <div className='commentreplybox'>
                                                    <strong>{reply.user_profile.username}</strong>
                                                    <span style={{ fontSize: '11px', marginBottom: '5px', marginTop: '2px' }}>{reply.comment_text}</span>
                                                    <span className='replydatestring'>{new Date(reply.timestamp).toDateString().slice(4)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </Fragment>
                                ))}
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
                                                {<button className='activityfeedwhoswatching' onClick={() => handleWhosWatchingClick(item.rating.content.imdbid)}><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='activityfeedengagement'>
                                    <div>
                                        <NavLink to={`/reactionlist/${item.id}`} style={{ textDecoration: 'none' }}>{item.reactions.length > 0 && item.reactions.length}</NavLink> <span className='clickableimage'><i onClick={() => handleReactClick(item, i)} className="fa-solid fa-thumbs-up"></i></span> Like
                                    </div>
                                    <div>
                                        <span className='commentbutton'><i onClick={() => handleCommentClick(i)} className="fa-solid fa-message"></i></span> Comment
                                    </div>
                                    <div>
                                        <i className="fa-solid fa-share-from-square"></i> Send To Friend
                                    </div>
                                </div>
                                {item.show_comment_box === true && (
                                    <div className='leavecommentcontainer'>
                                        <textarea className='leavereview' value={commentState} onChange={handleCommentChange} rows={5} cols={40} placeholder=" leave a comment..."></textarea>
                                        <button className='submitcomment' onClick={() => handleSubmitCommentClick(i)}>submit</button>
                                    </div>
                                )}
                                {item.comments.length > 0 && item.comments.map((comment, k) => (
                                    <Fragment key={`comment-${k}`} >
                                        <div className='commentcontainer'>
                                            <NavLink to={`/profile/${comment.user_profile.id}`}><img src={comment.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '30px', width: '30px', objectFit: 'cover' }} ></img></NavLink>
                                            <div className='commentbox'>
                                                <strong>{comment.user_profile.username}</strong>
                                                <span style={{ fontSize: '14px', marginBottom: '5px', marginTop: '2px' }}>{comment.comment_text}</span>
                                                <span className='datestring'>{new Date(comment.timestamp).toDateString().slice(4)}</span>
                                            </div>
                                        </div>
                                        <div className='commentfeedengagement'>
                                            <div>
                                                {comment.reactions.length > 0 && comment.reactions.length} <span className='clickableimage'><i onClick={() => handleCommentReactClick(i, comment, k)} className="fa-solid fa-thumbs-up"></i></span> Like
                                            </div>
                                            <div>
                                                <span className='commentbutton'><i onClick={() => handleCommentReplyClick(i, k)} className="fa-solid fa-message"></i></span> Comment
                                            </div>
                                            <div>
                                            </div>
                                        </div>
                                        {comment.show_comment_box === true && (
                                            <div className='leavecommentreplycontainer'>
                                                <textarea className='leavecommentreply' value={commentReplyState} onChange={handleCommentReplyChange} rows={4} cols={30} placeholder=" leave a reply..."></textarea>
                                                <button className='submitcommentreply' onClick={() => handleSubmitCommentReplyClick(i, comment, k)}>reply</button>
                                            </div>
                                        )}
                                        {comment.replies.length > 0 && comment.replies.map((reply, j) => (
                                            <div key={`reply-${j}`} className='commentreplycontainer'>
                                                <NavLink to={`/profile/${reply.user_profile.id}`}><img src={reply.user_profile.profile_picture} alt='profile pic' style={{ clipPath: 'circle()', height: '20px', width: '20px', objectFit: 'cover' }} ></img></NavLink>
                                                <div className='commentreplybox'>
                                                    <strong>{reply.user_profile.username}</strong>
                                                    <span style={{ fontSize: '11px', marginBottom: '5px', marginTop: '2px' }}>{reply.comment_text}</span>
                                                    <span className='replydatestring'>{new Date(reply.timestamp).toDateString().slice(4)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </Fragment>
                                ))}
                            </div>
                        }
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ActivityFeedBox;