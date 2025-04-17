import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    document.title = t('login.pageTitle', 'Login');
  }, [t]);

  useEffect(() => {

    const user = localStorage.getItem('user');
    if (user) {
      document.location = '/home';
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18nInstance.changeLanguage(savedLanguage);
    }
  }, [i18nInstance]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeLanguage = (lang) => {
    i18nInstance.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const onLoginSuccess = () => {
    document.location = '/home';
  };

  return (
    <div className={`flex justify-center items-center min-h-screen ${darkMode ? 'bg-background' : ''} transition-colors duration-300`}>
      <LoginForm
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        onLoginSuccess={onLoginSuccess}
      />

      <div className="absolute right-4 top-4 flex gap-2">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-200'
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
              aria-label={t('common.changeLanguage', 'Change language')}
            >
              <Globe size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}>
            <DropdownMenuItem
              onClick={() => changeLanguage('en')}
              className={darkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : ''}
            >
              {i18nInstance.language === 'en' ? '✓ English' : 'English'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeLanguage('bs')}
              className={darkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : ''}
            >
              {i18nInstance.language === 'bs' ? '✓ Bosanski' : 'Bosanski'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="icon"
          className={`rounded-full ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-200'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          aria-label={t('common.toggleTheme', 'Toggle theme')}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>
    </div>
  );
}

export default LoginPage;
