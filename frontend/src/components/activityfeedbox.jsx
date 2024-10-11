import { API } from "../api/api"
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";


const ActivityFeedBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const [activityFeed, setActivityFeed] = useState([])
    const [showActivityFeed, setShowActivityFeed] = useState(false)



    useEffect(() => {
        const fetchActivityFeed = async () => {
            let userList;
            try {
                const followingListResponse = await API.get(`network/friendslist/${cookies.profileID}/`,
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
            if (userList.length) {
                try {
                    const user_list = userList.join(',');
                    const activityFeedResponse = await API.get(`network/myactivityfeed/?user_list=${user_list}`,
                        {
                            headers: {
                                Authorization: `JWT ${cookies.AccessToken}`
                            }
                        });
                    console.log(activityFeedResponse.data)
                    setActivityFeed(activityFeedResponse.data)
                    if(activityFeedResponse.data.length){
                        setShowActivityFeed(true)
                    }
                } catch (error) {
                    console.log(error, 'Unable to fetch activity feed')
                }
            }

        }
        fetchActivityFeed()
    }, [cookies.profileID, cookies.AccessToken])

    return (
        <div>
            {showActivityFeed && activityFeed.map((item, i) => (
                <div key={`feed-item=${i}`}>
                    {item.activity_type === 'Review' && 
                    <div>
                        {item.review.user_profile.username} said {item.review.review_text} about {item.review.content.title}
                    </div>
                    }
                    {item.activity_type === 'Rating' && 
                    <div>
                        {item.rating.user_profile.username} left a rating of {item.rating.rating} on {item.rating.content.title}
                    </div>
                    }
                </div>
            ))}
        </div>
    )
}

export default ActivityFeedBox;