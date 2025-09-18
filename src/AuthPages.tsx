import { Navigate, Outlet } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { useSystemStore } from './features/system/hooks';

const AuthPages = () => {
  const { user } = useSystemStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  if (!user?.id) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default AuthPages;
