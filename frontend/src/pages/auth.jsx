import { getToken } from "../api/api";


const Auth = () => {
    let usernameState = '';
    let passwordState = '';

    const handleUsernameChange = function (event) {
        usernameState = event.target.value;
    }

    const handlePasswordChange = function (event) {
        passwordState = event.target.value;
    }

    const handleSubmitClick = function (event) {
        const credentials = {
            username: usernameState,
            password: passwordState
        }
        getToken(credentials)
        let allForms = document.querySelectorAll('input');
        allForms.forEach(eachInput => eachInput.value = '');
    }

    return (
        <>
            <div className="Auth">
                <input size="20" placeholder="username" onChange={handleUsernameChange} ></input>
                <input size="20" placeholder="password" onChange={handlePasswordChange} ></input>
                <button className="submitButton" onClick={handleSubmitClick}>Submit</button>
            </div>
        </>
    );
}

export default Auth;