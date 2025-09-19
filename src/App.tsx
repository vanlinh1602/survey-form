import { onAuthStateChanged } from '@firebase/auth';
import { lazy, useEffect } from 'react';
import { Route } from 'react-router';
import { BrowserRouter, Routes } from 'react-router';
import { useShallow } from 'zustand/shallow';

import AuthPages from './AuthPages';
import { useSystemStore } from './features/system/hooks';
import { auth } from './services/firebase';
import { ReportsService } from './services/reports';
import { UserService } from './services/user';

const HomePage = lazy(() => import('./pages/Home'));
const FormPage = lazy(() => import('./pages/Form'));
const LoginPage = lazy(() => import('./pages/Login'));
const ExcelPage = lazy(() => import('./pages/Excel'));

function App() {
  const { setUser, userId, setForm, setInfo, setIsLoading } = useSystemStore(
    useShallow((state) => ({
      setUser: state.setUser,
      userId: state.user?.id,
      setForm: state.setForm,
      setInfo: state.setInfo,
      setIsLoading: state.setIsLoading,
    }))
  );

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        UserService.getUser(user)
          .then((userData) => {
            setUser({
              id: userData.id,
              email: userData.email || '',
              isAdmin: userData.isAdmin,
            });
          })
          .catch(() => {
            setUser({
              id: '',
              email: '',
            });
          });
      } else {
        setUser({
          id: '',
          email: '',
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (userId) {
        setIsLoading(true);
        ReportsService.getReport(userId)
          .then((report) => {
            if (report) {
              setForm(report.form);
              setInfo(report.info);
            }
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    } catch {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthPages />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/excel" element={<ExcelPage />} />
            <Route path=":id" element={<FormPage />} />
            <Route
              path="*"
              element={
                <div className="flex h-screen items-center justify-center">
                  <h1 className="text-2xl font-bold mr-2">404</h1>
                  <p className="text-sm text-muted-foreground">
                    Page not found
                  </p>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
