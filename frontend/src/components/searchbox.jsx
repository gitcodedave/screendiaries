import { useState } from "react";
import { API } from "../api/api";
import { useCookies } from "react-cookie";
import SearchResults from "./searchresults";

const SearchBox = () => {
    const [checkboxState, setCheckboxState] = useState('movie')
    const [searchState, setSearchState] = useState('')
    const [seasonState, setSeasonState] = useState('')
    const [showSeasonAndEpisode, setShowSeasonAndEpisodeState] = useState(false)
    const [episodeState, setEpisodeState] = useState('')
    const [errorState, setErrorState] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [contentTypeMovies, setContentTypeMovies] = useState(false)
    const [contentTypeSeries, setContentTypeSeries] = useState(false)
    const [contentTypeSeason, setContentTypeSeason] = useState(false)
    const [episodesList, setEpisodesList] = useState([])
    const [contentTypeEpisode, setContentTypeEpisode] = useState(false)
    const [contentType, setContentType] = useState(false)

    const [cookies] = useCookies('AccessToken')
    const handleTypeSelectClick = (e) => {
        if (checkboxState === 'movie') {
            setCheckboxState('series')
            setShowSeasonAndEpisodeState(true)
        } else {
            setCheckboxState('movie')
            setShowSeasonAndEpisodeState(false)
        }
    }

    const handleSubmitClick = async (e) => {
        e.preventDefault()
        setContentTypeMovies(false)
        setContentTypeSeries(false)
        setContentTypeSeason(false)
        setContentTypeEpisode(false)
        if (searchState === '') {
            setErrorState('(Please enter a search query)')
            return;
        }
        const search = {
            's': searchState,
            'type': checkboxState
        }
        if (checkboxState === 'series') {
            if (seasonState !== '') {
                search.season = seasonState
                if (episodeState !== '') {
                    if (seasonState === '') {
                        setErrorState('(Please enter a Season #)')
                        return;
                    }
                    setContentTypeEpisode(true)
                    setContentType('Episode')
                    search.episode = episodeState
                } else {
                    setContentTypeSeason(true)
                    setContentType('Season')
                }
            } else {
                setContentTypeSeries(true)
                setContentType('Series')
            }
        } else {
            setContentTypeMovies(true)
            setContentType('Movie')
        }

        try {
            const searchResponse = await API.get('/network/contentsearch/',
                {
                    params: search,
                    headers: {
                        Authorization: `JWT ${cookies.AccessToken}`
                    }
                },
            )
            const data = searchResponse.data
            if (data.Response === 'False') {
                setErrorState(`(${data.Error})`)
                console.log('error')
                return;
            }
            if('Episodes' in data){
                setEpisodesList(data.Episodes)
            }
            setErrorState('')
            if ('Title' in data) {
                setSearchResults([data])
            } else {
                setSearchResults(data.Search)
            }
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
        <div className='searchbox'>
            <input className="input" id="toggle" onClick={handleTypeSelectClick} type="checkbox" />
            <label className="label" htmlFor="toggle">
                <div className="left">
                    Movie
                </div>
                <div className="switch">
                    <span className="slider round"></span>
                </div>

                <div className="right">
                    Series
                </div>
            </label>
            <form onSubmit={handleSubmitClick} className='loginitems'>
                <span style={{ textAlign: 'center' }}>
                    Search for a {checkboxState}<br />
                    {errorState}
                </span>
                <div>
                    Search
                    <input
                        id='search-box'
                        className='loginitem'
                        type="text"
                        value={searchState}
                        onChange={(e) => setSearchState(e.target.value)}
                        placeholder="Search"
                    />
                </div>
                {showSeasonAndEpisode &&
                    <div>
                        Season #:
                        <input
                            id='season-box'
                            className='loginitem'
                            type="number"
                            value={seasonState}
                            onChange={(e) => setSeasonState(e.target.value)}
                            placeholder="(optional)"
                        /></div>}

                {showSeasonAndEpisode &&
                    <div>
                        Episode #:
                        <input
                            id='episode-box'
                            className='loginitem'
                            type="number"
                            value={episodeState}
                            onChange={(e) => setEpisodeState(e.target.value)}
                            placeholder="(optional)"
                        />
                    </div>}
                <button className='loginbutton' id='search-button' type="submit">Search</button>
            </form>
            <SearchResults
                searchResultsList={searchResults}
                contentTypeMovies={contentTypeMovies}
                contentTypeSeries={contentTypeSeries}
                contentTypeSeason={contentTypeSeason}
                contentTypeEpisode={contentTypeEpisode}
                contentType={contentType}
                episodesList={episodesList}
            />
        </div>
    )

}

export default SearchBox;