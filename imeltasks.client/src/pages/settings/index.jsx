import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserIcon,
  AtSignIcon,
  CalendarIcon,
  ShieldIcon,
  Upload,
  X,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 ${
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        'bg-green-100 text-green-800 border border-green-200'
    }`}>
      <div className="flex justify-between items-center">
        <div className="mr-4">{message}</div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem('userData') || '{}'),
  );

  const [formData, setFormData] = useState({
    ...userData,
  });

  const [darkMode, setDarkMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(userData.avatarPath || '/avatars/default.png');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  useEffect(() => {
    setFormData({ ...userData });
    setPreviewImage(userData.avatarPath || '/avatars/default.png');

    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
  }, [userData]);

  const getInitials = () => {
    if (formData.name) {
      return formData.name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return formData.username ? formData.username[0].toUpperCase() : 'U';
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 200;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, size, size);
          let sourceWidth = img.width;
          let sourceHeight = img.height;
          let sourceX = 0;
          let sourceY = 0;

          if (sourceWidth > sourceHeight) {
            sourceX = (sourceWidth - sourceHeight) / 2;
            sourceWidth = sourceHeight;
          } else if (sourceHeight > sourceWidth) {
            sourceY = (sourceHeight - sourceWidth) / 2;
            sourceHeight = sourceWidth;
          }

          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, size, size,
          );

          canvas.toBlob((blob) => {
            resolve(blob);
          }, file.type, 0.9);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showNotification(t('settings.invalidFileType') || 'Neispravan format datoteke. Dozvoljeni formati su JPG, PNG i GIF', 'error');
        return;
      }

      try {
        const resizedBlob = await resizeImage(file);

        const resizedFile = new File([resizedBlob], file.name, {
          type: file.type,
          lastModified: new Date().getTime(),
        });

        setSelectedFile(resizedFile);

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(resizedFile);

        showNotification(t('settings.fileSelected') || 'Datoteka je uspješno odabrana i pripremljena (200x200px). Kliknite "Spremi sliku" za upload.', 'success');
      } catch (error) {
        console.error('Error resizing image:', error);
        showNotification(t('settings.imageProcessingError') || 'Greška prilikom obrade slike', 'error');
      }
    }
  };   // eslint-disable-next-line
  const handleImageUpload = async () => {
    if (!selectedFile) {
      showNotification(t('settings.noFileSelected') || 'Niste odabrali sliku', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();

      formData.append('file', selectedFile);
      formData.append('avatar', selectedFile);
      formData.append('image', selectedFile);

      const token = localStorage.getItem('token');

      const response = await fetch(`/api/users/${userData.id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Greška prilikom učitavanja slike';

        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('Error response (text):', errorText);
          errorMessage = 'Greška na poslužitelju. Provjerite konzolu za detalje.';
        }

        throw new Error(errorMessage);
      }

      try {
        const data = await response.json();

        const updatedUserData = {
          ...userData,
          avatarPath: data.avatarPath,
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        const updatedUserData = {
          ...userData,
          avatarPath: previewImage,
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
      }

      showNotification(t('settings.imageUploaded') || 'Slika uspješno učitana', 'success');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification(error.message || t('settings.imageUploadFailed') || 'Greška prilikom učitavanja slike', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUploadSimulated = () => {
    if (!selectedFile) {
      showNotification(t('settings.noFileSelected') || 'Niste odabrali sliku', 'error');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result;

          const updatedUserData = {
            ...userData,
            avatarPath: base64Image,
          };
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          setUserData(updatedUserData);

          showNotification(t('settings.imageUploaded') || 'Slika uspješno učitana (200x200px)', 'success');
          setSelectedFile(null);
        };
        reader.readAsDataURL(selectedFile);
      } catch (error) {
        console.error('Error in simulated upload:', error);
        showNotification(t('settings.imageUploadFailed') || 'Greška prilikom učitavanja slike', 'error');
      } finally {
        setIsUploading(false);
      }
    }, 1000);
  }; // eslint-disable-next-line
  const handleRemoveImage = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/users/${userData.id}/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Greška prilikom brisanja slike');
      }

      const data = await response.json();

      const updatedUserData = {
        ...userData,
        avatarPath: data.avatarPath || '/avatars/default.png',
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setPreviewImage(data.avatarPath || '/avatars/default.png');
      setSelectedFile(null);

      showNotification(t('settings.imageRemoved') || 'Slika uspješno uklonjena', 'success');
    } catch (error) {
      console.error('Error removing image:', error);
      showNotification(error.message || t('settings.imageRemoveFailed') || 'Greška prilikom uklanjanja slike', 'error');
    }
  };

  const handleRemoveImageSimulated = () => {
    const updatedUserData = {
      ...userData,
      avatarPath: '/avatars/default.png',
    };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    setPreviewImage('/avatars/default.png');
    setSelectedFile(null);

    showNotification(t('settings.imageRemoved') || 'Slika uspješno uklonjena (simulirano)', 'success');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          name: formData.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Greška prilikom ažuriranja profila');
      }

      const updatedUser = await response.json();

      const updatedUserData = {
        ...userData,
        ...updatedUser,
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);

      showNotification(t('settings.profileUpdated') || 'Profil uspješno ažuriran', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.message || t('settings.updateFailed') || 'Greška prilikom ažuriranja profila', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    navigate('/home');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: 'success' })}
        />
      )}

      <h1 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : ''}`}>
        {t('settings.title') || 'Postavke računa'}
      </h1>

      <div className="max-w-2xl mx-auto">
        <Card className={darkMode ? 'bg-background text-theme-text border-gray-700' : ''}>
          <CardHeader>
            <CardTitle>{t('settings.profileSettings') || 'Postavke profila'}</CardTitle>
            <CardDescription className="text-sm text-theme-text">
              {t('settings.profileSettingsDesc') || 'Upravljajte vašim profilom i osobnim podacima'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewImage} alt={formData.username} />
                  <AvatarFallback className={`text-xl ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-3">
                  <h3 className="font-medium">{t('settings.profilePicture') || 'Profilna slika'}</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default" onClick={triggerFileInput}>
                      <Upload size={16} className="mr-1" />
                      <span>{t('settings.uploadNew') || 'Učitaj novu'}</span>
                    </Button>

                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    {selectedFile && (
                      <Button
                        variant="default"
                        onClick={handleImageUploadSimulated}
                        disabled={isUploading}
                      >
                        {isUploading ?
                          (t('settings.uploading') || 'Učitavanje...') :
                          (t('settings.saveImage') || 'Spremi sliku')}
                      </Button>
                    )}

                    <Button
                      variant="default"
                      onClick={handleRemoveImageSimulated}
                      disabled={!userData.avatarPath || userData.avatarPath === '/avatars/default.png'}
                    >
                      <X size={16} className="mr-1" />
                      {t('settings.removeImage') || 'Ukloni sliku'}
                    </Button>
                  </div>
                  <p className="text-sm text-theme-text">
                    {t('settings.recommendedSize') || 'Preporučena veličina: 200x200px'}
                  </p>
                </div>
              </div>

              <hr className={darkMode ? 'border-gray-700' : 'border-gray-200'} />

              <div className="space-y-4">
                <h3 className="font-medium">{t('settings.personalInfo') || 'Osobni podaci'}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={'block mb-2 text-sm font-medium text-theme-text'}>
                      {t('settings.fullName') || 'Ime i prezime'}
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className={'border-gray-300'}
                    />
                  </div>

                  <div>
                    <label className={'block mb-2 text-sm font-medium text-theme-text'}>
                      {t('userNav.username') || 'Korisničko ime'}
                    </label>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      className={'border-gray-300 text-theme-text'}
                    />
                  </div>

                  <div>
                    <label className={'block mb-2 text-sm font-medium text-theme-text'}>
                      {t('userNav.email') || 'Email adresa'}
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={'border-gray-300 text-theme-text'}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <hr className={darkMode ? 'border-gray-700' : 'border-gray-200'} />

                <h3 className="font-medium">{t('settings.accountInfo') || 'Informacije o računu'}</h3>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <UserIcon size={18} className={'mr-2 text-theme-text'} />
                    <span className="font-medium mr-2">{t('userNav.username') || 'Korisničko ime'}</span>
                    <span>{userData.username}</span>
                  </div>

                  <div className="flex items-center">
                    <AtSignIcon size={18} className={'mr-2 text-theme-text'} />
                    <span className="font-medium mr-2">{t('userNav.email') || 'Email'}</span>
                    <span>{userData.email}</span>
                  </div>

                  {userData.lastLogin && (
                    <div className="flex items-center">
                      <CalendarIcon size={18} className={'mr-2 text-theme-text'} />
                      <span className="font-medium mr-2">{t('userNav.lastLogin') || 'Zadnja prijava'}</span>
                      <span>{new Date(userData.lastLogin).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <ShieldIcon size={18} className={'mr-2 text-theme-text'} />
                    <span className="font-medium mr-2">{t('userNav.accountType') || 'Tip računa'}</span>
                    <span>{userData.isAdmin ? (t('userNav.administrator') || 'Administrator') : (t('userNav.standardUser') || 'Standardni korisnik')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="default" onClick={handleCancel} className={darkMode ? 'border-gray-600' : ''}>
                  {t('settings.cancel') || 'Odustani'}
                </Button>
                <Button onClick={handleSaveChanges}>
                  {t('settings.saveChanges') || 'Spremi promjene'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
