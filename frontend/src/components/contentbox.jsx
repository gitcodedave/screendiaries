import { useCookies } from "react-cookie";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "../api/api";
import LeaveReview from "./leavereview";


const ContentBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const location = useLocation()
    const [contentData, setContentData] = useState(location.state)
    const [myRating, setMyRating] = useState('')
    const [hasRating, setHasRating] = useState(false)
    const [inQueue, setInQueue] = useState(false)
    const [watched, setWatched] = useState(false)
    const [addToQueueButton, setAddToQueueButton] = useState(true)
    const params = useParams()

    const handleAddToQueueClick = async (e) => {
        try {
            const queueData = {
                'user_profile': cookies.profileID,
                'content': params.imdbID
            }
            const addToQueueResponse = await API.post(`/network/queueitems/`, queueData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addToQueueResponse.status === 201) {
                setInQueue(true);
                setAddToQueueButton(false);
            }
        } catch (error) {
            console.log(error, 'Not able to add to queue')
        }
    }

    const handleRemoveFromQueueClick = async (e) => {
        try {
            const deleteFromQueueResponse = await API.delete(`network/myqueuedelete/${params.imdbID}/${cookies.profileID}/`)
            if (deleteFromQueueResponse.status === 204){
                setInQueue(false)
                setAddToQueueButton(true);
            }
        } catch (error) {
            console.log(error, 'Not able to delete queue item')
        }
    }

    const handleWatchedClick = async (e) => {
        try {
            const watchListData = {
                'user_profile': cookies.profileID,
                'content': params.imdbID,
                'status': 'Watched'
            }
            const addToWatchListResponse = await API.post(`/network/watchlistitems/`, watchListData, {
                headers: {
                    Authorization: `JWT ${cookies.AccessToken}`
                }
            });
            if (addToWatchListResponse.status === 201) {
                setWatched(true)
                handleRemoveFromQueueClick()
            }
        } catch (error) {
            console.log(error, 'Not able to add to watchlist')
        }


        // try {
        //     const deleteFromQueueResponse = await API.delete(`network/myqueuedelete/${params.imdbID}/${cookies.profileID}/`)
        //     if (deleteFromQueueResponse.status === 204){
        //         setInQueue(false)
        //         setAddToQueueButton(true);
        //     }
        // } catch (error) {
        //     console.log(error, 'Not able to delete queue item')
        // }
    }
    const handleNotWatchedClick = async (e) => {
        try {
            const deleteFromWatchListResponse = await API.delete(`network/mywatchlistdelete/${params.imdbID}/${cookies.profileID}/`)
            if (deleteFromWatchListResponse.status === 204){
                setWatched(false)
            }
        } catch (error) {
            console.log(error, 'Not able to delete watchlist item')
        }
        // try {
        //     const deleteFromQueueResponse = await API.delete(`network/myqueuedelete/${params.imdbID}/${cookies.profileID}/`)
        //     if (deleteFromQueueResponse.status === 204){
        //         setInQueue(false)
        //         setAddToQueueButton(true);
        //     }
        // } catch (error) {
        //     console.log(error, 'Not able to delete queue item')
        // }
    }


    useEffect(() => {
        const checkInQueue = async () => {
            try {
                const checkInQueueResponse = await API.get(`/network/checkinqueue/${params.imdbID}/${cookies.profileID}`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (checkInQueueResponse.status === 200) {
                    setInQueue(true);
                    setAddToQueueButton(false)
                }
            } catch (error) {
                if (error.status === 404)
                    console.log('Not in Queue')
            }
        }

        const checkInWatchlist = async () => {
            try {
                const checkInWatchListResponse = await API.get(`/network/checkinwatchlist/${params.imdbID}/${cookies.profileID}`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (checkInWatchListResponse.status === 200) {
                    setInQueue(false);
                    setAddToQueueButton(true);
                    setWatched(true)
                }
            } catch (error) {
                if (error.status === 404)
                    console.log('Not in Watchlist')
            }
        }

        const fetchMyRating = async () => {
            try {
                const checkMyRating = await API.get(`/network/myrating/${params.imdbID}/${cookies.profileID}`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (checkMyRating.data) {
                    setHasRating(true);
                    setMyRating(checkMyRating.data.rating);
                }
            } catch (error) {
                console.log('Have not rated this yet');
            }
        };

        const fetchContentData = async () => {
            try {
                const content = await API.get(`/network/content/${params.imdbID}`, {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                });
                if (content.status === 200) {
                    setContentData(content.data);
                }
            } catch (error) {
                console.log('An error occurred fetching the content data in ContentBox', error);
            }
        };
        if (location.state) {
            setContentData(location.state);
        } else {
            fetchContentData();
        }
        fetchMyRating()
        checkInQueue()
        checkInWatchlist()

    }, [location.state, params.imdbID, cookies.AccessToken, cookies.profileID]);

    return (
        <div className='contentpage'>
            <div className='contenttitle'>
                {contentData && contentData.title}
            </div>
            <div className='contentblock'>
                <div>
                    {contentData && <img className="contentposter" src={contentData.poster} alt='no-poster'></img>}
                </div>
                <div className='contentinfo'>
                    <div className='contentinfoitem'>
                        {hasRating && (
                            <>
                                <span style={{ color: '#018749' }}>My rating: {myRating}/5 <i className="fa-solid fa-star"></i></span>
                            </>
                        )}
                    </div>
                    <div className='contentinfoitem'>
                        <strong>{contentData && contentData.content_type}</strong>
                    </div>
                    <div className='contentinfoitem'>
                        <em>{contentData && contentData.genre}</em>
                    </div>
                    <div className='contentinfoitem'>
                        {contentData && (
                            <>
                                <strong>Directed By: </strong>{contentData.director}
                            </>
                        )}
                    </div>
                    <div className='contentinfoitem'>
                        {contentData && (
                            <>
                                <strong>Starring:  </strong>{contentData.actors}
                            </>
                        )}
                    </div>
                    <div className='contentinfoitem'>
                        {contentData && (
                            <>
                                <strong>Plot  </strong>{contentData.plot}
                            </>
                        )}
                    </div>
                </div>
            </div>
                        <div className='contentallbuttons'>
                    <div className='contentinfobuttons'>
                        {!watched && addToQueueButton && <button className='queue' onClick={handleAddToQueueClick}><i className="fas fa-plus"></i> Add to queue</button>}
                        {!watched && inQueue && <button className='added' onClick={handleRemoveFromQueueClick}>In my queue <i className="fas fa-check"></i></button>}
                        {watched && <button className='watched' onClick={handleNotWatchedClick}>Watched <i className="fas fa-check"></i></button>}
                        {!watched && <button className='notwatched' onClick={handleWatchedClick}>Watched <i className="fa-solid fa-question"></i></button>}
                    </div>
                    <div className='contentinfobuttons'>
                        {!watched && contentData && <button className='currentlywatching'><i className="fas fa-clock"></i> Watching</button>}
                        {contentData && <button className='whoswatching'><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                    </div>
                    </div>
            <LeaveReview />
        </div>
    )
}

export default ContentBox;


// const reformatData = (data) => {
//     const { imdbID, Title, Type, Year, Director, Actors, Genre, Plot, Poster, Runtime, Season = null, Episode = null } = data;
//     const reformattedData = {
//         "imdbid": imdbID,
//         "content_type": Type,
//         "season": Season,
//         "episode": Episode,
//         "title": Title,
//         "year": Year,
//         "director": Director,
//         "actors": Actors,
//         "genre": Genre,
//         "plot": Plot,
//         "poster": Poster,
//         "runtime": Runtime
//     };
//     if(!reformattedData.content_type){
//         reformattedData.content_type = data.content_type
//     }
//     reformattedData.content_type = reformattedData.content_type[0].toUpperCase() + reformattedData.content_type.slice(1)
//     setContentData(reformattedData);
// };