import { useState } from "react";

const SearchBox = () => {
    const [checkboxState, setCheckboxState] = useState('movie')
    const [searchState, setSearchState] = useState('search')
    const [seasonState, setSeasonState] = useState('season')
    const [episodeState, setEpisodeState] = useState('episode')

    const handleTypeSelectClick = (e) => {
        if (checkboxState === 'movie') {
            setCheckboxState('series')
        } else {
            setCheckboxState('movie')
        }
    }

    const handleSubmitClick = async (e) => {
        e.preventDefault()
        return;
    }


    return (
        <div>
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
                </span>
                <span style={{ textAlign: 'center', color: 'grey', paddingTop: '1px' }}>
                </span>
                <input
                    id='search-box'
                    className='loginitem'
                    type="text"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    placeholder="Search"
                />
                <input
                    id='season-box'
                    className='loginitem'
                    type="text"
                    value={seasonState}
                    onChange={(e) => setSeasonState(e.target.value)}
                    placeholder="Season"
                />
                <input
                    id='episode-box'
                    className='loginitem'
                    type="text"
                    value={episodeState}
                    onChange={(e) => setEpisodeState(e.target.value)}
                    placeholder="Episode"
                />
                <button className='loginbutton' id='submit-button' type="submit">Login</button>
            </form>
        </div>
    )

}

export default SearchBox;