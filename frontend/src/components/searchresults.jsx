import { useCookies } from "react-cookie";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SearchResults = ({ searchResultsList, episodesList, contentTypeMovies, contentTypeSeries, contentTypeSeason, contentTypeEpisode, contentType }) => {
    const [cookies] = useCookies('AccessToken')
    const navigate = useNavigate()
    const [showLoading, setShowLoading] = useState(false)

    const handleResultClick = async (e, i) => {
        setShowLoading(true)
        let searchRequestSuccess = false;
        let postRequestSuccess = false
        let imdbIDParam;
        let searchResponse;
        let contentExists;

        if (episodesList.length) {
            imdbIDParam = {
                'i': episodesList[i].imdbID
            }
            contentType = 'Episode'
        } else {
            imdbIDParam = {
                'i': searchResultsList[i].imdbID
            }
        }
        try {
            contentExists = await API.get(`/network/content/${imdbIDParam.i}`,
                {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                },
            )
            if (contentExists.status === 200) {
                navigate(`/content/${imdbIDParam.i}`, { state: contentExists.data })
                return;
            }
        } catch (error) {
            // Movie is not in the database yet
            console.log('Uploading content to database')
        }
        try {
            searchResponse = await API.get('/network/contentsearch/',
                {
                    params: imdbIDParam,
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                },
            )
            if (searchResponse.status === 200) {
                searchRequestSuccess = true;
            }
        } catch (error) {
            if (error.response) {
                console.error('Error response data:', error.response.data);
                if (error.response.status === 500) {
                    console.error('Internal Server Error: ', error.response.data);
                }
            }
        }
        let data = searchResponse.data
        let imdbID = data.imdbID
        let uploadContent;
        if (searchRequestSuccess) {
            try {
                const { Title, Year, Director, Actors, Genre, Plot, Poster, Runtime, Season = null, Episode = null, seriesID = null } = searchResponse.data
                const contentData = {
                    "imdbid": imdbID,
                    "content_type": contentType,
                    "season": Season,
                    "episode": Episode,
                    "title": Title,
                    "year": Year,
                    "director": Director,
                    "actors": Actors,
                    "genre": Genre,
                    "plot": Plot,
                    "poster": Poster,
                    "runtime": Runtime, 
                    "seriesid": seriesID
                }
                uploadContent = await API.post('/network/content/', contentData,
                    {
                        headers: {
                            Authorization: `JWT ${cookies.AccessToken}`
                        }
                    }
                )
                if (uploadContent.status === 201) {
                    postRequestSuccess = true
                }
            } catch (error) {
                if (error.response) {
                    console.error('Error response data:', error.response.data);
                    if (error.response.status === 500) {
                        console.error('Internal Server Error: ', error.response.data);
                    }
                }
            }
            if (postRequestSuccess) {
                navigate(`/content/${imdbID}`)
            }
        }
    }

    return (
        <div>
            {showLoading && (
            <div className='clickresultloading'>
               New Content! Loading...
            </div>
            )}
            <table className='searchresults'>
                <tbody>
                    {contentTypeMovies && searchResultsList.map((result, i) => (
                        <tr className='searchresults' key={`row-${i}-${result.Title}`} onClick={(e) => handleResultClick(e, i)} >
                            <td key={`${i}-${result.Title}-poster`}>{<img src={result.Poster} height='100px' alt='no-poster'></img>}</td>
                            <td key={`${i}-${result.Title}`}>{result.Title}</td>
                            <td key={`${i}-${result.Title}-year`}>{result.Year}</td>
                        </tr>
                    ))}
                    {contentTypeSeries && searchResultsList.map((result, i) => (
                        <tr className='searchresults' key={`row-${i}-${result.Title}`} onClick={(e) => handleResultClick(e, i)} >
                            <td key={`${i}-${result.Title}-poster`}>{<img src={result.Poster} height='100px' alt='no-poster'></img>}</td>
                            <td key={`${i}-${result.Title}`}>{result.Title}</td>
                            <td key={`${i}-${result.Title}-year`}>{result.Year}</td>
                        </tr>
                    ))}
                    {contentTypeSeason && episodesList.map((episode, i) => (
                        <tr className='searchresults' key={`row-${i}-${episode.Title}`} onClick={(e) => handleResultClick(e, i)}>
                            <td key={`${i}-space`}></td>
                            <td key={`${i}-${episode.Episode}`}>{episode.Episode}</td>
                            <td key={`${i}-${episode.Title}`}>{episode.Title}</td>
                        </tr>
                    ))}
                    {contentTypeEpisode && searchResultsList.map((result, i) => (
                        <tr className='searchresults' key={`row-${i}-${result.Title}`} onClick={(e) => handleResultClick(e, i)} >
                            <td key={`${i}-${result.Title}-poster`}>{<img src={result.Poster} height='100px' alt='no-poster'></img>}</td>
                            <td key={`${i}-${result.Title}`}>{result.Title}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

}

export default SearchResults;