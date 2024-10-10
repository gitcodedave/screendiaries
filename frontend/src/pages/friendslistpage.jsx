import FriendsListBox from "../components/friendslistbox";
import Navbar from "../components/navbar";
import { Link } from "react-router-dom";

const FriendsListPage = () => {
    return (
        <div>
            <Navbar />
            <Link style={{marginLeft: '10px'}} to={'/profile'}>Back</Link>
            <FriendsListBox />
        </div>
    )
}

export default FriendsListPage;