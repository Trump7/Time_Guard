import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

export const isAuthenticated = () => {
    const token = Cookies.get('token');
    //console.log("Token is: " + token);
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        //console.log("Decoded token is: ", decoded);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        console.error("Error decoding token:", error);
        return false;
    }
};