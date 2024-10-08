import { useState } from "react";
import { API } from "../api/api";
import { useCookies } from "react-cookie";
import SearchResults from "./searchresults";

const SearchBox = () => {
    const [checkboxState, setCheckboxState] = useState('movie')
    const [searchState, setSearchState] = useState('')
    const [seasonState, setSeasonState] = useState('')
    const [episodeState, setEpisodeState] = useState('')
    const [showSeasonAndEpisode, setShowSeasonAndEpisodeState] = useState(false)
    const [errorState, setErrorState] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [contentTypeMovies, setContentTypeMovies] = useState(false)
    const [contentTypeSeries, setContentTypeSeries] = useState(false)
    const [contentTypeSeason, setContentTypeSeason] = useState(false)
    const [episodesList, setEpisodesList] = useState([])
    const [contentTypeEpisode, setContentTypeEpisode] = useState(false)
    const [contentType, setContentType] = useState(false)
    const [showLoading, setShowLoading] = useState(false)


    const [cookies] = useCookies('AccessToken')
    const handleTypeSelectClick = (e) => {
        setShowLoading(false)
        if (checkboxState === 'movie') {
            setCheckboxState('series')
            setShowSeasonAndEpisodeState(true)
        } else {
            setCheckboxState('movie')
            setShowSeasonAndEpisodeState(false)
        }
    }

    const handleSubmitClick = async (e) => {
        setShowLoading(true)
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
                    search.t = searchState
                    search.episode = episodeState
                } else {
                    setContentTypeSeason(true)
                    setContentType('Season')
                    search.s = searchState
                }
            } else {
                setContentTypeSeries(true)
                setContentType('Series')
                search.s = searchState
            }
        } else {
            setContentTypeMovies(true)
            setContentType('Movie')
            search.s = searchState
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
            let data = searchResponse.data
            if (data.Response === 'False') {
                setErrorState(`(${data.Error})`)
                console.log('error')
                setShowLoading(false)
                return;
            }
            if ('Episodes' in data) {
                setEpisodesList(data.Episodes)
                setErrorState('')
                setShowLoading(false)
                return;
            }
            setErrorState('')
            if ('Title' in data) {
                data = [data]
                const prunedData = data.filter(val => val.Poster !== 'N/A');
                setSearchResults(prunedData)
            } else {
                const searchData = data.Search
                const prunedData = searchData.filter(val => val.Poster !== 'N/A');
                setSearchResults(prunedData)
            }
            setShowLoading(false)
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
            <form onSubmit={handleSubmitClick} className='searchitems'>
                <span style={{ textAlign: 'center' }}>
                    Search for a {checkboxState}<br />
                    {errorState}
                </span>
                <div>
                    Search
                    <input
                        id='search-box'
                        className='searchitem'
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
                            className='searchitemnumber'
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
                            className='searchitemnumber'
                            type="number"
                            value={episodeState}
                            onChange={(e) => setEpisodeState(e.target.value)}
                            placeholder="(optional)"
                        />
                    </div>}
                <button className='loginbutton' id='search-button' type="submit">Search</button>
            </form>
            {showLoading && (
                <div style={{ marginTop: '5px', marginBottom: '5px' }}>
                    Searching...
                </div>
            )}
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