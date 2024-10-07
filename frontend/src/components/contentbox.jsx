import { useCookies } from "react-cookie";
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { API } from "../api/api";
import LeaveReview from "./leavereview";


const ContentBox = () => {
    const [cookies] = useCookies(['profileID', 'AccessToken']);
    const location = useLocation()
    const [contentData, setContentData] = useState(location.state)
    const [inQueue, setInQueue] = useState(false)
    const params = useParams()

    useEffect(() => {

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
    }, [location.state, params.imdbID, cookies.AccessToken]);

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
                    <div className='contentinfobuttons'>
                        {contentData && <button className='queue'><i className="fas fa-plus"></i> Add to queue</button>}
                        {inQueue && <button className='added'>In my queue <i className="fas fa-check"></i></button>}
                        {contentData && <button className='whoswatching'><i className="fa-solid fa-eye"></i> Who's watching?</button>}
                    </div>
                    <div className='contentinfoitem'>
                        {contentData && <button className='currentlywatching'><i className="fas fa-clock"></i> Watching</button>}
                        {contentData && <button className='watched'>Watched <i className="fas fa-check"></i></button>}
                    </div>
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