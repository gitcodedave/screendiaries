import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { API } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [cookies, setCookie, removeCookie] = useCookies(['AccessToken', 'User']);
    const [user, setUser] = useState(null);

    const checkTokenValidity = useCallback(async (token) => {
        let isValid = await API.post('/auth/jwt/verify', token)
            .then(response => {
                // Handle the response data
                console.log(response.data, 'This is from checkTokenValidity, hard-coded response true');
                return true
            })
            .catch(error => {
                // Handle any errors
                console.error(error);
            });
        return isValid
    }, []);

    const fetchAuthenticatedUser = useCallback(async () => {
        const accessToken = cookies.AccessToken;
        if (accessToken) {
            const isValid = await checkTokenValidity(accessToken);
            if (isValid) {
                setUser(cookies.User);
                return;
            }
        }
        setUser(null);
    }, [cookies, checkTokenValidity]);

    useEffect(() => {
        fetchAuthenticatedUser();
    }, [fetchAuthenticatedUser]);

    const login = (userData, accessToken) => {
        setUser(userData);
        setCookie('User', userData, { path: '/' });
        setCookie('AccessToken', accessToken, { path: '/' });
    };

    const logout = () => {
        setUser(null);
        removeCookie('User', { path: '/' });
        removeCookie('AccessToken', { path: '/' });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
