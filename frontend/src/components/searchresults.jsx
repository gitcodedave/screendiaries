import { useState } from "react";
import { useCookies } from "react-cookie";
import { API } from "../api/api";

const SearchResults = ({ searchResultsList, contentTypeMovies, contentTypeSeries, contentTypeSeason, contentTypeEpisode, contentType }) => {
    const [cookies] = useCookies('AccessToken')
    const [errorState, setErrorState] = useState('')

    const handleResultClick = async (e, i) => {
        try {
            const imdbIDParam = {
                'i': searchResultsList[i].imdbID
            }
            const searchResponse = await API.get('/network/contentsearch/',
                {
                    params: imdbIDParam,
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                },
            )
            const { imdbID, Title, Year, Director, Actors, Genre, Plot, Poster, Runtime } = searchResponse.data
            console.log(Year)
            const contentData = {
                "imdbid": imdbID,
                "content_type": contentType,
                "season": null,
                "episode": null,
                "title": Title,
                "year": Year,
                "director": Director,
                "actors": Actors,
                "genre": Genre,
                "plot": Plot,
                "poster": Poster,
                "runtime": Runtime
            }
            const uploadContent = await API.post('/network/content/', contentData,
                {
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                }
            )
            console.log(uploadContent)
            return;
        } catch (error) {
            if (error.response) {
                console.error('Error response data:', error.response.data);
                if (error.response.status === 500) {
                    console.error('Internal Server Error: ', error.response.data);
                    // Optionally, you can set an error state here to display a message to the user
                    setErrorState('Internal Server Error. Please try again later.');
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
            }
            console.error('Error config:', error.config);
        }
    }

    return (
        <div>
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
                        <li key={`${i}-${result.Title}`}>{result.Title}</li>
                    ))}
                    {contentTypeSeason && searchResultsList.map((result, i) => (
                        <li key={`${i}-${result.Title}`}>{result.Title}</li>
                    ))}
                    {contentTypeEpisode && searchResultsList.map((result, i) => (
                        <li key={`${i}-${result.Title}`}>{result.Title}</li>
                    ))}
                </tbody>
            </table>
        </div>
    )

}

export default SearchResults;