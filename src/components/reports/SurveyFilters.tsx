import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SurveyFiltersProps {
  filter: string
  setFilter: (value: string) => void
}

const SurveyFilters: React.FC<SurveyFiltersProps> = ({ filter, setFilter }) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All surveys" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All surveys</SelectItem>
            <SelectItem value="active">Active surveys</SelectItem>
            <SelectItem value="completed">Completed surveys</SelectItem>
            <SelectItem value="future">Future surveys</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select defaultValue="anyone">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Owned by anyone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="anyone">Owned by anyone</SelectItem>
          <SelectItem value="me">Owned by me</SelectItem>
          <SelectItem value="shared">Shared with me</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground">Sort by</span>
        <Select defaultValue="last-opened">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Last opened" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-opened">Last opened</SelectItem>
            <SelectItem value="created">Created date</SelectItem>
            <SelectItem value="modified">Modified date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default SurveyFilters
