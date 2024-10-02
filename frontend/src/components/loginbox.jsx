import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { getToken } from '../api/api';
import { useAuth } from '../context/AuthContext';

const LoginBox = () => {
    const [usernameState, setUsernameState] = useState('');
    const [passwordState, setPasswordState] = useState('');
    const [errorState, setErrorState] = useState('');
    const [redirectToProfile, setRedirectToProfile] = useState(false);
    const { login } = useAuth();

    const handleSubmitClick = async (event) => {
        event.preventDefault();

        const credentials = {
            username: usernameState,
            password: passwordState
        };

        const token = await getToken(credentials);

        if (token) {
            const accessToken = token.access
            const refreshToken = token.refresh
            login(credentials.username, accessToken, refreshToken);
            setRedirectToProfile(true);
        } else {
            let allForms = document.querySelectorAll('input');
            allForms.forEach(eachInput => eachInput.value = '');
            setErrorState('Invalid username or password')
        }
    };

    if (redirectToProfile) {
        return <Navigate to='/profile' />;
    }

    return (
        <div id='Login-Form' className='loginbox'>
            <form onSubmit={handleSubmitClick} className='loginitems'>
                <span style={{textAlign: 'center'}}>
                    Sign in <br />
                </span>
                    <span style={{textAlign: 'center', color: 'grey', paddingTop: '1px'}}>
                    {errorState}
                    </span>
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
                <button className='loginbutton' id='submit-button' type="submit">Login</button>
            </form>
            <br></br>
            New to screendiaries? <Link to={'/register'}>Register</Link>
        </div>
    );
};

export default LoginBox;