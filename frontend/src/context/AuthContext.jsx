import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useCookies } from 'react-cookie';
import { API } from '../api/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [cookies, setCookie, removeCookie] = useCookies(['AccessToken', 'User']);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkTokenValidity = useCallback(async (token) => {
        const tokenObject = {
            "token": token
        }
        try {
            let isValid = await API.post('/auth/jwt/verify', tokenObject)
            if (isValid.data.code) {
                return false
            }
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }, []);

    const isTokenExpired = (token) => {
        if (!token) return true;
        const decodedToken = jwtDecode(token);
        const expiryTime = decodedToken.exp * 1000;
        return Date.now() > expiryTime;
    };

    const logout = useCallback(() => {
        setUser(null);
        removeCookie('User', { path: '/' });
        removeCookie('AccessToken', { path: '/' });
        removeCookie('RefreshToken', { path: '/' });
        removeCookie('profileID', { path: '/' });
        removeCookie('profile_picture', { path: '/' });
      }, [removeCookie]);

    const refreshToken = useCallback(async () => {
        const refreshToken = cookies.RefreshToken;
        if (refreshToken && !isTokenExpired(refreshToken)) {
            try {
                const response = await API.post('/auth/jwt/refresh/', { refresh: refreshToken });
                const newAccessToken = response.data.access;
                setCookie('AccessToken', newAccessToken, { path: '/' });
                return newAccessToken;
            } catch (error) {
                console.error('Error refreshing token:', error);
                logout();
                return null;
            }
        } else {
            logout();
            return null;
        }
    }, [cookies.RefreshToken, setCookie, logout]);

    const fetchAuthenticatedUser = useCallback(async () => {
        try {
            const accessToken = cookies.AccessToken;
            if (accessToken && !isTokenExpired(accessToken)) {
                const isValid = await checkTokenValidity(accessToken);
                if (isValid) {
                    setUser(cookies.User);
                } else {
                    const newAccessToken = await refreshToken();
                    if (newAccessToken) {
                        setUser(cookies.User);
                    } else {
                        setUser(null);
                    }
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching authenticated user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [cookies, checkTokenValidity, refreshToken]);

    useEffect(() => {
        fetchAuthenticatedUser();
    }, [fetchAuthenticatedUser]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            await refreshToken();
        }, 24 * 60 * 10 * 1000); // Refresh token every 24 hours
        return () => clearInterval(intervalId);
    }, [refreshToken]);

    const login = (userData, accessToken, refreshToken, profileID, profile_picture) => {
        setUser(userData);
        setCookie('profile_picture', profile_picture, {path: '/'})
        setCookie('profileID', profileID, {path: '/'})
        setCookie('User', userData, { path: '/' });
        setCookie('AccessToken', accessToken, { path: '/' });
        setCookie('RefreshToken', refreshToken, { path: '/' });
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
