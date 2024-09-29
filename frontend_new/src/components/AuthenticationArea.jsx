import React, { useContext, useEffect, useState } from 'react';
import ApiKeyManager from './ApiKeyManager';
import { AppContext } from '../context/AppContextProvider';
import LoginModal from './Login';
import RegisterModal from './Register';
import './AuthenticationArea.css'

const AuthenticationArea = ({}) => {
    const { currentUser, handleLogin, handleLogout } = useContext(AppContext);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    
    return (
        <div className="authentication-area">
            <div className="authentication-separator"></div> {/* Separator */}
            <ApiKeyManager/>

            <nav className="nav">
                {currentUser && currentUser.is_registered ? (
                <div className="user-info">
                    <span>Welcome, {currentUser.username}!</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
                ) : (
                <div className="auth-buttons">
                    <button onClick={() => setIsLoginOpen(true)}>Login</button>
                    <button onClick={() => setIsRegisterOpen(true)}>Register</button>
                </div>
                )}
            </nav>

        {/* Login Modal */}
        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} handleLogin={handleLogin} />}

        {/* Register Modal */}
        {isRegisterOpen && <RegisterModal onClose={() => setIsRegisterOpen(false)} handleLogin={handleLogin} />}

        </div>
    );
};

export default AuthenticationArea;
