import Navbar from "../components/navbar";

const NotFoundPage = () => {
    return (
        <div style={{textAlign:'center', paddingTop:'100px', fontSize:'20px', fontFamily: 'Playfair display'}}>
            <Navbar/>
            Whoops! <br></br>
            This page does not exist.
        </div>
    )
}

export default NotFoundPage;