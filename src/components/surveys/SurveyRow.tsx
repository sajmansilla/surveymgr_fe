import { TableCell, TableRow } from "@/components/ui/table";
import SurveyAvatar from './SurveyAvatar';
import { Users, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getQuarter } from "./utils";
import { Survey } from '@/types';
import { useState } from "react";

interface SurveyRowProps {
  survey: Survey;
}

const SurveyRow: React.FC<SurveyRowProps> = ({ survey }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate(); // Hook para navegar a otra ruta

  return (
    <TableRow 
      key={survey.id}
      onClick={() => navigate(`/view-survey/${encodeURIComponent(survey.id)}`)} // Navegar a la página de edición
      className="cursor-pointer hover:bg-gray-100" // Cambiar el fondo al pasar el mouse
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Link to={`/survey/${encodeURIComponent(survey.id)}`} className="block">
            <div 
              className="relative w-10 h-10 rounded bg-primary text-primary-foreground flex items-center justify-center font-semibold"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              aria-label={`Go to survey: ${survey.id}`}
              onClick={(e) => e.stopPropagation()} // Evitar conflicto con el evento de fila
            >
              {getQuarter(survey.name)}
              {isHovered && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
                </div>
              )}
            </div>
          </Link>
          <div className="flex flex-col">
            <span className="font-medium text-left">{survey.name} – {survey.description}</span>
            <span className="text-sm text-muted-foreground text-left">
              Created by {survey.createdBy || '<<Unknown>>'}, {survey.createdAt.split(',')[0]}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {survey.teamNames && survey.teamNames.length > 0 ? (
          <div className="flex -space-x-2">
            {survey.teamNames.map((teamName, i) => (
              <SurveyAvatar key={i} teamName={teamName} />
            ))}
          </div>
        ) : (
          <Users className="text-muted-foreground w-4 h-4" />
        )}
      </TableCell>
      <TableCell>{survey.participantCount}</TableCell>
      <TableCell>{survey.responseCount}</TableCell>
      <TableCell>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${survey.responseRate}%` }}></div>
        </div>
        <span className="text-xs text-gray-500">{survey.responseRate}%</span>
      </TableCell>
      <TableCell>{survey.dateStart}</TableCell>
      <TableCell>{survey.dateEnd}</TableCell>
    </TableRow>
  );
};

export default SurveyRow;
