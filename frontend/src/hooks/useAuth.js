import { useState, createContext, useContext } from 'react';
import * as userService from '../Services/userService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(userService.getUser());

    const login = async (email, password) => {
        try {
            const user = await userService.login(email, password);
            setUser(user);
            toast.success('Login Successful');
            console.log("user login in useAuth: ",user)
            // Small delay to ensure localStorage is updated by userService
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Dispatch login event for cart synchronization
            window.dispatchEvent(new CustomEvent('userLogin', { 
                detail: { user } 
            }));
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user } 
            }));
            
        } catch (err) {
            toast.error(err.response.data);
        }
    };

    const register = async data => {
        try {
            const user = await userService.register(data);
            setUser(user);
            toast.success('Register Successful');
            
            // Small delay to ensure localStorage is updated by userService
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Dispatch login event for cart synchronization (registration = auto-login)
            window.dispatchEvent(new CustomEvent('userLogin', { 
                detail: { user } 
            }));
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user } 
            }));
            
        } catch (err) {
            toast.error(err.response.data);
        }
    };

    const logout = () => {
        userService.logout();
        setUser(null);
        toast.success('Logout Successful');
        
        // Dispatch logout event for cart synchronization
        window.dispatchEvent(new CustomEvent('userLogout'));
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);