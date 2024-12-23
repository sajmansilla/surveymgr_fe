import { useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const location = useLocation(); // Access location object
  const error = location.state?.error; // Get error from state (optional chaining to prevent errors)

  return (
    <div>
      <h1>Error</h1>
      <p>The link is invalid or expired. Please contact support for help.</p>
      <p>Error message: {error}</p>
    </div>
  );
};

export default ErrorPage;
