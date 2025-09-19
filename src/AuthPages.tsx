import { Navigate, Outlet, useLocation } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { useSystemStore } from './features/system/hooks';

const AuthPages = () => {
  const location = useLocation();
  const { user } = useSystemStore(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  if (!user?.id) {
    return <Navigate to={`/login?next=${location.pathname}`} replace />;
  }
  return <Outlet />;
};

export default AuthPages;
