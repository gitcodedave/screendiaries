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
                        let { profile_picture } = item.user_profile
                        if (!profile_picture.includes('http://localhost:8000')) {
                            profile_picture = 'http://localhost:8000' + profile_picture
                        }
                        item.user_profile.profile_picture = profile_picture
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
                                <div className='activityfeeditemblock'>
                                    <div className='activityfeedcontentblock'>
                                        <div>
                                            {item && <NavLink to={`/content/${item.content.imdbid}`}><img className="activityfeedcontentposter" src={item.content.poster} alt='no-poster'></img></NavLink>}
                                        </div>
                                        <div className='contentinfo'>
                                            <div className='contentinfoitem'>
                                                <strong>{item.content.title}</strong> <span style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                                    {item.rating} <i className="fa-solid fa-star"></i>
                                                </span> <br></br>
                                                {item.content.content_type}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default RatingFeedBox;