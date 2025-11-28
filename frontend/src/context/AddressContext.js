import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/axios';

export const AddressContext = createContext({
  addresses: [],
  primaryAddress: null,
  loadingAddresses: false,
  error: null,
  fetchAddresses: () => {},
  addAddress: async () => {},
  updateAddress: async () => {},
  deleteAddress: async () => {},
  setDefaultAddress: async () => {},
  refreshPrimary: async () => {},
});

export const AddressProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [primaryAddress, setPrimaryAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [error, setError] = useState(null);

  const derivePrimary = useCallback((list) => {
    if (!Array.isArray(list)) {
      return null;
    }
    return list.find((addr) => addr.is_default) || list[0] || null;
  }, []);

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setPrimaryAddress(null);
      return;
    }
    setLoadingAddresses(true);
    setError(null);
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
      setPrimaryAddress(derivePrimary(data));
    } catch (err) {
      console.error('Fetch addresses failed:', err);
      setError(err.response?.data?.message || 'Unable to fetch addresses');
    } finally {
      setLoadingAddresses(false);
    }
  }, [derivePrimary, user]);

  const addAddress = useCallback(
    async (payload) => {
      const { data } = await api.post('/addresses', payload);
      await fetchAddresses();
      return data;
    },
    [fetchAddresses]
  );

  const updateAddress = useCallback(
    async (id, payload) => {
      const { data } = await api.put(`/addresses/${id}`, payload);
      await fetchAddresses();
      return data;
    },
    [fetchAddresses]
  );

  const deleteAddress = useCallback(
    async (id) => {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const setDefaultAddress = useCallback(
    async (id) => {
      await api.post(`/addresses/${id}/default`);
      await fetchAddresses();
    },
    [fetchAddresses]
  );

  const refreshPrimary = useCallback(async () => {
    if (!user) {
      return null;
    }
    try {
      const { data } = await api.get('/addresses/primary');
      setPrimaryAddress(data);
      return data;
    } catch (err) {
      console.warn('No primary address yet');
      return null;
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses, user]);

  const value = useMemo(
    () => ({
      addresses,
      primaryAddress,
      loadingAddresses,
      error,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      refreshPrimary,
    }),
    [
      addresses,
      primaryAddress,
      loadingAddresses,
      error,
      fetchAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      refreshPrimary,
    ]
  );

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
};

export const useAddresses = () => useContext(AddressContext);
