import { useNavigate } from 'react-router-dom';

/**
 * Returns a click handler that navigates to the 404 page.
 * Use this as a placeholder for all buttons/links until real
 * functionality is implemented.
 */
export function usePlaceholder() {
  const navigate = useNavigate();
  return () => navigate('/404');
}
