import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users, BarChart, Settings, MessageSquare, HelpCircle, Clipboard,
  Calendar, AlertCircle, AtSignIcon, UserIcon, ShieldIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.isAdmin;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  // eslint-disable-next-line
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.theme = newMode ? 'dark' : 'light';
  };
  // eslint-disable-next-line
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

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

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
  };

  const handleNavigation = (path, requiredAdmin = false, featureName = '') => {
    if (requiredAdmin && !isAdmin) {
      setDialogTitle(featureName);
      setShowDialog(true);
      return false;
    }
    return true;
  };

  const features = [
    {
      title: t('features.userManagement.title'),
      description: t('features.userManagement.description'),
      icon: <Users className="w-6 h-6" />,
      link: '/admin/users',
      requiresAdmin: true,
    },
    {
      title: t('features.reports.title'),
      description: t('features.reports.description'),
      icon: <BarChart className="w-6 h-6" />,
      link: '/admin/reports',
      requiresAdmin: true,
    },
    {
      title: t('features.userProfile.title'),
      description: t('features.userProfile.description'),
      icon: <Settings className="w-6 h-6" />,
      link: '/profile',
      requiresAdmin: false,
      onClick: handleProfileClick,
    },
    {
      title: t('features.activityHistory.title'),
      description: t('features.activityHistory.description'),
      icon: <Clipboard className="w-6 h-6" />,
      link: '',
      requiresAdmin: false,
    },
  ];

  const stats = [
    { label: t('dashboard.stats.activeUsers'), value: '10' },
    { label: t('dashboard.stats.totalReports'), value: '10' },
    { label: t('dashboard.stats.thisMonth'), value: '+12%' },
    { label: t('dashboard.stats.success'), value: '98.5%' },
  ];

  const activities = [
    {
      title: t('activities.newUser'),
      time: t('activities.timeAgo.hours', { count: 2 }),
      icon: <Users className="w-4 h-4" />,
      color: 'blue',
    },
    {
      title: t('activities.reportGenerated'),
      time: t('activities.timeAgo.hours', { count: 6 }),
      icon: <BarChart className="w-4 h-4" />,
      color: 'green',
    },
    {
      title: t('activities.maintenanceScheduled'),
      time: t('activities.timeAgo.tomorrow', { time: '03:00' }),
      icon: <Calendar className="w-4 h-4" />,
      color: 'purple',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {t('accessDenied.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('accessDenied.message', { title: dialogTitle.toLowerCase() })}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}> {t('userNav.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogContent className={`sm:max-w-md p-0 ${darkMode ? 'bg-background text-theme-text border-gray-700' : ''}`}>
          <Card className={`w-full shadow-none ${darkMode ? 'bg-background border-gray-600' : ''}`}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData.avatarPath || '/avatars/default.png'} alt={userData.username} />
                <AvatarFallback className={darkMode ? 'bg-gray-700' : 'bg-gray-400'}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className='text-theme-text'>
                  {userData.name || userData.username}
                </CardTitle>
                <CardDescription className='text-theme-text'>
                  {userData.isAdmin ? 'Administrator' : 'Standard User'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon size={18} className='text-theme-text mr-2' />
                  <span className="font-medium mr-2">{t('userNav.username')}</span>
                  <span>{userData.username}</span>
                </div>

                <div className="flex items-center">
                  <AtSignIcon size={18} className='text-theme-text mr-2' />
                  <span className="font-medium mr-2">{t('userNav.email')}</span>
                  <span>{userData.email}</span>
                </div>

                {userData.lastLogin && (
                  <div className="flex items-center">
                    <CalendarIcon size={18} className='text-theme-text mr-2'/>
                    <span className="font-medium mr-2">{t('userNav.lastLogin')}</span>
                    <span>{new Date(userData.lastLogin).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <ShieldIcon size={18} className='text-theme-text mr-2' />
                  <span className="font-medium mr-2">{t('userNav.accountType')}</span>
                  <span>{userData.isAdmin ? 'Administrator' : 'Standard User'}</span>
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

      <Card className="mb-8 bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">{t('dashboard.welcome')}</CardTitle>
          <CardDescription className="text-primary-foreground/90 text-lg">
            {t('dashboard.welcomeDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            {t('dashboard.systemOverview')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="default"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => {
                if (handleNavigation('/admin/users', true, 'upravljanju korisnicima')) {
                  window.location.href = '/admin/users';
                }
              }}
            >
              {t('dashboard.users')}
            </Button>
            <Button
              variant="default"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => {
                if (handleNavigation('/admin/reports', true, 'izvještajima')) {
                  window.location.href = '/admin/reports';
                }
              }}
            >
              {t('dashboard.reports')}
            </Button>
            <Button
              variant="secondary"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              onClick={handleProfileClick}
            >
              {t('features.userProfile.title')}
            </Button>
            <Button
              asChild
              variant="secondary"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/settings">{t('dashboard.settings')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="activities">{t('tabs.activities')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <h2 className="text-2xl font-bold mb-6">{t('dashboard.quickAccess')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <div
                  className="block cursor-pointer"
                  onClick={() => {
                    if (feature.onClick) {
                      feature.onClick();
                    } else if (handleNavigation(feature.link, feature.requiresAdmin, feature.title)) {
                      if (feature.link) {
                        window.location.href = feature.link;
                      }
                    }
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentActivities')}</CardTitle>
              <CardDescription>
                {t('dashboard.recentActivities')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`p-2 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/30`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    {index === 0 && <Badge>Novo</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (handleNavigation('/admin/users/history', true, 'pregledu povijesti aktivnosti')) {
                    window.location.href = '/admin/users/history';
                  }
                }}
              >
                {t('dashboard.viewAllActivities')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="mb-8">
        <HelpCircle className="w-4 h-4" />
        <AlertTitle>{t('support.needHelp')}</AlertTitle>
        <AlertDescription>
          {t('support.helpDescription')}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('support.title')}</CardTitle>
          <CardDescription>{t('support.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>support@vasadomena.com</span>
          </div>
          <Separator />
          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> {t('support.contactSupport')}
            </Button>
            <Button variant="ghost">{t('support.viewDocumentation')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
