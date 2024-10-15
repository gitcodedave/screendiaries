import { useEffect, useState } from 'react';
import { API } from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { NavLink } from 'react-router-dom';
import ActivityFeedBox from './activityfeedbox';

const ProfileBox = () => {
    const [profileNameState, setProfileNameState] = useState('')
    const [reviewCount, setReviewCount] = useState(0)
    const [ratingCount, setRatingCount] = useState(0)
    const [followCount, setFollowCount] = useState(0)
    const [bioState, setBioState] = useState('')
    const [firstNameState, setFirstNameState] = useState('')
    const [lastNameState, setLastNameState] = useState('')
    const [profilePictureState, setProfilePictureState] = useState('')
    const [myMovieQueue, setMyMovieQueue] = useState([])
    const [mySeriesQueue, setMySeriesQueue] = useState([])
    const [hasMovieQueue, setHasMovieQueue] = useState(false)
    const [hasSeriesQueue, setHasSeriesQueue] = useState(false)
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const navigate = useNavigate()


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

    const handleEditProfileClick = (e) => {
        e.preventDefault()
        navigate('/editprofile')
    }
    const fetchQueue = async () => {
        try {
            const myQueueResponse = await API.get(`network/myqueue/${cookies.profileID}/`)
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
        const fetchStats = async () => {
            try {
                const reviewCountResponse = await API.get(`network/userreviewcount/${cookies.profileID}/`)
                setReviewCount(reviewCountResponse.data)
            } catch (error) {
                console.log(error, 'error fetching review count')
            }
            try {
                const ratingCountResponse = await API.get(`network/userratingcount/${cookies.profileID}/`)
                setRatingCount(ratingCountResponse.data)
            } catch (error) {
                console.log(error, 'error fetching rating count')
            }
            try {
                const followCountResponse = await API.get(`network/userfollowcount/${cookies.profileID}/`)
                setFollowCount(followCountResponse.data)
            } catch (error) {
                console.log(error, 'error fetching follow count')
            }
        }

        const fetchUser = async () => {
            try {
                const userProfileResponse = await API.get(`/network/userprofiles/me`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                })
                let { bio, profile_picture, first_name = false, last_name = false, username } = userProfileResponse.data
                setProfileNameState(username)
                profile_picture = 'http://localhost:8000' + profile_picture
                setProfilePictureState(profile_picture)
                setBioState(bio)
                setFirstNameState(first_name)
                setLastNameState(last_name)
            } catch (error) {
                console.error('Error fetching user', error);
                return null;
            }
        }
        fetchUser()
        fetchStats()
        fetchQueue()
    }, [cookies.AccessToken, cookies.profileID])

    return (
        <div className='profilecontainer'>
            <div className='profileitems'>
                <div className='profilename'>
                    {profileNameState}
                </div>
                <div className='profileinfocontainer'>
                    <div className='profileimageandname'>
                        <img src={profilePictureState} alt='profile pic' style={{ clipPath: 'circle()', height: '100px', width: '100px', objectFit: 'cover' }} ></img>
                        {firstNameState && firstNameState + ' ' + lastNameState}
                    </div>
                    <div className='profilestatscontainer'>
                        <div className='profilestats'>
                        <NavLink style={{ textDecoration: 'none' }} to={`/myreviewfeed/${cookies.profileID}`}> <div className='stat'>
                                <div className='statnumber'>
                                    {reviewCount}
                                </div>
                                <div className='statname'>
                                    reviews
                                </div>
                            </div></NavLink>
                            <NavLink style={{ textDecoration: 'none' }} to={`/myratingfeed/${cookies.profileID}`}><div className='stat'>
                            <div className='statnumber'>
                                    {ratingCount}
                                </div>
                                <div className='statname'>
                                    ratings
                                </div>
                            </div></NavLink>
                            <NavLink style={{ textDecoration: 'none' }} to={`/friendslist/${cookies.profileID}`}><div className='stat'>
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
                    <button className='profilebutton' onClick={handleEditProfileClick}>Edit Profile</button>
                    <NavLink to={`/mywatchlist/${cookies.profileID}/`}><button className='profilebutton'>My WatchList</button></NavLink>
                    <NavLink to={`/friendwatchlist/`}><button className='profilebutton'>Friends WatchList</button></NavLink>
                </div>
                <div className='separator'></div>
                <div className='queuelabel'>
                    My Movie Queue
                </div>
                <div className='queuecontainer'>
                    {!hasMovieQueue &&
                        <div className='emptyqueue'>
                            <div>
                                There's nothing in your Movie Queue yet. <br></br>
                            </div>
                            <div>
                                <NavLink to='/search'><img height={'15px'} style={{ marginTop: '5px' }} alt='search-icon' src='/search-icon.png'></img></NavLink>
                            </div>
                            <Link to={'/search'}>Search</Link>
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
                    My Series Queue
                </div>
                <div className='queuecontainer'>
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
                    {!hasSeriesQueue &&
                        <div className='emptyqueue'>
                            <div>
                                There's nothing in your Series Queue yet. <br></br>
                            </div>
                            <div>
                                <NavLink to='/search'><img height={'15px'} style={{ marginTop: '5px' }} alt='search-icon' src='/search-icon.png'></img></NavLink>
                            </div>
                            <Link to={'/search'}>Search</Link>
                        </div>
                    }
                </div>
                <div className='separator'></div>
                <ActivityFeedBox />
            </div>
        </div>

    );
};


export default ProfileBox;