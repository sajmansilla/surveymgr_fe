import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const SurveyForm = () => {
  const { survey_id, token } = useParams(); // Get params from URL
  const navigate = useNavigate(); // Hook to redirect to error page
  const [loading, setLoading] = useState(true); // To manage loading state
  const [isTokenValid, setIsTokenValid] = useState(false); // To manage token validation

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Aquí debes hacer una llamada a tu API para validar el token.
        // A continuación hay un ejemplo de llamada usando fetch.
        const apiUrl = import.meta.env.VITE_API_URL
        const response = await fetch(`${apiUrl}/validate-token/${survey_id}/${token}`);
        
        if (response.ok) {
          // Si el token es válido, redirigir al usuario a la encuesta
          setIsTokenValid(true);
        } else {
          // Si el token no es válido, redirigir a la página de error
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Error al validar el token:', error);
        setIsTokenValid(false); // Si ocurre algún error, considerarlo como inválido
      } finally {
        setLoading(false); // Cambiar estado de carga
      }
    };

    // Llamar a la función de validación al montar el componente
    validateToken();
  }, [survey_id, token]);

  useEffect(() => {
    if (!loading && !isTokenValid) {
      // Si el token es inválido y la carga ha terminado, redirigir a la página de error
      navigate('/error'); // Redirige a la página de error
    }
  }, [loading, isTokenValid, navigate]);

  if (loading) {
    return <div>Loading...</div>; // O puedes mostrar una pantalla de carga
  }

  if (!isTokenValid) {
    return null; // El redireccionamiento ocurrirá antes de que se renderice el contenido
  }

  // Aquí iría la lógica para mostrar la encuesta si el token es válido
  return (
    <div>
      <h1>Survey Preview</h1>
      <p>Survey ID: {survey_id}</p>
      <p>Token: {token}</p>
      {/* Aquí va el contenido de la encuesta */}
    </div>
  );
};

export default SurveyForm;
