import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex px-8 py-3 bg-white border-b border-gray-200" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-[14px]">
        <li>
          <div>
            <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Home className="flex-shrink-0 h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-300" aria-hidden="true" />
                <Link
                  to={to}
                  className={`ml-2 text-[14px] font-medium transition-colors ${
                    isLast ? 'text-gray-900 pointer-events-none' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {label}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
