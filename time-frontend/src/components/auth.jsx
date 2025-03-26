import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

export const isAuthenticated = () => {
    const token = Cookies.get('token');
    //console.log("Token is: " + token);
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        //Checks if the token has expired
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        console.error("Error decoding token:", error);
        return false;
    }
};

export const getUserName = () => {
    const userName = Cookies.get('userName');
    console.log(userName);
    return userName || null;
};

export const isAdmin = () => {
    return isAuthenticated() && getUserName() === "Admin";
};

export const isUser = () => {
    return isAuthenticated() && getUserName() !== "Admin";
};