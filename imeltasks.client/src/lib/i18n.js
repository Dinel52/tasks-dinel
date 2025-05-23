import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resourcesEn = {
  translation: {
    common: {
      changeLanguage: 'Change language',
      toggleTheme: 'Toggle theme',
      cancel: 'Cancel',
      delete: 'Delete',
      save: 'Save',
      ok: 'OK',
    },
    login: {
      pageTitle: 'Login',
      title: 'Login',
      subtitle: 'Enter your credentials to sign in to your account',
      email: 'Email',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
      loginButton: 'Login',
      noAccount: 'Don\'t have an account?',
      register: 'Register',
      errors: {
        generic: 'Something went wrong, please try again',
        connection: 'Connection error. Please try again later.',
      },
    },
    register: {
      pageTitle: 'Register',
      title: 'Create an account',
      subtitle: 'Enter your information to create an account',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      password: 'Password',
      emailHelp: 'Enter a valid email address. This will be used for account activation and communication.',
      passwordHelp: 'Create a secure password with at least 6 characters and at least one uppercase letter.',
      registerButton: 'Register',
      haveAccount: 'Already have an account?',
      login: 'Login',
      errors: {
        generic: 'Something went wrong, please try again',
        connection: 'Connection error. Please try again later.',
      },
    },
    language: {
      english: 'English',
      bosnian: 'Bosnian',
    },
    dashboard: {
      welcome: 'Welcome to the administration system',
      welcomeDescription: 'Access all important functions through the menu or using the shortcuts below.',
      systemOverview: 'Here you can view the system status and access all necessary tools.',
      users: 'Users',
      reports: 'Reports',
      settings: 'Settings',
      quickAccess: 'Quick access',
      recentActivities: 'Recent activities',
      viewAllActivities: 'View all activities',
      stats: {
        activeUsers: 'Active users',
        totalReports: 'Total reports',
        thisMonth: 'This month',
        success: 'Success rate',
      } },
    features: {
      userManagement: {
        title: 'User management',
        description: 'Add, edit and view all system users',
      },
      reports: {
        title: 'Reports',
        description: 'Access detailed reports and analytics',
      },
      userProfile: {
        title: 'User profile',
        description: 'Edit your personal data and settings',
      },
      activityHistory: {
        title: 'Activity history',
        description: 'View history of user activities',
      },
    },
    activities: {
      newUser: 'New user registered',
      reportGenerated: 'Monthly report generated',
      maintenanceScheduled: 'System maintenance scheduled',
      timeAgo: {
        hours: '{count} hours ago',
        tomorrow: 'Tomorrow at {time}',
      },
    },
    tabs: {
      overview: 'Overview',
      activities: 'Activities',
    },
    support: {
      needHelp: 'Need help?',
      helpDescription: 'If you have difficulties using the system, review our documentation or contact the administrator.',
      title: 'Customer support',
      description: 'Contact our customer support if you have questions',
      contactSupport: 'Contact support',
      viewDocumentation: 'View documentation',
    },
    sidebar: {
      title: 'Imel Service',
      home: 'Home',
      userManagement: 'User Management',
      reports: 'Reports',
      settings: 'Settings',
      accessDenied: 'Access Denied',
      accessDeniedMessage: 'You don\'t have access to this functionality. Only administrators can access user management.',
      close: 'Close',
      copyright: '© 2025 Imel Service',
    },
    userNav: {
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Log out',
      userProfile: 'User Profile',
      username: 'Username:',
      email: 'Email:',
      lastLogin: 'Last Login:',
      accountType: 'Account Type:',
      administrator: 'Administrator',
      standardUser: 'Standard User',
      editProfile: 'Edit Profile',
      close: 'Close',
    },
    users: {
      title: 'Users Management',
      addNew: 'Add New User',
      username: 'Username',
      email: 'Email',
      name: 'Name',
      password: 'Password',
      admin: 'Admin',
      status: 'Status',
      lastLogin: 'Last Login',
      created: 'Created',
      actions: 'Actions',
      active: 'Active',
      inactive: 'Inactive',
      activate: 'Activate',
      deactivate: 'Deactivate',
      edit: 'Edit',
      delete: 'Delete',
      confirmDelete: 'Confirm Delete',
      deleteWarning: 'Are you sure you want to delete user "{username}"? This action cannot be undone.',
      success: 'Success',
      error: 'Error',
      notAuthenticated: 'You are not authenticated',
      notAuthorized: 'You are not authorized to access this resource',
      fetchError: 'Error fetching users',
      createError: 'Error creating user',
      updateError: 'Error updating user',
      deleteError: 'Error deleting user',
      statusUpdateError: 'Error updating user status',
      unknownError: 'An unknown error occurred',
      createSuccess: 'User created successfully',
      updateSuccess: 'User updated successfully',
      deleteSuccess: 'User deleted successfully',
      statusUpdateSuccess: 'User status updated successfully',
      editUser: 'Edit User',
      search: 'Search',
      filterByStatus: 'Filter by status',
      allUsers: 'All Users',
      export: 'Export',
      exportCsv: 'Export to CSV',
      exportExcel: 'Export to Excel',
      exportPdf: 'Export to PDF',
      viewHistory: 'View User History',
      selectUser: 'Select User',
      pleaseSelectUser: 'Please select a user to view their history.',
      noMatchingResults: 'No matching results found.',
      noUsers: 'No users available.',
    },
    userHistory: {
      title: 'User History',
      backToUsers: 'Back to Users',
      loading: 'Loading history...',
      noRecords: 'No history records found',
      tableColumns: {
        version: 'Version',
        username: 'Username',
        email: 'Email',
        name: 'Name',
        admin: 'Admin',
        date: 'Date',
        actions: 'Actions',
      },
      adminStatus: {
        yes: 'Yes',
        no: 'No',
      },
      actions: {
        restore: 'Restore',
      },
      confirmDialog: {
        title: 'Confirm Version Restore',
        message: 'Are you sure you want to restore to version {version} from {date}?',
        cancel: 'Cancel',
        confirm: 'Confirm Restore',
      },
      errors: {
        loadFailed: 'Failed to load user history',
        restoreFailed: 'Failed to restore user version',
      },
      pagination: {
        showing: 'Showing',
        itemsPerPage: 'Items per page',
      },
    },
    settings: {
      title: 'Account Settings',
      profileSettings: 'Profile Settings',
      profileSettingsDesc: 'Manage your profile and personal information',
      profilePicture: 'Profile Picture',
      uploadNew: 'Upload new',
      uploading: 'Uploading...',
      saveImage: 'Save image',
      removeImage: 'Remove image',
      recommendedSize: 'Recommended size: 200x200px',
      personalInfo: 'Personal Information',
      fullName: 'Full Name',
      accountInfo: 'Account Information',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      invalidFileType: 'Invalid file type. Allowed formats are JPG, PNG, and GIF',
      fileSelected: 'File successfully selected and prepared (200x200px). Click "Save Image" to upload.',
      imageProcessingError: 'Error processing image',
      noFileSelected: 'No image selected',
      imageUploaded: 'Image successfully uploaded',
      imageRemoved: 'Image successfully removed',
      profileUpdated: 'Profile successfully updated',
      updateFailed: 'Error updating profile',
      imageUploadFailed: 'Error uploading image',
      imageRemoveFailed: 'Error removing image',
    },
    accessDenied: {
      title: 'Access Denied',
      message: 'You don\'t have access to this functionality. Only administrators can access {{title}}.',
    },
  },
};

