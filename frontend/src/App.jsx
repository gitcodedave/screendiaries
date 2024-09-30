import './App.css';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/routes';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';


const App = () => {
  return (
    <>
    <CookiesProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </CookiesProvider>
    </>
  );
}

export default App;