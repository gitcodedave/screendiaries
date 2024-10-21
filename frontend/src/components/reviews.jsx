import { useEffect, useState } from "react";
import { API } from "../api/api";
import { useParams, NavLink } from "react-router-dom";
import { useCookies } from "react-cookie";


const Reviews = () => {
    const { imdbID } = useParams()
    const [cookies] = useCookies('profileID', 'AccessToken')
    const [reviews, setReviewsState] = useState(false)
    const [myReview, setMyReviewState] = useState(false)
    const [reviewList, setReviewList] = useState([])
    const [myReviewList, setMyReviewList] = useState([])

    useEffect(() => {

        const fetchMyReview = async () => {
            try {
                const checkMyReview = await API.get(`/network/myreview/${imdbID}/${cookies.profileID}/`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                setMyReviewList([checkMyReview.data]);
                if (myReviewList.length) {
                    setMyReviewState(true);
                }
            } catch (error) {
                console.log('Have not reviewed this yet');
            }
        };

        const fetchAllOtherReviews = async () => {
            try {
                const checkReviews = await API.get(`/network/allotherreviews/${imdbID}/${cookies.profileID}/`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                setReviewList(checkReviews.data);
                if (checkReviews.data.length) {
                    setReviewsState(true);
                }
            } catch (error) {
                console.log('No one else has reviewed this yet');
            }
        };

        fetchMyReview()
        fetchAllOtherReviews();
    }, [imdbID, cookies.AccessToken, cookies.profileID, myReviewList.length]);




    return (
        <div>
            {myReview && myReviewList.map((review, i) => (
                
                <div className='reviewcontainer' key={`my-review-${i}`}>
                    <div>
                        {<NavLink to={`/profile/${review.user_profile.id}`}><img src={`http://localhost:8000${review.user_profile.profile_picture}`} style={{clipPath: 'circle()', objectFit: 'cover', height: '50px', width: '50px' }} alt='profile-picture'></img></NavLink>}
                       <span className='reviewusername'> {review.user_profile.username}</span>
                       <span className='rating'> Rated this: {review.rating + '/5'} <i className="fa-solid fa-star"></i></span>
                    </div>
                    <div className='reviewtext'>
                        {review.review_text}
                    </div>
                    <div>
                        <span className='datestring'>{new Date(review.timestamp).toDateString().slice(4)}</span>
                    </div>
                </div>
            ))
            }
            {reviews && reviewList.map((review, i) => (
                
                <div className='reviewcontainer' key={`review-${i}`}>
                    <div>
                        {<NavLink to={`/profile/${review.user_profile.id}`}><img src={`http://localhost:8000${review.user_profile.profile_picture}`} style={{clipPath: 'circle()', objectFit: 'cover', height: '50px', width: '50px' }} alt='profile-picture'></img></NavLink>}
                       <span className='reviewusername'> {review.user_profile.username}</span>
                       <span className='rating'> Rated this: {review.rating + '/5'} <i className="fa-solid fa-star"></i></span>
                    </div>
                    <div className='reviewtext'>
                        {review.review_text}
                    </div>
                    <div>
                        <span className='datestring'>{new Date(review.timestamp).toDateString().slice(4)}</span>
                    </div>
                </div>
            ))
            }
        </div>
    )
}

export default Reviews;