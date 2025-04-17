import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { HelpCircle, Eye, EyeOff } from 'lucide-react';

function RegisterForm({ darkMode }) {
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  async function registerHandler(e) {
    e.preventDefault();
    const form = e.target;

    const formData = new FormData(form);
    const dataToSend = {};

    for (const [key, value] of formData) {
      dataToSend[key] = value;
    }

    const newUserName = dataToSend.Name.trim().split(' ');
    dataToSend.UserName = newUserName.join('');

    try {
      const response = await fetch('api/imel/register', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(dataToSend),
        headers: {
          'content-type': 'Application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        document.location = '/login';
      } else {
        if (data.message) {
          setMessage(data.message);
        } else if (data.errors) {
          const errorMessages = data.errors.map(error => error.description).join(' ');
          setMessage(errorMessages);
        } else {
          setMessage(t('register.errors.generic', 'Something went wrong, please try again'));
        }
        console.log('register error: ', data);
      }
    } catch (error) {
      setMessage(t('register.errors.connection', 'Connection error. Please try again later.'));
      console.error('Registration failed:', error);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className={`w-full max-w-md ${darkMode ? 'bg-background text-white border-gray-700' : 'bg-white'}`}>
      <CardHeader className="space-y-1 relative">
        <CardTitle className="text-2xl font-bold text-center">{t('register.title', 'Create an account')}</CardTitle>
        <CardDescription className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          {t('register.subtitle', 'Enter your information to create an account')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={registerHandler} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={darkMode ? 'text-gray-200' : ''}>{t('register.fullName')}</Label>
            <Input
              id="name"
              name="Name"
              placeholder={t('register.fullNamePlaceholder')}
              required
              className={darkMode ? 'bg-background border-gray-600 text-white placeholder:text-gray-400' : ''}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="email" className={darkMode ? 'text-gray-200' : ''}>{t('register.email', 'Email')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-sm">
                  {t('register.emailHelp')}
                </PopoverContent>
              </Popover>
            </div>
            <Input
              id="email"
              name="Email"
              type="email"
              placeholder={t('register.emailPlaceholder')}
              required
              className={darkMode ? 'bg-background border-gray-600 text-white placeholder:text-gray-400' : ''}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="password" className={darkMode ? 'text-gray-200' : ''}>{t('register.password', 'Password')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 text-sm">
                  {t('register.passwordHelp')}
                </PopoverContent>
              </Popover>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="PasswordHash"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('register.passwordPlaceholder')}
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
          <Button type="submit" className="w-full">
            {t('register.registerButton', 'Register')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('register.haveAccount', 'Already have an account?')}{' '}
          <a href="/login" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-medium`}>
            {t('register.login', 'Login')}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

export default RegisterForm;
