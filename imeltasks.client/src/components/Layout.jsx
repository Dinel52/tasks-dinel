import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const isLogged = localStorage.getItem('user');
  const { t, i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18nInstance.changeLanguage(savedLanguage);
    }
  }, [i18nInstance]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const changeLanguage = (lang) => {
    i18nInstance.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {isLogged && <Sidebar className="hidden md:block" />}
      <div className="flex-1 flex flex-col md:ml-64">
        {isLogged && (
          <header className="h-16 flex items-center px-6 border-b bg-background border-border sticky top-0 z-10">
            <div className="ml-auto flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label={t('common.changeLanguage', 'Change language')}
                  >
                    <Globe size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    {i18nInstance.language === 'en' ? '✓ English' : 'English'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('bs')}>
                    {i18nInstance.language === 'bs' ? '✓ Bosanski' : 'Bosanski'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label={t('common.toggleTheme', 'Toggle theme')}
              >
                {document.documentElement.classList.contains('dark') ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </div>
          </header>
        )}

        <main className="flex-1 p-6 bg-background text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
