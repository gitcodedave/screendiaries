import { useState, useEffect } from "react";
import { getToken, register } from "../api/api";
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from "react-router-dom";


const RegisterBox = () => {
    const [emailState, setEmailState] = useState('');
    const [usernameState, setUsernameState] = useState('');
    const [passwordState, setPasswordState] = useState('');
    const [errorState, setErrorState] = useState('');
    const [redirectToProfile, setRedirectToProfile] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate()


    const handleSubmitClick = async (event) => {
        event.preventDefault();
        setErrorState('')

        const credentials = {
            email: emailState,
            username: usernameState,
            password: passwordState
        };

        const successfulRegister = await register(credentials);
        if (successfulRegister.response) {
            const errorType = successfulRegister.response.data
            if (errorType.email) {
                setErrorState(`(${errorType.email[0]})`)
                return;
            } else if (errorType.username) {
                setErrorState(`(${errorType.username[0]})`)
                return;
            } else if (errorType.password) {
                setErrorState(`(${errorType.password[0]})`)
                return;
            }
        }
        const loginCredentials = {
            username: usernameState,
            password: passwordState
        }
        const token = await getToken(loginCredentials);
        const accessToken = token.access
        const refreshToken = token.refresh
        const profileID = token.profileID
        login(credentials.username, accessToken, refreshToken, profileID);
        setRedirectToProfile(true);
    };


    useEffect(() => {
        if (redirectToProfile) {
            navigate('/profile');
        }
    }, [redirectToProfile, navigate]);

    return (
        <div id='Register-Form' className='loginbox'>
            <form onSubmit={handleSubmitClick} className='loginitems'>
                <span style={{ textAlign: 'center' }}>
                    Register <br />
                </span>
                <span style={{ textAlign: 'center', color: 'grey', paddingTop: '1px' }}>
                    {errorState}
                </span>
                <input
                    id='email-box'
                    className='loginitem'
                    type="text"
                    value={emailState}
                    onChange={(e) => setEmailState(e.target.value)}
                    placeholder="Email"
                />
                <input
                    id='username-box'
                    className='loginitem'
                    type="text"
                    value={usernameState}
                    onChange={(e) => setUsernameState(e.target.value)}
                    placeholder="Username"
                />
                <input
                    id='password-box'
                    className='loginitem'
                    type="password"
                    value={passwordState}
                    onChange={(e) => setPasswordState(e.target.value)}
                    placeholder="Password"
                />
                <button className='loginbutton' id='submit-button' type="submit">Submit</button>
            </form>
            <br></br>
            Back to <Link to={'/login'}>Sign In</Link>
        </div>
    );
}

export default RegisterBox;