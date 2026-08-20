import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Header({ title, subtitle, backTo, action, children }) {
  return (
    <header className="app-header text-white px-3 py-4 rounded-bottom-4 shadow-sm mb-3">
      <div className="d-flex align-items-center justify-content-between mb-1">
        {backTo ? (
          <Link to={backTo} className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-1 py-1 px-2.5 rounded-pill fw-bold text-decoration-none">
            <ChevronRight size={16} />
            <span>رجوع</span>
          </Link>
        ) : <div />}
        {action && <div>{action}</div>}
      </div>

      <div className="mt-1">
        <h1 className="h4 fw-black mb-1">{title}</h1>
        {subtitle && <p className="small mb-0 text-white-50">{subtitle}</p>}
      </div>

      {children && <div className="mt-3">{children}</div>}
    </header>
  );
}
