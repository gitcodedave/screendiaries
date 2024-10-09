import Navbar from "../components/navbar";
import WatchListBox from "../components/watchlistbox";
import { Link } from "react-router-dom";
const WatchListPage = () => {
    return (
        <div>
            <Navbar />
            <Link style={{marginLeft: '10px'}} to={'/profile'}>Back</Link>
            <WatchListBox />
        </div>
    )
}

export default WatchListPage;