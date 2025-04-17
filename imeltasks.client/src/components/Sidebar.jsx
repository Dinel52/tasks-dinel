import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  LayoutDashboard,
  Settings,
  FileText,
  Menu,
  X,
  AlertCircle,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import UserNav from './UserNav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ className }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const isAdmin = userData.isAdmin;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleNavigation = (href, requiresAdmin) => {
    setIsOpen(false);
    if (requiresAdmin && !isAdmin) {
      setShowDialog(true);
    } else {
      navigate(href);
    }
  };

  const navigationItems = [
    {
      title: t('sidebar.home'),
      href: '/home',
      icon: Home,
      active: location.pathname === '/home',
      requiresAdmin: false,
    },
    {
      title: t('features.userManagement.title'),
      href: '/admin/users',
      icon: Users,
      active: location.pathname === '/admin/users',
      requiresAdmin: true,
    },
    {
      title: t('features.reports.title'),
      href: '/admin/reports',
      icon: FileText,
      active: location.pathname === '/admin/reports',
      requiresAdmin: true,
    },
    {
      title: t('sidebar.settings'),
      href: '/settings',
      icon: Settings,
      active: location.pathname === '/settings',
      requiresAdmin: false,
    },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40 bg-background border-border text-foreground"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {t('sidebar.accessDenied')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('sidebar.accessDeniedMessage')}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>{t('common.cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          'fixed top-0 left-0 z-30 h-full w-64 border-r bg-background text-foreground border-border transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className,
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold">{t('sidebar.title')}</h2>
          </div>

          <div className="flex-1 px-3">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div
                  key={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                    item.active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  onClick={() => handleNavigation(item.href, item.requiresAdmin)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 mt-auto border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserNav />
                <div className="ml-3">
                  <p className="text-sm font-medium">{userData.name || userData.username}</p>
                  <p className="text-xs text-muted-foreground">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs text-muted-foreground">{t('sidebar.copyright')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
