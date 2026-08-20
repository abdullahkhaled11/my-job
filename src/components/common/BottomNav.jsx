import { NavLink } from 'react-router-dom';
import { Home, ListOrdered, FileBarChart, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/log', label: 'السجل', icon: ListOrdered },
  { to: '/reports', label: 'التقارير', icon: FileBarChart },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
];

export function BottomNav() {
  return (
    <div className="bottom-nav-container">
      <div className="bottom-nav-pill">
        <div className="row g-1 text-center align-items-center">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <div key={to} className="col-3">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-item-btn ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={22} className="nav-icon" />
                <span className="nav-title">{label}</span>
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
