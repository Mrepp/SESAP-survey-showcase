import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Review } from './pages/Review';
import { AuthError } from './pages/AuthError';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth-error" element={<AuthError />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/interview/:id" element={<Review />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
