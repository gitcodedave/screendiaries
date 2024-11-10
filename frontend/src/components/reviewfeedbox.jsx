import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { NavLink, Link, useParams } from "react-router-dom";


const ReviewFeedBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [activityFeed, setActivityFeed] = useState([])
    const [showActivityFeed, setShowActivityFeed] = useState(false)
    const params = useParams()
    const user_id = params.user_id

    useEffect(() => {
        const fetchReviewFeed = async () => {
            try {
                const activityFeedResponse = await API.get(`network/myreviewfeed/${user_id}`,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    });
                const data = activityFeedResponse.data;
                data.map((item, i) => {
                        let { profile_picture } = item.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        item.user_profile.profile_picture = profile_picture
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
        fetchReviewFeed()
    }, [cookies.profileID, cookies.AccessToken, user_id])

    return (
        <div>
            <Link style={{ marginLeft: '10px' }} to={`/profile/${user_id}/`}><i style={{ fontSize: '30px', marginTop: '10px' }} className="fa-solid fa-angle-left"></i></Link>
            <div className='activityfeedpage'>
                <div className='activityfeedcontainer'>
                    {!activityFeed.length && user_id === cookies.profileID && (
                        <div className='emptyqueue'>
                            <div>
                                You haven't reviewed anything yet. <br></br>
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
                                This user hasn't reviewed anything yet. <br></br>
                            </div>
                        </div>
                    )}
                    {showActivityFeed && activityFeed.map((item, i) => (
                        <div className='activityfeeditem' key={`feed-item=${i}`}>
                                <NavLink to={`/activity/${item.activity_feed.id}`} style={{textDecoration: 'none'}}><div className='activityfeeditemblock'>
                                    <div className='activityfeedcontentblock'>
                                        <div>
                                            {item && <img className="activityfeedcontentposter" src={item.content.poster} alt='no-poster'></img>}
                                        </div>
                                        <div className='contentinfo'>
                                            <div className='contentinfoitem'>
                                                <strong>{item.content.title}</strong> <span style={{ fontWeight: 'bold' }}>
                                                    {item.rating} <i className="fa-solid fa-star"></i>
                                                </span> <br></br>
                                                {item.content.content_type}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='activityfeedreviewblock'>
                                        <div className='activityfeedreview'>
                                            {item.review_text}
                                        </div>
                                    </div>
                                </div></NavLink>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ReviewFeedBox;