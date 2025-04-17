import { useEffect, useState, useCallback, useRef } from 'react';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; /* eslint-disable */
import { jsPDF } from 'jspdf'; 
import 'jspdf-autotable';
import {
  DataGrid,
  Column,
  Paging,
  Pager,
  FilterRow,
  HeaderFilter,
  Editing,
  Form,
  Popup,
  Scrolling,
  Export,
} from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
import {  useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  DownloadIcon,
  HistoryIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import 'devextreme/dist/css/dx.light.css'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const searchTimeout = useRef(null);
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    isAdmin: false,
  });
  const [darkMode, setDarkMode] = useState(false);
  const dataGridRef = useRef(null);
  const { toast } = useToast();
  const { t } = useTranslation();


  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null); 


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);

    } else {
      setDarkMode(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: t('users.error'),
          description: t('users.notAuthenticated'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      if (!userData.isAdmin) {
        toast({
          title: t('users.error'),
          description: t('users.notAuthorized'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }


      let apiUrl = `/api/users?pageSize=${pageSize}&pageIndex=${pageIndex}`;


      if (searchText !== undefined) {
        apiUrl += `&search=${encodeURIComponent(searchText.trim())}`;
      }


      if (searchText.trim() === '') {

        apiUrl = `/api/users?pageSize=${pageSize}&pageIndex=${pageIndex}`;
        console.log('Search is empty, fetching all users with URL:', apiUrl);
      }


      if (statusFilter !== null) {
        apiUrl += `&isActive=${statusFilter}`;
      }

      console.log('Fetching users with URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.status === 403) {
        toast({
          title: t('users.error'),
          description: t('users.notAuthorized'),
          variant: 'destructive',
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users:', data);

        if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
          setTotalCount(data.totalCount || data.users.length);
        } else {
          const usersData = Array.isArray(data) ? data : [];
          setUsers(usersData);
          setTotalCount(usersData.length);
        }
      } else {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        toast({
          title: t('users.error'),
          description: `${t('users.fetchError')} (Status: ${response.status})`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t, pageSize, pageIndex, searchText, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleRowInserting = async (e) => {
    try {
      const token = localStorage.getItem('token');


      console.log('Data being sent to API:', {
        email: e.data.email,
        username: e.data.username,
        name: e.data.name || '',
        password: e.data.password,
        isAdmin: e.data.isAdmin || false,
      });

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: e.data.email,
          username: e.data.username,
          name: e.data.name || '',
          password: e.data.password,
          isAdmin: e.data.isAdmin || false,
        }),
      });

      if (!response.ok) {
        e.cancel = true;
        try {
          const errorText = await response.text();
          console.error('Server error response:', errorText);

          let errorMessage = t('users.unknownError');
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = Array.isArray(errorData)
              ? errorData.map(err => err.description).join(', ')
              : errorData.message || t('users.unknownError'); /* eslint-disable */
          } catch (jsonError) {
            errorMessage = errorText || t('users.unknownError');
          }

          toast({
            title: t('users.createError'),
            description: errorMessage,
            variant: 'destructive',
          });
        } catch (parseError) {
          toast({
            title: t('users.createError'),
            description: t('users.unknownError'),
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: t('users.success'),
          description: t('users.createSuccess'),
        });

        fetchUsers();
      }
    } catch (error) {
      e.cancel = true;
      toast({
        title: t('users.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRowUpdating = async (e) => {
    try {
      const token = localStorage.getItem('token');


      console.log('Updating user data:', {
        id: e.key,
        oldData: e.oldData,
        newData: e.newData,
      });

      const response = await fetch(`/api/users/${e.key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: e.newData.email !== undefined ? e.newData.email : e.oldData.email,
          username: e.newData.username !== undefined ? e.newData.username : e.oldData.username,
          name: e.newData.name !== undefined ? e.newData.name : e.oldData.name,
          password: e.newData.password || undefined,
          isAdmin: e.newData.isAdmin !== undefined ? e.newData.isAdmin : e.oldData.isAdmin,
        }),
      });

      if (!response.ok) {
        e.cancel = true;
        try {
          const errorText = await response.text();
          console.error('Server error response:', errorText);

          let errorMessage = t('users.unknownError');
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = Array.isArray(errorData)
              ? errorData.map(err => err.description).join(', ')
              : errorData.message || t('users.unknownError');
          } catch (jsonError) {
            errorMessage = errorText || t('users.unknownError');
          }

          toast({
            title: t('users.updateError'),
            description: errorMessage,
            variant: 'destructive',
          });
        } catch (parseError) {
          toast({
            title: t('users.updateError'),
            description: t('users.unknownError'),
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: t('users.success'),
          description: t('users.updateSuccess'),
        });

        fetchUsers();
      }
    } catch (error) {
      e.cancel = true;
      toast({
        title: t('users.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: t('users.success'),
          description: t('users.deleteSuccess'),
        });

        fetchUsers();
      } else {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          toast({
            title: t('users.deleteError'),
            description: errorData.message || t('users.unknownError'),
            variant: 'destructive',
          });
        } catch (parseError) {
          toast({
            title: t('users.deleteError'),
            description: errorText || t('users.unknownError'),
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: t('users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };


  const toggleUserStatus = async (userId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      console.log(`Changing user ${userId} status from active=${isActive} to active=${!isActive}`);

      setLoading(true);

      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Server response after status change:', responseData);

        toast({
          title: t('users.success'),
          description: isActive
            ? t('users.deactivateSuccess')
            : t('users.activateSuccess'),
        });


        setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) {
   
            return {
              ...user,
              lockoutEnd: !isActive ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            };
          }
          return user;
        }));


        if (statusFilter !== null) {
          await fetchUsers();
        }
      } else {
        const errorText = await response.text();
        console.error('Status change error:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          toast({
            title: t('users.statusChangeError'),
            description: errorData.message || t('users.unknownError'),
            variant: 'destructive',
          });
        } catch (parseError) {
          toast({
            title: t('users.statusChangeError'),
            description: errorText || t('users.unknownError'),
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error changing status:', error);
      toast({
        title: t('users.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {

    if (dataGridRef.current && dataGridRef.current.instance) {
      try {

        if (typeof dataGridRef.current.instance.addRow === 'function') {
          dataGridRef.current.instance.addRow();
        } else {

          console.log('addRow method not available, using custom dialog');
          setAddDialogOpen(true);
        }
      } catch (error) {
        console.error('Error adding row:', error);

        setAddDialogOpen(true);
      }
    } else {

      setAddDialogOpen(true);
    }
  };


  const handleEditClick = (userId) => {
    if (dataGridRef.current && dataGridRef.current.instance) {
      try {
        const dataGrid = dataGridRef.current.instance;
        const rowIndex = users.findIndex(user => user.id === userId);

        if (rowIndex !== -1) {

          if (typeof dataGrid.editRow === 'function') {
            dataGrid.editRow(rowIndex);
          } else {

            console.log('editRow method not available, trying alternative approaches');


            if (typeof dataGrid.editCell === 'function') {
              dataGrid.editCell(rowIndex, 'username');
            } else if (typeof dataGrid.editing?.startEditAction === 'function') {
              dataGrid.editing.startEditAction({ data: users[rowIndex] });
            } else {
              toast({
                title: t('users.error'),
                description: 'Uređivanje nije dostupno. Pokušajte s drugim preglednikom ili osvježite stranicu.',
                variant: 'destructive',
              });
            }
          }
        } else {
          toast({
            title: t('users.error'),
            description: 'Korisnik nije pronađen',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error editing row:', error);
        toast({
          title: t('users.error'),
          description: 'Došlo je do greške prilikom uređivanja. Pokušajte osvježiti stranicu.',
          variant: 'destructive',
        });
      }
    }
  };


  const handleAddUserSubmit = async () => {
    try {

      if (!newUserData.username || !newUserData.email || !newUserData.password) {
        toast({
          title: t('users.error'),
          description: 'Korisničko ime, email i lozinka su obavezni',
          variant: 'destructive',
        });
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);

        let errorMessage = t('users.unknownError');
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = Array.isArray(errorData)
            ? errorData.map(err => err.description).join(', ')
            : errorData.message || t('users.unknownError');
        } catch (jsonError) {
          errorMessage = errorText || t('users.unknownError');
        }

        toast({
          title: t('users.createError'),
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('users.success'),
          description: t('users.createSuccess'),
        });


        setNewUserData({
          username: '',
          email: '',
          name: '',
          password: '',
          isAdmin: false,
        });
        setAddDialogOpen(false);

   
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: t('users.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const exportToExcel = () => {
    try {

      const dataToExport = users;


      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Korisnici');


      const columns = dataToExport.length > 0 ?
        Object.keys(dataToExport[0]).filter(key =>
          key !== 'password' && key !== '__typename',
        ) : [];


      worksheet.addRow(columns.map(col => {

        if (col === 'username') return t('users.username') || 'Korisničko ime';
        if (col === 'email') return t('users.email') || 'Email';
        if (col === 'name') return t('users.name') || 'Ime';
        if (col === 'isAdmin') return t('users.admin') || 'Administrator';
        if (col === 'lastLogin') return t('users.lastLogin') || 'Zadnja prijava';
        if (col === 'createDate') return t('users.created') || 'Datum kreiranja';
        if (col === 'lockoutEnd') return t('users.status') || 'Status';
        return col;
      }));


      dataToExport.forEach(item => {
        const rowData = columns.map(col => {
          let value = item[col];


          if (col === 'lastLogin' || col === 'createDate' || col === 'lockoutEnd') {
            return value ? new Date(value).toLocaleString() : '';
          }


          if (col === 'isAdmin') {
            return value === true ? 'Da' : 'Ne';
          }


          if (col === 'lockoutEnd') {
            return !value || new Date(value) < new Date() ? 'Aktivan' : 'Neaktivan';
          }

          return value || '';
        });

        worksheet.addRow(rowData);
      });


      worksheet.columns.forEach(column => {
        column.width = 20;
      });


      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Korisnici.xlsx');
      });

    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: t('users.error'),
        description: 'Došlo je do greške prilikom izvoza u Excel.',
        variant: 'destructive',
      });
    }
  };


  const exportToPdf = () => {
    try {

      const dataToExport = users;


      Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]).then(([jsPDFModule, autoTableModule]) => {

        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
        const autoTable = autoTableModule.default || autoTableModule;


        const doc = new jsPDF('landscape', 'pt', 'a4');


        const columns = dataToExport.length > 0 ?
          Object.keys(dataToExport[0]).filter(key =>
            key !== 'password' && key !== '__typename' && key !== 'id',
          ) : [];


        const rows = dataToExport.map(item => {
          return columns.map(col => {
            let value = item[col];


            if (col === 'lastLogin' || col === 'createDate' || col === 'lockoutEnd') {
              return value ? new Date(value).toLocaleString() : '';
            }


            if (col === 'isAdmin') {
              return value === true ? 'Da' : 'Ne';
            }


            if (col === 'lockoutEnd') {
              return !value || new Date(value) < new Date() ? 'Aktivan' : 'Neaktivan';
            }

            return value || '';
          });
        });


        const headers = columns.map(col => {

          if (col === 'username') return t('users.username') || 'Korisničko ime';
          if (col === 'email') return t('users.email') || 'Email';
          if (col === 'name') return t('users.name') || 'Ime';
          if (col === 'isAdmin') return t('users.admin') || 'Administrator';
          if (col === 'lastLogin') return t('users.lastLogin') || 'Zadnja prijava';
          if (col === 'createDate') return t('users.created') || 'Datum kreiranja';
          if (col === 'lockoutEnd') return t('users.status') || 'Status';
          return col;
        });


        doc.setFontSize(16);
        doc.text('Lista korisnika', 40, 30);


        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 50,
          margin: { top: 50 },
          styles: { overflow: 'linebreak' },
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });


        doc.save('Korisnici.pdf');
      });

    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: t('users.error'),
        description: 'Došlo je do greške prilikom izvoza u PDF.',
        variant: 'destructive',
      });
    }
  };


  const exportToCsv = () => {
    if (dataGridRef.current && dataGridRef.current.instance) {
      try {

        if (typeof dataGridRef.current.instance.exportToCsv === 'function') {
          dataGridRef.current.instance.exportToCsv(false);
        } else {


          const grid = dataGridRef.current.instance;
          const allColumns = grid.getVisibleColumns ?
            grid.getVisibleColumns() :
            Object.keys(users[0] || {}).map(key => ({ dataField: key, caption: key }));

          const columnsToExport = allColumns.filter(col => col.dataField);

          let csvContent = 'data:text/csv;charset=utf-8,';


          const headers = columnsToExport.map(col => col.caption || col.dataField);
          csvContent += headers.join(',') + '\n';


          users.forEach(row => {
            const rowData = columnsToExport.map(col => {
              let value = row[col.dataField];

              if (value === null || value === undefined) {
                return '';
              }

              if (typeof value === 'string') {

                value = value.replace(/"/g, '""');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                  value = `"${value}"`;
                }
              }
              return value;
            });
            csvContent += rowData.join(',') + '\n';
          });


          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'Korisnici.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('CSV export error:', error);
        toast({
          title: t('users.error'),
          description: 'Izvoz u CSV nije dostupan. Pokušajte s alternativnom metodom.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: t('users.error'),
        description: 'Izvoz u CSV nije dostupan. Pokušajte osvježiti stranicu.',
        variant: 'destructive',
      });
    }
  };
  const resetFilters = useCallback(() => {

    setSearchText('');
    setPageIndex(0);


    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;


        const apiUrl = `/api/users?pageSize=${pageSize}&pageIndex=0`;

        console.log('Resetting filters and fetching all users');

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Reset successful, fetched all users:', data);

          if (data.users && Array.isArray(data.users)) {
            setUsers(data.users);
            setTotalCount(data.totalCount || data.users.length);
          } else {
            const usersData = Array.isArray(data) ? data : [];
            setUsers(usersData);
            setTotalCount(usersData.length);
          }
        }
      } catch (error) {
        console.error('Error resetting users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [pageSize]);

  const handleSearchChange = (e) => {
    const newSearchText = e.target.value;
    console.log('Search changed to:', newSearchText);


    clearTimeout(searchTimeout.current);


    setSearchText(newSearchText);


    setPageIndex(0);


    if (!newSearchText.trim()) {
      resetFilters();
      return;
    }


    searchTimeout.current = setTimeout(() => {
      fetchUsers();
    }, 500);
  };


  const handleStatusFilterChange = (value) => {
    console.log('Status filter changed to:', value);
    setStatusFilter(value);
    setPageIndex(0); 
    fetchUsers();
  };


  const renderStatusCell = (data) => {
    const isActive = !data.data.lockoutEnd || new Date(data.data.lockoutEnd) < new Date();
    return (
      <div className="flex items-center">
        {isActive ? (
          <CheckCircleIcon className="text-green-500 mr-2" size={18} />
        ) : (
          <XCircleIcon className="text-red-500 mr-2" size={18} />
        )}
        {isActive ? t('users.active') : t('users.inactive')}
      </div>
    );
  };

  const renderDateCell = (data) => {
    if (!data.value) return null;
    return (
      <div className="flex items-center">
        <CalendarIcon className="mr-2" size={16} />
        {new Date(data.value).toLocaleString()}
      </div>
    );
  };

  const renderActionCell = (data) => {
    const isActive = !data.data.lockoutEnd || new Date(data.data.lockoutEnd) < new Date();
    const userId = data.data.id;

    return (
      <div className="flex space-x-2">
        <Button
          variant={isActive ? 'outline' : 'default'}
          size="sm"
          onClick={() => toggleUserStatus(userId, isActive)}
          title={isActive ? t('users.deactivate') : t('users.activate')}
          className={`${isActive ? 'text-red-500' : 'text-green-500'} ${darkMode ? 'border-gray-600' : ''}`}
          disabled={loading}
        >
          {isActive ? t('users.deactivate') : t('users.activate')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`text-red-500 hover:text-red-700 ${darkMode ? 'border-gray-600' : ''}`}
          onClick={() => confirmDelete(userId)}
          title={t('users.delete')}
          disabled={loading}
        >
          <TrashIcon size={16} />
        </Button>
      </div>
    );
  };
  const handlePageChange = (e) => {
    setPageIndex(e.component.pageIndex());
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = e.component.pageSize();
    setPageSize(newPageSize);
    setPageIndex(0); 
  };


  const dataGridContainerStyle = {
    backgroundColor: '#fff', 
    color: '#333',
    padding: '1rem',
    borderRadius: '0.375rem',
    boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  return (
    <Card className={`w-full ${darkMode ? 'bg-background text-white border-gray-700' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-theme-text">{t('users.title')}</CardTitle>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className={darkMode ? 'border-gray-600 ' : ''}  size="sm">
                <DownloadIcon className="mr-2" size={16} />
                {t('users.export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={darkMode ? 'bg-background border-gray-700' : ''}>
              <DropdownMenuItem
                onClick={exportToCsv}
                className={darkMode ? 'text-theme-text hover:bg-gray-700' : ''}
              >
                {t('users.exportCsv')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToExcel}
                className={darkMode ? 'text-theme-text hover:bg-gray-700' : ''}
              >
                {t('users.exportExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={exportToPdf}
                className={darkMode ? 'text-theme-text hover:bg-gray-700' : ''}
              >
                {t('users.exportPdf')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          <Button
            onClick={handleAddNewClick}
            className="flex items-center"
            size="sm"
          >
            <PlusIcon className="mr-2" size={16} />
            {t('users.addNew')}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (dataGridRef.current && dataGridRef.current.instance) {
                const instance = dataGridRef.current.instance;
                let selectedRowId;

                if (typeof instance.getSelectedRowKeys === 'function') {
                  const selectedRowKeys = instance.getSelectedRowKeys();
                  selectedRowId = selectedRowKeys && selectedRowKeys.length > 0 ? selectedRowKeys[0] : null;
                } else if (typeof instance.selection === 'object' && typeof instance.selection.getSelectedRowKeys === 'function') {

                  const selectedRowKeys = instance.selection.getSelectedRowKeys();
                  selectedRowId = selectedRowKeys && selectedRowKeys.length > 0 ? selectedRowKeys[0] : null;
                } else {

                  const selectedRows = instance.getSelectedRowsData ?
                    instance.getSelectedRowsData() :
                    (selectedUser ? [selectedUser] : []);

                  selectedRowId = selectedRows && selectedRows.length > 0 ? selectedRows[0].id : null;
                }

                if (selectedRowId) {
                  navigate(`/admin/users/${selectedRowId}/history`);
                } else {
                  setSelectionDialogOpen(true);
                }
              }
            }}
          >
            <HistoryIcon className="mr-2" size={16} />
            {t('users.viewHistory') || 'View History'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        <div className="mb-4 flex flex-wrap items-center gap-4">

          <div className="flex-grow sm:flex-grow-0 sm:min-w-60">
            <input
              type="text"
              placeholder={t('users.search')}
              value={searchText}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border rounded-md
        bg-white border-gray-300
        text-black placeholder-gray-500
        dark:bg-gray-700 dark:border-gray-600
        dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className='text-theme-text'>{t('users.filterByStatus')}:</span>
            <select
              value={statusFilter === null ? 'all' : statusFilter.toString()}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') handleStatusFilterChange(null);
                else if (val === 'true') handleStatusFilterChange(true);
                else if (val === 'false') handleStatusFilterChange(false);
              }}
              className="px-3 py-2 border rounded-md
    bg-white border-gray-300 text-black
    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">{t('users.allUsers')}</option>
              <option value="true">{t('users.active')}</option>
              <option value="false">{t('users.inactive')}</option>
            </select>
          </div>
        </div>


        <div style={dataGridContainerStyle} className="rounded-md">
          {users.length === 0 && !loading && (
            <div className="w-full p-8 text-center bg-white rounded-md mb-4">
              <p className="text-gray-500">
                {searchText || statusFilter !== null
                  ? t('users.noMatchingResults')
                  : t('users.noUsers')}
              </p>
            </div>
          )}
          <DataGrid
            ref={dataGridRef}
            dataSource={users}
            showBorders={true}
            columnAutoWidth={true}
            rowAlternationEnabled={true}
            allowColumnResizing={true}
            onRowInserting={handleRowInserting}
            onRowUpdating={handleRowUpdating}
            selection={{ mode: 'single' }}
            onSelectionChanged={(e) => {
              const selectedRows = e.selectedRowsData;
              if (selectedRows.length > 0) {
                setSelectedUser(selectedRows[0]);
              } else {
                setSelectedUser(null);
              }
            }}
            keyExpr="id"
            loadPanel={{ enabled: loading }}
            className="dx-theme-light" 
            remoteOperations={true} 
            onOptionChanged={(e) => {
              if (e.fullName === 'paging.pageIndex') {
                handlePageChange(e);
              }
              if (e.fullName === 'paging.pageSize') {
                handlePageSizeChange(e);
              }
            }}
          >
            <Export enabled={false} allowExportSelectedData={true} />
            <Scrolling mode="standard" />
            <Paging
              defaultPageSize={pageSize}
              defaultPageIndex={pageIndex}
              enabled={true}
            />
            <Pager
              visible={true}
              showPageSizeSelector={true}
              allowedPageSizes={[5, 10, 20, 50]}
              showInfo={true}
              showNavigationButtons={true}
              totalCount={totalCount}
            />
            <FilterRow visible={false} />
            <HeaderFilter visible={true} />
            <Editing
              mode="form"
              allowUpdating={true}
              allowDeleting={false}
              useIcons={false}
              form={{
                labelLocation: 'top',
                items: [
                  { dataField: 'username', isRequired: true },
                  { dataField: 'email', isRequired: true },
                  { dataField: 'name' },
                  { dataField: 'password', editorOptions: { mode: 'password' }, isRequired: true },
                  { dataField: 'isAdmin', editorType: 'dxCheckBox' },
                ],
              }}
              texts={{
                editRow: t('users.editUser'),
              }}
            />
            <Column dataField="username" caption={t('users.username')} />
            <Column dataField="email" caption={t('users.email')} />
            <Column dataField="name" caption={t('users.name')} />
            <Column dataField="isAdmin" caption={t('users.admin')} dataType="boolean" />
            <Column
              dataField="lockoutEnd"
              caption={t('users.status')}
              cellRender={renderStatusCell}
              allowFiltering={true}
              filterOperations={['=']}
            />
            <Column
              dataField="lastLogin"
              caption={t('users.lastLogin')}
              dataType="datetime"
              cellRender={renderDateCell}
            />
            <Column
              dataField="createDate"
              caption={t('users.created')}
              dataType="datetime"
              cellRender={renderDateCell}
            /><Column
              caption={t('users.actions')}
              cellRender={renderActionCell}
              allowFiltering={false}
              allowSorting={false}
              width={150}
            />
          </DataGrid>
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white text-black border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>{t('users.confirmDelete')}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {userToDelete && (
                <p>{t('users.deleteWarning', { username: userToDelete.username })}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="default"
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                {t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className={darkMode ? 'bg-background text-theme-text border-gray-700' : ''}>
            <DialogHeader>
              <DialogTitle className='text-theme-text'>{t('users.addNew')}</DialogTitle>
            </DialogHeader>
            <div className="py-4 flex flex-col gap-4">
              <div className="flex flex-col">
                <label htmlFor="username" className="mb-1 text-theme-text">{t('users.username')} *</label>
                <input
                  type="text"
                  id="username"
                  className={`border p-2 rounded border-gray-300 ${
                    darkMode ? 'bg-background text-theme-text' : ''
                  }`}
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="mb-1 text-theme-text">{t('users.email')} *</label>
                <input
                  type="email"
                  id="email"
                  className={`border p-2 rounded border-gray-300 ${
                    darkMode ? 'bg-background text-theme-text' : ''
                  }`}
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="name" className="mb-1 text-theme-text">{t('users.name')}</label>
                <input
                  type="text"
                  id="name"
                  className={`border p-2 rounded border-gray-300 ${
                    darkMode ? 'bg-background text-theme-text' : ''
                  }`}
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="mb-1 text-theme-text">{t('users.password')} *</label>
                <input
                  type="password"
                  id="password"
                  className={`border p-2 rounded border-gray-300 ${
                    darkMode ? 'bg-background text-theme-text' : ''
                  }`}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdmin"
                  className={`mr-2 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : ''
                  }`}
                  checked={newUserData.isAdmin}
                  onChange={(e) => setNewUserData({ ...newUserData, isAdmin: e.target.checked })}
                />
                <label htmlFor="isAdmin" className="text-theme-text">{t('users.admin')}</label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                onClick={() => setAddDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddUserSubmit}
              >
                {t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={selectionDialogOpen} onOpenChange={setSelectionDialogOpen}>
          <DialogContent className={darkMode ? 'bg-background text-theme-text border-gray-700' : ''}>
            <DialogHeader>
              <DialogTitle className='text-theme-text'>{t('users.selectUser') || 'Odabir korisnika'} </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-theme-text">
              <p>{t('users.pleaseSelectUser') || 'Molimo vas selektujte korisnika za kojeg želite pregled historije.'}</p>
            </div>
            <DialogFooter className='text-theme-text'>
              <Button
                variant="default"
                onClick={() => setSelectionDialogOpen(false)}
              >
                {t('common.ok') || 'OK'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
export default UsersManagement;
