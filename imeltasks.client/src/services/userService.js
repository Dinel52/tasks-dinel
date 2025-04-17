import axios from 'axios';

const API_URL = '/api/users';

const userService = {
  getUsers: async (page = 1, pageSize = 10, search = '', statusFilter = 'all') => {
    const token = JSON.parse(localStorage.getItem('token'));
    const response = await axios.get(
      `${API_URL}?page=${page}&pageSize=${pageSize}&search=${search}&statusFilter=${statusFilter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return {
      data: response.data,
      totalCount: parseInt(response.headers['x-total-count']),
      pageSize: parseInt(response.headers['x-page-size']),
      currentPage: parseInt(response.headers['x-current-page']),
      totalPages: parseInt(response.headers['x-total-pages']),
    };
  },

  getUserById: async (id) => {
    const token = JSON.parse(localStorage.getItem('token'));
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  createUser: async (userData) => {
    const token = JSON.parse(localStorage.getItem('token'));
    const response = await axios.post(API_URL, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  updateUser: async (id, userData) => {
    const token = JSON.parse(localStorage.getItem('token'));
    const response = await axios.put(`${API_URL}/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  toggleUserStatus: async (id) => {
    const token = JSON.parse(localStorage.getItem('token'));
    const response = await axios.patch(`${API_URL}/${id}/toggle-status`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  },

  deleteUser: async (id) => {
    const token = JSON.parse(localStorage.getItem('token'));
    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  },

  exportUsers: async (format = 'csv', statusFilter = 'all') => {
    const token = JSON.parse(localStorage.getItem('token'));
    const response = await axios.get(`${API_URL}/export?format=${format}&statusFilter=${statusFilter}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });

    const fileName = `users_export_${new Date().toISOString().slice(0, 10)}.${format}`;

    // Kreiranje download linka
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return true;
  },
};

export const getUserHistory = async (userId) => {
  const response = await fetch(`/api/users/${userId}/history`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user history');
  }

  return await response.json();
};

export const restoreUserVersion = async (userId, versionId) => {
  const response = await fetch(`/api/users/${userId}/restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ versionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to restore user version');
  }

  return await response.json();
};

export default userService;
