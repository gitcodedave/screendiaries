import { NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <div className='navbarContainer'>
            <NavLink to='/profile'><img alt='screendiaries-logo' src='/screendiarieslogoflat.png' style={{ height: '40px' }}></img></NavLink>
            <div className='push'>
            <NavLink style={{textDecoration: 'none'}} to='/search'><span style={{marginRight: '2px', 'color': '#ccc3bc'}}> Find Content </span></NavLink>
            <NavLink to='/search'><img alt='search-icon' src='/search-icon.png' style={{ height: '20px', marginRight: '5px' }}></img></NavLink>
            <img alt='search-icon' src='/message-icon.png' style={{ height: '20px', marginLeft: '5px', marginRight: '5px' }}></img>
            </div>
            </div>
    )
}

export default Navbar;