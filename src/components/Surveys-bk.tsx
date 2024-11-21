'use client'

import { useState, useEffect } from 'react'
import { Users, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useNavigate } from 'react-router-dom'

// Type for the survey data
interface Survey {
  id: string
  name: string
  createdBy: string
  createdAt: string
  teamNames: string[]
  participantCount: number
  responseCount: number
  responseRate: number
  dateStart: string
  dateEnd: string
}

function getQuarter(name: string): string {
  const month = name.toLowerCase()
  if (month.includes('01') || month.includes('02') || month.includes('03')) return 'Q1'
  if (month.includes('04') || month.includes('05') || month.includes('06')) return 'Q2'
  if (month.includes('07') || month.includes('08') || month.includes('09')) return 'Q3'
  if (month.includes('10') || month.includes('11') || month.includes('12')) return 'Q4'
  return 'Q?'
}

const SurveyDashboard: React.FC = () => {
  const [surveyData, setSurveyData] = useState<Survey[]>([]) // State to store all survey data
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]) // State for filtered survey data
  const [filter, setFilter] = useState<string>('all') // State to store selected filter
  const navigate = useNavigate()

  // Fetch survey data including participants, responses, and teams
  useEffect(() => {
    const fetchSurveyData = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://surveymgr-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/survey-dashboard`)
      const data = await response.json()
      setSurveyData(data.surveys)
      setFilteredSurveys(data.surveys) // Initialize filtered surveys with all surveys
    }

    fetchSurveyData()
  }, [])

  // Filter surveys based on the selected filter
  useEffect(() => {
    const today = new Date()
    let filtered: Survey[] = []

    if (filter === 'active') {
      filtered = surveyData.filter(survey => new Date(survey.dateEnd) > today)
    } else if (filter === 'completed') {
      filtered = surveyData.filter(survey => new Date(survey.dateEnd) <= today)
    } else if (filter === 'draft') {
      filtered = surveyData.filter(survey => !survey.dateEnd) // Assuming no end date means draft
    } else {
      filtered = surveyData // Show all surveys when 'all' is selected
    }

    setFilteredSurveys(filtered)
  }, [filter, surveyData])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Surveys</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/create-survey')}>
          <Plus className="mr-2 h-4 w-4" /> Create new
        </Button>
      </div>
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
              <SelectItem value="draft">Draft surveys</SelectItem>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Name</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Responses</TableHead>
            <TableHead>%</TableHead>
            <TableHead>Date Start</TableHead>
            <TableHead>Date End</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSurveys.map(survey => (
            <TableRow key={survey.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {getQuarter(survey.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{survey.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Created by {survey.createdBy}, {survey.createdAt}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {survey.teamNames && survey.teamNames.length > 0 ? (
                  <div className="flex -space-x-2">
                    {survey.teamNames.map((teamName, i) => (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar key={i} className="w-8 h-8 border-2 border-background">
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default SurveyDashboard
