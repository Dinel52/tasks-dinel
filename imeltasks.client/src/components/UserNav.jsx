import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarIcon, AtSignIcon, UserIcon, ShieldIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function UserNav({ darkMode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const getInitials = () => {
    if (userData.name) {
      return userData.name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return userData.username ? userData.username[0].toUpperCase() : 'U';
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/imel/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        alert(data.message);
        navigate('/login');
      } else {
        console.error('Could not logout:', response);
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.avatarPath || '/avatars/default.png'} alt={userData.username} />
              <AvatarFallback className={darkMode ? 'bg-gray-700' : 'bg-gray-400'}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`w-56 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`} align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userData.name || userData.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={handleProfileClick}
              className={darkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : ''}
            >
              {t('userNav.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className={darkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : ''}
            >
              {t('userNav.settings')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            {t('userNav.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogContent className={`sm:max-w-md p-0 ${darkMode ? 'bg-gray-800 text-white border-gray-700' : ''}`}>
          <Card className={`w-full shadow-none ${darkMode ? 'bg-gray-700 border-gray-600' : ''}`}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userData.avatarPath || '/avatars/default.png'} alt={userData.username} />
                <AvatarFallback className={`text-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-500'}`}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className={darkMode ? 'text-white' : ''}>
                  {userData.name || userData.username}
                </CardTitle>
                <CardDescription className={darkMode ? 'text-gray-300' : ''}>
                  {userData.isAdmin ? t('userNav.administrator') : t('userNav.standardUser')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon size={18} className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className="font-medium mr-2">{t('userNav.username')}</span>
                  <span>{userData.username}</span>
                </div>

                <div className="flex items-center">
                  <AtSignIcon size={18} className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className="font-medium mr-2">{t('userNav.email')}</span>
                  <span>{userData.email}</span>
                </div>

                {userData.lastLogin && (
                  <div className="flex items-center">
                    <CalendarIcon size={18} className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                    <span className="font-medium mr-2">{t('userNav.lastLogin')}</span>
                    <span>{new Date(userData.lastLogin).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <ShieldIcon size={18} className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className="font-medium mr-2">{t('userNav.accountType')}</span>
                  <span>{userData.isAdmin ? t('userNav.administrator') : t('userNav.standardUser')}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => navigate('/settings')} variant="default" className="mr-2">
                  {t('userNav.editProfile')}
                </Button>
                <Button onClick={() => setProfileDialogOpen(false)}>
                  {t('userNav.close')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserNav;
