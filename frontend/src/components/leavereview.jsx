import { useState } from "react"
import { useParams } from "react-router-dom"
import { useCookies } from "react-cookie"
import { API } from "../api/api"
import Reviews from "./reviews"

const LeaveReview = () => {
    const [ratingState, setRatingState] = useState('')
    const [reviewOrRating, setReviewOrRating] = useState('Leave Rating')
    const [review, setReview] = useState(false)
    const [reviewState, setReviewState] = useState('')
    const [containsSpoiler, setContainsSpoiler] = useState(false)
    const [errorState, setErrorState] = useState('')
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const params = useParams()
    const imdbID = params.imdbID

    const handleContainsSpoiler = (e) => {
        setContainsSpoiler(e.target.checked);
    }

    const handleRatingChange = (e) => {
        e.preventDefault()
        setErrorState('')
        setRatingState(e.target.value)
        return;
    }

    const handleReviewChange = (e) => {
        const value = e.target.value;
        setReviewState(value);
        if (value === '') {
            setReviewOrRating('Leave Rating');
            setReview(false);
        } else {
            setReviewOrRating('Leave Review');
            setReview(true);
        }
    };

    const handleClick = async (e) => {
        let uploadReview;
        let uploadRating;
        let createActivityReview;
        let createActivityRating;
        e.preventDefault()
        if (ratingState === '') {
            setErrorState('(Please choose a rating)')
            return;
        }
        if (reviewState !== '') {
            try {
                const activityFeedData = {
                    "user_profile": cookies.profileID,
                    "activity_type": 'Review'
                }
                createActivityReview = await API.post('/network/activityfeeditems/', activityFeedData,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    }
                )
            } catch (error) {
                console.log(error, 'Unable to add to activity feed')
            }

            if (createActivityReview.status === 201) {
                try {
                    let activityFeedData = createActivityReview.data
                    let activityID = activityFeedData.id

                    const reviewData = {
                        "review_text": reviewState,
                        "rating": ratingState,
                        "content": imdbID,
                        "user_profile_id": cookies.profileID,
                        "contains_spoiler": containsSpoiler,
                        "activity_feed": activityID
                    }
                    uploadReview = await API.post('/network/reviews/', reviewData,
                        {
                            headers: {
                                Authorization: `JWT ${cookies.AccessToken}`
                            }
                        }
                    )
                    const ratingData = {
                        "rating": ratingState,
                        "content": imdbID,
                        "user_profile_id": cookies.profileID,
                        "activity_feed": activityID
                    }
                    try {
                        uploadRating = await API.post('/network/ratings/', ratingData,
                            {
                                headers: {
                                    Authorization: `JWT ${cookies.AccessToken}`
                                }
                            }
                        )
                    } catch (error) {
                        console.log(error, 'Rating exists already, updating')
                        if (error.status === 400) {
                            uploadRating = await API.patch(`/network/myrating/${imdbID}/${cookies.profileID}/`, ratingData,
                                {
                                    headers: {
                                        Authorization: `JWT ${cookies.AccessToken}`
                                    }
                                }
                            )
                        }
                        if (uploadRating.status === 200) {
                            window.location.reload();
                        }
                    }
                } catch (error) {
                    setErrorState("(You've already reviewed this)")
                    return;
                }
            }
            if (uploadReview.status === 201) {
                window.location.reload();
            }
            return;

        } else {
            let activityFeedData;
            try {
                activityFeedData = {
                    "user_profile": cookies.profileID,
                    "activity_type": 'Rating'
                }
                createActivityRating = await API.post('/network/activityfeeditems/', activityFeedData,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    }
                )
            } catch (error) {
                console.log(error, 'Unable to add to activity feed')
            }

            if (createActivityRating.status === 201) {
                let createActivityRatingData = createActivityRating.data
                let activityID = createActivityRatingData.id

                const ratingData = {
                    "rating": ratingState,
                    "content": imdbID,
                    "user_profile_id": cookies.profileID,
                    "activity_feed": activityID
                }
                try {
                    uploadRating = await API.post('/network/ratings/', ratingData,
                        {
                            headers: {
                                Authorization: `JWT ${cookies.AccessToken}`
                            }
                        }
                    )

                    console.log(uploadRating)
                } catch (error) {
                    console.log(error, 'Rating exists already, updating')
                    if (error.status === 400) {
                        uploadRating = await API.patch(`/network/myrating/${imdbID}/${cookies.profileID}/`, ratingData,
                            {
                                headers: {
                                    Authorization: `JWT ${cookies.AccessToken}`
                                }
                            }
                        )
                    }
                    if (uploadRating.status === 200) {
                        window.location.reload();
                    }
                }
            }
        }

    }

    return (
        <div className='textareacontainer'>
            <textarea className='leavereview' value={reviewState} onChange={handleReviewChange} rows={5} placeholder=" leave a review..."></textarea>
            <div className='reviewbuttoncontainer'>
                {review && (
                    <div className='containsspoiler'>
                        <input
                            id='containsspoiler'
                            type="checkbox"
                            checked={containsSpoiler}
                            onChange={handleContainsSpoiler}
                        />
                        <label>
                            Contains Spoiler? {containsSpoiler ? 'Yes' : 'No'}
                        </label>
                    </div>
                )}
                <div className='ratingreviewbuttons'>
                    <label style={{ marginRight: '5px', fontSize: '14px' }}>
                        Rating
                    </label>
                    <select className='leaverating' defaultValue='--' onChange={handleRatingChange}>
                        <option value='--' disabled> -- </option>
                        <option value='5'>5</option>
                        <option value='4'>4</option>
                        <option value='3'>3</option>
                        <option value='2'>2</option>
                        <option value='1'>1</option>
                    </select>
                    <button className='submitreview' onClick={handleClick}>{reviewOrRating}</button>
                </div>
            </div>
            <div className='ratingerror'>
                <span style={{ color: '#fd5c63' }}> {`${errorState}`}</span>
            </div>
            <Reviews />
        </div>
    )
}

export default LeaveReview;