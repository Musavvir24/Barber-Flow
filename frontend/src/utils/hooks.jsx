// useAuth hook for managing authentication state
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedShop = localStorage.getItem('shop');

    if (token && storedUser && storedShop) {
      setUser(JSON.parse(storedUser));
      setShop(JSON.parse(storedShop));
    }
    setLoading(false);
  }, []);

  const login = (token, user, shop) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('shop', JSON.stringify(shop));
    setUser(user);
    setShop(shop);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('shop');
    setUser(null);
    setShop(null);
  };

  return { user, shop, loading, login, logout };
};

// useApi hook for data fetching
export const useApi = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchFunction();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
