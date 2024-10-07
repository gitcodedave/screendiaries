import { useEffect, useState } from "react";
import { API } from "../api/api";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";


const Reviews = () => {
    const { imdbID } = useParams()
    const [cookies] = useCookies('profileID', 'AccessToken')
    const [reviews, setReviewsState] = useState(false)
    const [reviewList, setReviewList] = useState([])

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const checkReviews = await API.get(`/network/contentreviews/${imdbID}`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                setReviewList(checkReviews.data);
                if (checkReviews.data.length) {
                    setReviewsState(true);
                }
            } catch (error) {
                console.log(error, 'Error fetching reviews');
            }
        };

        fetchReviews();
    }, [imdbID, cookies.AccessToken]);




    return (
        <div>
            {reviews && reviewList.map((review, i) => (
                
                <div className='reviewcontainer' key={`review-${i}`}>
                    <div>
                        {<img src={`http://localhost:8000${review.user_profile.profile_picture}`} height='50px' alt='no-poster'></img>}
                       <span className='profilename'> {review.user_profile.first_name}</span>
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