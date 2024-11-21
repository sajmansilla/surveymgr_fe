// Type for the survey data
export interface Survey {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: string
  teamNames: string[]
  participantCount: number
  responseCount: number
  responseRate: number
  dateStart: string
  dateEnd: string
}