const resourcesBs = {
  translation: {
    common: {
      changeLanguage: 'Promijeni jezik',
      toggleTheme: 'Promijeni temu',
      cancel: 'Otkaži',
      delete: 'Obriši',
      save: 'Spremi',
      ok: 'Okej',
    },
    login: {
      pageTitle: 'Prijava',
      title: 'Prijava',
      subtitle: 'Unesite svoje podatke za prijavu na račun',
      email: 'Email',
      emailPlaceholder: 'Email',
      password: 'Lozinka',
      passwordPlaceholder: 'Lozinka',
      forgotPassword: 'Zaboravili ste lozinku?',
      rememberMe: 'Zapamti me',
      loginButton: 'Prijavi se',
      noAccount: 'Nemate račun?',
      register: 'Registrujte se',
      errors: {
        generic: 'Nešto nije u redu, pokušajte ponovo',
        connection: 'Greška u povezivanju. Pokušajte ponovo kasnije.',
      },
    },
    register: {
      pageTitle: 'Registracija',
      title: 'Kreirajte račun',
      subtitle: 'Unesite svoje podatke da biste kreirali račun',
      fullName: 'Ime i prezime',
      fullNamePlaceholder: 'Unesite vaše ime i prezime',
      email: 'Email',
      emailPlaceholder: 'Unesite vaš email',
      passwordPlaceholder: 'Unesite vašu lozinku',
      password: 'Lozinka',
      emailHelp: 'Unesite ispravnu email adresu. Koristit će se za aktivaciju i komunikaciju u vezi računa.',
      passwordHelp: 'Kreirajte sigurnu lozinku sa najmanje 6 znakova i najmanje jednim velikim slovom.',
      registerButton: 'Registruj se',
      haveAccount: 'Već imate račun?',
      login: 'Prijavi se',
      errors: {
        generic: 'Nešto nije u redu, pokušajte ponovo',
        connection: 'Greška u povezivanju. Pokušajte ponovo kasnije.',
      },
    },
    language: {
      english: 'Engleski',
      bosnian: 'Bosanski',
    },
    dashboard: {
      welcome: 'Dobrodošli u administrativni sustav',
      welcomeDescription: 'Pristupite svim važnim funkcijama kroz izbornik ili koristeći prečace ispod.',
      systemOverview: 'Ovdje možete pregledati stanje sustava i pristupiti svim potrebnim alatima.',
      users: 'Korisnici',
      reports: 'Izvještaji',
      settings: 'Postavke',
      quickAccess: 'Brzi pristup',
      recentActivities: 'Nedavne aktivnosti',
      viewAllActivities: 'Pregledaj sve aktivnosti',
      stats: {
        activeUsers: 'Aktivni korisnici',
        totalReports: 'Ukupno izvještaja',
        thisMonth: 'Ovaj mjesec',
        success: 'Uspješnost',
      },
    },
    features: {
      userManagement: {
        title: 'Upravljanje korisnicima',
        description: 'Dodajte, uređujte i pregledajte sve korisnike sustava',
      },
      reports: {
        title: 'Izvještaji',
        description: 'Pristupite detaljnim izvještajima i analitici',
      },
      userProfile: {
        title: 'Korisnički profil',
        description: 'Uredite svoje osobne podatke i postavke',
      },
      activityHistory: {
        title: 'Povijest aktivnosti',
        description: 'Pregledajte povijest korisničkih aktivnosti',
      },
    },
    activities: {
      newUser: 'Novi korisnik registriran',
      reportGenerated: 'Generirano mjesečno izvješće',
      maintenanceScheduled: 'Zakazano održavanje sustava',
      timeAgo: {
        hours: 'Prije {count} sata',
        tomorrow: 'Sutra u {time}',
      },
    },
    tabs: {
      overview: 'Pregled',
      activities: 'Aktivnosti',
    },
    support: {
      needHelp: 'Trebate pomoć?',
      helpDescription: 'Ako imate poteškoća s korištenjem sustava, pregledajte našu dokumentaciju ili se obratite administratoru.',
      title: 'Korisnička podrška',
      description: 'Kontaktirajte našu korisničku podršku ako imate pitanja',
      contactSupport: 'Kontaktirajte podršku',
      viewDocumentation: 'Pregledajte dokumentaciju',
    },
    sidebar: {
      title: 'Imel Servis',
      home: 'Početna',
      userManagement: 'Upravljanje korisnicima',
      reports: 'Izvještaji',
      settings: 'Postavke',
      accessDenied: 'Pristup odbijen',
      accessDeniedMessage: 'Nemate pristup ovoj funkcionalnosti. Samo administratori mogu pristupiti upravljanju korisnicima.',
      close: 'Zatvori',
      copyright: '© 2025 Imel Servis',
    },
    userNav: {
      profile: 'Profil',
      settings: 'Postavke',
      logout: 'Odjava',
      userProfile: 'Korisnički profil',
      username: 'Korisničko ime:',
      email: 'Email:',
      lastLogin: 'Posljednja prijava:',
      accountType: 'Tip računa:',
      administrator: 'Administrator',
      standardUser: 'Standardni korisnik',
      editProfile: 'Uredi profil',
      close: 'Zatvori',
    },
    users: {
      title: 'Upravljanje korisnicima',
      addNew: 'Dodaj novog korisnika',
      username: 'Korisničko ime',
      email: 'Email',
      name: 'Ime',
      password: 'Lozinka',
      admin: 'Administrator',
      status: 'Status',
      lastLogin: 'Posljednja prijava',
      created: 'Kreirano',
      actions: 'Akcije',
      active: 'Aktivan',
      inactive: 'Neaktivan',
      activate: 'Aktiviraj',
      deactivate: 'Deaktiviraj',
      edit: 'Uredi',
      delete: 'Obriši',
      confirmDelete: 'Potvrdi brisanje',
      deleteWarning: 'Jeste li sigurni da želite obrisati korisnika "{username}"? Ova akcija se ne može poništiti.',
      success: 'Uspjeh',
      error: 'Greška',
      notAuthenticated: 'Niste autentificirani',
      notAuthorized: 'Niste ovlašteni za pristup ovom resursu',
      fetchError: 'Greška pri dohvatanju korisnika',
      createError: 'Greška pri kreiranju korisnika',
      updateError: 'Greška pri ažuriranju korisnika',
      deleteError: 'Greška pri brisanju korisnika',
      statusUpdateError: 'Greška pri ažuriranju statusa korisnika',
      unknownError: 'Došlo je do nepoznate greške',
      createSuccess: 'Korisnik je uspješno kreiran',
      updateSuccess: 'Korisnik je uspješno ažuriran',
      deleteSuccess: 'Korisnik je uspješno obrisan',
      statusUpdateSuccess: 'Status korisnika je uspješno ažuriran',
      editUser: 'Uredi korisnika',
      search: 'Pretraga',
      filterByStatus: 'Filtriraj po statusu',
      allUsers: 'Svi korisnici',
      export: 'Izvoz',
      exportCsv: 'Izvoz u CSV',
      exportExcel: 'Izvoz u Excel',
      exportPdf: 'Izvoz u PDF',
      viewHistory: 'Vidi historiju korisnika',
      selectUser: 'Odabir korisnika',
      pleaseSelectUser: 'Molimo vas selektujte korisnika za kojeg želite pregled historije.',
      noMatchingResults: 'Nema rezultata koji odgovaraju pretrazi.',
      noUsers: 'Nema korisnika.',
    },
    userHistory: {
      title: 'Historija korisnika',
      backToUsers: 'Nazad na korisnike',
      loading: 'Učitavanje historije...',
      noRecords: 'Nisu pronađeni zapisi historije',
      tableColumns: {
        version: 'Verzija',
        username: 'Korisničko ime',
        email: 'Email',
        name: 'Ime',
        admin: 'Administrator',
        date: 'Datum',
        actions: 'Akcije',
      },
      adminStatus: {
        yes: 'Da',
        no: 'Ne',
      },
      actions: {
        restore: 'Vrati',
      },
      confirmDialog: {
        title: 'Potvrdi vraćanje verzije',
        message: 'Jeste li sigurni da želite vratiti na verziju {version} od {date}?',
        cancel: 'Otkaži',
        confirm: 'Potvrdi vraćanje',
      },
      errors: {
        loadFailed: 'Greška pri učitavanju historije korisnika',
        restoreFailed: 'Greška pri vraćanju verzije korisnika',
      },
      pagination: {
        showing: 'Prikazano',
        itemsPerPage: 'Stavki po stranici',
      },
    },
    settings: {
      title: 'Postavke računa',
      profileSettings: 'Postavke profila',
      profileSettingsDesc: 'Upravljajte svojim profilom i ličnim informacijama',
      profilePicture: 'Profilna slika',
      uploadNew: 'Učitaj novu',
      uploading: 'Učitavanje...',
      saveImage: 'Sačuvaj sliku',
      removeImage: 'Ukloni sliku',
      recommendedSize: 'Preporučena veličina: 200x200px',
      personalInfo: 'Lične informacije',
      fullName: 'Puno ime',
      accountInfo: 'Informacije o računu',
      cancel: 'Otkaži',
      saveChanges: 'Sačuvaj promjene',
      invalidFileType: 'Nevažeći tip fajla. Dozvoljeni formati su JPG, PNG i GIF',
      fileSelected: 'Fajl uspješno odabran i pripremljen (200x200px). Kliknite "Sačuvaj sliku" za učitavanje.',
      imageProcessingError: 'Greška pri obradi slike',
      noFileSelected: 'Nije odabrana slika',
      imageUploaded: 'Slika uspješno učitana',
      imageRemoved: 'Slika uspješno uklonjena',
      profileUpdated: 'Profil uspješno ažuriran',
      updateFailed: 'Greška pri ažuriranju profila',
      imageUploadFailed: 'Greška pri učitavanju slike',
      imageRemoveFailed: 'Greška pri uklanjanju slike',
    },
    accessDenied: {
      title: 'Pristup odbijen',
      message: 'Nemate pristup ovoj funkcionalnosti. Samo administratori mogu pristupiti {{title}}.',
    },
  },

};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: resourcesEn,
      bs: resourcesBs,
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
