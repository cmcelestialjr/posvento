import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { LogInIcon } from 'lucide-react';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false });
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (token) {
      if(userRole=="2"){
        navigate('/pos');
      }else{
        navigate('/dashboard');
      }      
    }
  }, [navigate]);

  useEffect(() => {
    handleCheckUser();
  },[]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (e.target.value) setErrors((prev) => ({ ...prev, username: false }));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value) setErrors((prev) => ({ ...prev, password: false }));
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate the inputs
    const newErrors = {
      username: username.trim() === '',
      password: password.trim() === '',
    };

    setErrors(newErrors);
    
    if (!newErrors.username && !newErrors.password) {
      setLoading(true);
        try {
          
          const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

          const response = 
            await axios.post('/api/login', {
                username,
                password,
              },
              {
                headers: {
                  'X-CSRF-TOKEN': csrfToken,
                },
              }
            );

            if(response.data.message=="success"){
              localStorage.removeItem("token");
              localStorage.removeItem("userRole");
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('userRole', response.data.userRole);
              toastr.success('Login successful!');
              if(response.data.userRole===2){
                navigate('/pos', { replace: true });
              }else{
                navigate('/dashboard', { replace: true });
              }
              
            }else{
              toastr.error(response.data.message);
            }
      
            
        } catch (error) {
          toastr.error('An unexpected error occurred. Please try again later.');
        } finally {
          setLoading(false);
        }
    }else{
      toastr.warning('Please fill in both fields.');
    }
  };

  const handleCheckUser = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
      const response = 
        await axios.post('/api/check/user',
          {
            headers: {
              'X-CSRF-TOKEN': csrfToken,
            },
          }
        );

      setLoadingPage(false);
      if(response.data.result=="success"){
        setMessage('');
      }else{
        setMessage(response.data.message);
      }
    } catch (error) {
      setLoadingPage(false);
      setMessage('Please try to reinstall the app.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8 mt-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <img src="/images/clstldev2.png" alt="Logo 1" className="w-24 sm:w-32" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900">Welcome to PosVento</h2>
          <p className="text-sm text-blue-700">Smart & simple POS for your business</p>
        </div>

        {loadingPage && (
          <div className="space-y-4 mb-6">
            <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-full h-12 bg-blue-200 rounded-md animate-pulse"></div>
          </div>
        )}

        {!loadingPage && message && (
          <div className="text-red-500 text-center mb-6">{message}</div>
        )}

        {!loadingPage && !message && (
          <form onSubmit={handleLogin} className="space-y-6 mb-6">
            <div className="relative">
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                  errors.username ? 'border-red-500' : 'focus:ring-2 focus:ring-blue-400'
                }`}
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                  errors.password ? 'border-red-500' : 'focus:ring-2 focus:ring-blue-400'
                }`}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
              >
                {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
              </button>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-4 border-t-4 border-white border-solid rounded-full animate-spin"></div>
                ) : (
                  <LogInIcon className="h-5 w-5" />
                )}
                <span>{loading ? 'Logging in...' : 'Login'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="absolute bottom-4 text-xs text-gray-600 text-center w-full px-2">
        © 2025 PosVento | v1.0.0<br />
        Cesar M. Celestial Jr. - 0936-649-3663
      </div>
    </div>
  );
};

export default LoginPage;
