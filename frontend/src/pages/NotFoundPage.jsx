import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="notfound-page fade-in">
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-text">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">
            <FiHome size={18} />
            Back to Home
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-ghost">
            <FiArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
