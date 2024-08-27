import React, {useState} from 'react';
import ApiKeyInputComponent from './APIKeyInputComponent';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm'; 

function UserContainer() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');

    const handleApiKeyChange = (key) => {
        setApiKey(key);
        // Here you can also validate the API key if needed
        if (key) {
          console.log('API key entered:', key);
        }
      };

    const handleLogin = async (username, password) => {
        // Simulate an API request (replace with actual API call)
        try {
        // Simulate a delay for the API call
        const response = await apiLogin(username, password);

        if (response.success) {
            setIsLoggedIn(true);
            setErrorMessage('');
            // set the api key
            setApiKey(response.api_key);
        } else {
            setIsLoggedIn(false);
            setErrorMessage(response.message);
        }
        } catch (error) {
        setErrorMessage('An error occurred during login.');
        setIsLoggedIn(false);
        }

    };

const apiLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.success) {
        return { success: true, api_key : data.api_key };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const handleRegister = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Registration successful!');
          setIsRegisterOpen(false); // Close the register form after success
        } else {
          alert(data.message || 'Registration failed.');
        }
      } else {
        alert('Network response was not ok.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred during registration.');
    }
  };

  const toggleRegisterForm = () => {
    setIsRegisterOpen(!isRegisterOpen);
  };

  return (
    <div className="user_container">
      <h2>Enter your OpenAI API Key</h2>
      <ApiKeyInputComponent
              onApiKeyChange={handleApiKeyChange} 
              initialApiKey={isLoggedIn ? apiKey : ''}
              />
      <h2>Or login/register to save the key</h2>
      {isLoggedIn ? (
        <div>
          <h1>Welcome !</h1>
        </div>
      ) : (
        <div>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <LoginForm onLogin={handleLogin} />
        </div>
      )}
        <button onClick={toggleRegisterForm}>Register</button>
      {isRegisterOpen && (
        <RegisterForm onRegister={handleRegister} onClose={toggleRegisterForm} />
      )}
    </div>
  );
}

export default UserContainer;
