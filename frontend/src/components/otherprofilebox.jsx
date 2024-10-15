import { useEffect, useState } from 'react';
import { API } from '../api/api';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { NavLink } from 'react-router-dom';

const OtherProfileBox = () => {
    const [profileNameState, setProfileNameState] = useState('')
    const [reviewCount, setReviewCount] = useState(0)
    const [ratingCount, setRatingCount] = useState(0)
    const [followCount, setFollowCount] = useState(0)
    const [bioState, setBioState] = useState('')
    const [firstNameState, setFirstNameState] = useState('')
    const [lastNameState, setLastNameState] = useState('')
    const [followingState, setFollowingState] = useState(false)
    const [profilePictureState, setProfilePictureState] = useState('')
    const [myMovieQueue, setMyMovieQueue] = useState([])
    const [mySeriesQueue, setMySeriesQueue] = useState([])
    const [hasMovieQueue, setHasMovieQueue] = useState(false)
    const [hasSeriesQueue, setHasSeriesQueue] = useState(false)
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const navigate = useNavigate()
    const params = useParams()
    const otherUserID = params.profileID

    const handleContentClick = (content) => {
        const { imdbid } = content
        navigate(`/content/${imdbid}/`)
    }

    const handleRemoveQueueClick = async (content) => {
        const { imdbid } = content
        try {
            const myQueueResponse = await API.delete(`network/myqueuedelete/${imdbid}/${cookies.profileID}/`)
            if (myQueueResponse.status === 204)
                fetchQueue()
        } catch (error) {
            console.log(error, 'Not able to delete queue item')
        }
    }

    const handleFollowClick = async (e) => {
        e.preventDefault()
        if (followingState) {
            try {
                const unFollowResponse = await API.delete(`network/unfollow/${cookies.profileID}/${otherUserID}/`)
                if (unFollowResponse.status === 204) {
                    setFollowingState(false)
                }
            } catch (error) {
                console.log(error, 'Not able to unfollow')
            }
        } else {
            try {
                const followData = {
                    'follower': cookies.profileID,
                    'following': otherUserID
                }
                const followResponse = await API.post(`/network/follows/`, followData, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (followResponse.status === 201) {
                    setFollowingState(true)
                }
            } catch (error) {
                console.log(error, 'Not able to follow')
            }
        }
    }
    const fetchQueue = async () => {
        try {
            const myQueueResponse = await API.get(`network/myqueue/${otherUserID}/`)
            const data = myQueueResponse.data
            const seriesData = data.filter(val => val.content_type === 'Series' || val.content_type === 'Episode');
            const movieData = data.filter(val => val.content_type === 'Movie');
            if (movieData.length > 0) {
                setHasMovieQueue(true)
            }
            if (seriesData.length > 0) {
                setHasSeriesQueue(true)
            }
            setMyMovieQueue(movieData)
            setMySeriesQueue(seriesData)
        } catch (error) {
            setHasMovieQueue(false)
            setHasSeriesQueue(false)
            console.log(error, 'Nothing in your queue yet!')
        }
    }

    useEffect(() => {
        const currentProfileID = Number(params.profileID)

        if (currentProfileID === cookies.profileID) {
            navigate(`/profile/`)
        } else {
            const checkIfFollow = async () => {
                try {
                    const checkFollowResponse = await API.get(`network/checkfollow/${cookies.profileID}/${otherUserID}/`)
                    if (checkFollowResponse.status === 200) {
                        setFollowingState(true)
                    }
                } catch (error) {
                    console.log(error, 'Did not find follow')
                }
            }

            const fetchStats = async () => {
                try {
                    const reviewCountResponse = await API.get(`network/userreviewcount/${otherUserID}/`)
                    setReviewCount(reviewCountResponse.data)
                } catch (error) {
                    console.log(error, 'error fetching review count')
                }
                try {
                    const ratingCountResponse = await API.get(`network/userratingcount/${otherUserID}/`)
                    setRatingCount(ratingCountResponse.data)
                } catch (error) {
                    console.log(error, 'error fetching rating count')
                }
                try {
                    const followCountResponse = await API.get(`network/userfollowcount/${otherUserID}/`)
                    setFollowCount(followCountResponse.data)
                } catch (error) {
                    console.log(error, 'error fetching follow count')
                }
            }

            const fetchOtherUser = async () => {
                try {
                    const userDataResponse = await API.get(`/network/userprofiles/${otherUserID}/`, {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    })
                    const userData = userDataResponse.data
                    setProfileNameState(userData.username)
                    let { bio, profile_picture, first_name = false, last_name = false } = userDataResponse.data
                    if (!profile_picture.includes('http://localhost:8000')) {
                        profile_picture = 'http://localhost:8000' + profile_picture
                    }
                    setProfilePictureState(profile_picture)
                    setBioState(bio)
                    setFirstNameState(first_name)
                    setLastNameState(last_name)
                } catch (error) {
                    console.error('Error refreshing token:', error);
                    return null;
                }
            }
            fetchOtherUser()
            fetchStats()
            fetchQueue()
            checkIfFollow()
        }
    }, [cookies.AccessToken, cookies.profileID])

    return (
        <div className='profilecontainer'>
            <div className='profileitems'>
                <div className='profilename'>
                    {profileNameState}
                </div>
                <div className='profileinfocontainer'>
                    <div className='profileimageandname'>
                        <img src={profilePictureState} alt='profile pic' style={{ clipPath: 'circle()', height: '100px', width: '100px', objectFit: 'cover' }}></img>
                        {firstNameState && firstNameState + ' ' + lastNameState}
                    </div>
                    <div className='profilestatscontainer'>
                        <div className='profilestats'>
                            <div className='stat'>
                                <div className='statnumber'>
                                    {reviewCount}
                                </div>
                                <div className='statname'>
                                    reviews
                                </div>
                            </div>
                            <div className='stat'>
                                <div className='statnumber'>
                                    {ratingCount}
                                </div>
                                <div className='statname'>
                                    ratings
                                </div>
                            </div>
                            <NavLink style={{ textDecoration: 'none' }} to={`/friendslist/${otherUserID}`}><div className='stat'>
                                <div className='statnumber'>
                                    {followCount}
                                </div>
                                <div className='statname'>
                                    following
                                </div>
                            </div></NavLink>
                        </div>
                        <div className='profilebio'>
                            {bioState}
                        </div>
                    </div>
                </div>
                <div className='profilebuttons'>
                    {followingState && (
                        <button className='profilebutton' onClick={handleFollowClick}>Following <i className="fa-solid fa-check"></i></button>
                    )}
                    {!followingState && (
                        <button className='profilebutton' onClick={handleFollowClick}>Follow</button>
                    )}
                    <NavLink to={`/mywatchlist/${otherUserID}/`}><button className='profilebutton'>WatchList</button></NavLink>
                </div>
                <div className='separator'></div>
                <div className='queuelabel'>
                    {profileNameState}'s Movie Queue
                </div>
                <div className='queuecontainer'>
                    {!hasMovieQueue &&
                        <div className='emptyqueue'>
                            <div>
                                There's nothing in {profileNameState}'s Movie Queue yet. <br></br>
                            </div>
                        </div>
                    }
                    {hasMovieQueue && myMovieQueue.map((contentitem, i) => (
                        <div className='queueimageandkey' key={`queue-item-${i}`}>
                            <span key={`key-${i}`} style={{ fontWeight: 'bold', fontSize: '18px' }}>{i + 1}</span>
                            <div className='queueimagecontainer' key={`queue-image-${i}`}>
                                <div className='queueimageandoverlay'>
                                    {<img src={contentitem.poster} height='100px' alt='no-poster'></img>}
                                    <div key={`queue-overlay-${i}`} onClick={() => handleContentClick(contentitem)} className='overlay'>
                                        <i className="fa-regular fa-hand-pointer"></i>
                                    </div>
                                </div>
                                <div>
                                    <i style={{ marginTop: '5px', fontSize: '12px' }} onClick={() => handleRemoveQueueClick(contentitem)} className="fa-solid fa-xmark"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='separator'></div>
                <div className='queuelabel'>
                    {profileNameState}'s Series Queue
                </div>
                <div className='queuecontainer'>
                    {!hasSeriesQueue &&
                        <div className='emptyqueue'>
                            <div>
                                There's nothing in {profileNameState}'s Series Queue yet. <br></br>
                            </div>
                        </div>
                    }
                    {hasSeriesQueue && mySeriesQueue.map((contentitem, i) => (
                        <div className='queueimageandkey' key={`queue-item-${i}`}>
                            <span key={`key-${i}`} style={{ fontWeight: 'bold', fontSize: '18px' }}>{i + 1}</span>
                            <div className='queueimagecontainer' key={`queue-image-${i}`}>
                                <div className='queueimageandoverlay'>
                                    {<img src={contentitem.poster} height='100px' alt='no-poster'></img>}
                                    <div key={`queue-overlay-${i}`} onClick={() => handleContentClick(contentitem)} className='overlay'>
                                        <i className="fa-regular fa-hand-pointer"></i>
                                    </div>
                                </div>
                                <div>
                                    <i style={{ marginTop: '5px', fontSize: '12px' }} onClick={() => handleRemoveQueueClick(contentitem)} className="fa-solid fa-xmark"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
};


export default OtherProfileBox;