import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

function LoginForm({ darkMode }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  async function loginHandler(e) {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target;

    const formData = new FormData(form);
    const dataToSend = {};

    for (const [key, value] of formData) {
      dataToSend[key] = value;
    }

    if (dataToSend.Remember === 'on') {
      dataToSend.Remember = true;
    }

    console.log('login data before send: ', dataToSend);
    try {
      const response = await fetch('api/imel/login', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        if (!data.token) {
          setMessage('Server did not return a token. Please try again.');
          console.error('No token in response:', data);
          return;
        }

        console.log('Storing token:', data.token);
        localStorage.setItem('token', data.token);

        localStorage.setItem('user', dataToSend.Email);

        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }

        document.location = '/home';
      } else {
        if (data.message) {
          setMessage(data.message);
        } else {
          setMessage(t('login.errors.generic', 'Something went wrong, please try again'));
        }
        console.log('login error: ', data);
      }
    } catch (error) {
      setMessage(t('login.errors.connection', 'Connection error. Please try again later.'));
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className={`w-full max-w-md ${darkMode ? 'bg-background' : ''}`}>
      <CardHeader className="space-y-1 relative">
        <CardTitle className="text-2xl font-bold text-center">{t('login.title', 'Login')}</CardTitle>
        <CardDescription className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          {t('login.subtitle', 'Enter your credentials to sign in to your account')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={loginHandler} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className={darkMode ? 'text-gray-200' : ''}>{t('login.email')} </Label>
            <Input
              id="email"
              name="Email"
              type="email"
              placeholder={t('login.emailPlaceholder')}
              required
              className={darkMode ? 'bg-background border-gray-600 text-white placeholder:text-gray-400' : ''}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className={darkMode ? 'text-gray-200' : ''}>{t('login.password')}</Label>
              <a href="" className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                {t('login.forgotPassword', 'Forgot password?')}
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder')}
                required
                className={`pr-10 ${darkMode ? 'bg-background border-gray-600 text-white' : ''}`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" name="Remember" className={darkMode ? 'border-gray-500' : ''} />
            <Label
              htmlFor="remember"
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${darkMode ? 'text-gray-200' : ''}`}
            >
              {t('login.rememberMe', 'Remember me')}
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {t('login.loginButton', 'Login')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('login.noAccount', 'Don\'t have an account?')}{' '}
          <a href="/register" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium`}>
            {t('login.register', 'Register')}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

export default LoginForm;
