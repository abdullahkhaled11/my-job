import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductionProvider } from './context/ProductionContext';
import { BottomNav } from './components/common/BottomNav';
import { HomePage } from './pages/HomePage';
import { LinePage } from './pages/LinePage';
import { LogPage } from './pages/LogPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from 'sonner';

export function App() {
  return (
    <ProductionProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/line/:lineId" element={<LinePage />} />
            <Route path="/log" element={<LogPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <BottomNav />
          <Toaster position="top-center" dir="rtl" richColors />
        </div>
      </BrowserRouter>
    </ProductionProvider>
  );
}

export default App;
