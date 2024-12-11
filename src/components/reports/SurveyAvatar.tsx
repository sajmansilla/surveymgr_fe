import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SurveyAvatarProps {
  teamName: string
}

const SurveyAvatar: React.FC<SurveyAvatarProps> = ({ teamName }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="w-8 h-8 border-2 border-background">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {teamName.split(" ").map(word => word[0]).join("")}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{teamName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default SurveyAvatar
