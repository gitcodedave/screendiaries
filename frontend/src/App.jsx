import './App.css';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/routes';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';


const App = () => {
  return (
    <>
    <div className='main'>
    <CookiesProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </CookiesProvider>
    </div>
    </>
  );
}

export default App;