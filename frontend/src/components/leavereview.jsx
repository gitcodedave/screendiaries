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
    const params = useParams()
    const [cookies] = useCookies(['profileID', 'AccessToken']);


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
        e.preventDefault()
        if (ratingState === '') {
            setErrorState('(Please choose a rating)')
            return;
        }
        if (reviewState !== '') {
            const imdbID = params.imdbID
            const reviewData = {
                "review_text": reviewState,
                "rating": ratingState,
                "content": imdbID,
                "user_profile_id": cookies.profileID,
                "contains_spoiler": containsSpoiler
            }
            try {
                const uploadReview = await API.post('/network/reviews/', reviewData,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    }
                )
            } catch (error) {
                console.log(error, 'error occured uploading review')
            }
            window.location.reload();
            return;
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
                {`${errorState}`}
            </div>
            <Reviews/>
        </div>
    )
}

export default LeaveReview;