'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Smile, AlertCircle } from 'lucide-react'

const categories = [
  {
    name: "Goals",
    questions: [
      "We know our scope and understand the priorities.",
      "We know the purpose and goals of our team and work towards them.",
      "We make sure that we work on the most important thing in the right way at any time."
    ]
  },
  // Add more categories here if needed
]

const scaleOptions = [
  { value: '1', label: 'Never' },
  { value: '2', label: 'Rarely' },
  { value: '3', label: 'Sometimes' },
  { value: '4', label: 'Usually' },
  { value: '5', label: 'Always' },
]

const openEndedQuestions = [
  "What aspects of your job do you find most satisfying?",
  "What suggestions do you have for improving our work environment or processes?"
]

// Mock API function to simulate saving the survey responses
const saveSurveyResponses = async (responses: any) => {
  // Simulate API call delay
  console.log('Saving survey responses...', responses);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate API response
  if (Math.random() > 0.1) { // 90% success rate
    return { success: true, message: "Survey responses saved successfully" };
  } else {
    throw new Error("Failed to save survey responses");
  }
}

export default function TeamGaiaSurvey() {
  const [scaleResponses, setScaleResponses] = useState<Record<string, string>>({})
  const [openEndedResponses, setOpenEndedResponses] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const handleScaleResponseChange = (questionId: string, value: string) => {
    setScaleResponses(prev => ({ ...prev, [questionId]: value }))
    setErrors(prev => ({ ...prev, [questionId]: false }))
  }

  const handleOpenEndedResponseChange = (questionId: string, value: string) => {
    setOpenEndedResponses(prev => ({ ...prev, [questionId]: value }))
    setErrors(prev => ({ ...prev, [`open-${questionId}`]: false }))
  }

  const validateResponses = () => {
    const newErrors: Record<string, boolean> = {}
    let isValid = true

    categories.forEach((category, categoryIndex) => {
      category.questions.forEach((_, questionIndex) => {
        const questionId = `${categoryIndex}-${questionIndex}`
        if (!scaleResponses[questionId]) {
          newErrors[questionId] = true
          isValid = false
        }
      })
    })

    openEndedQuestions.forEach((_, index) => {
      if (!openEndedResponses[index.toString()] || openEndedResponses[index.toString()].trim() === '') {
        newErrors[`open-${index}`] = true
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateResponses()) {
      setIsSubmitting(true)
      try {
        const response = await saveSurveyResponses({ scaleResponses, openEndedResponses })
        setSubmitted(true)
        setMessage({ type: 'success', text: response.message })
      } catch (error) {
        setMessage({ type: 'error', text: "There was an error saving your responses. Please try again." })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setMessage({ type: 'error', text: "Please answer all questions, including the open-ended ones, before submitting." })
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>Your responses have been recorded.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Team Gaia Self-Assessment Survey -Q4&apos;24</CardTitle>
          <CardDescription>
            Greetings from your beloved Agile Chapter! <Smile className="inline-block w-5 h-5" />
          </CardDescription>
          <CardDescription>
            As you know, we are constantly reflecting and adapting our ways to support you best. For that, we created this survey to gain a proper picture of the situation and needs of the teams.
          </CardDescription>
          <CardDescription>
            So it would be great if you could take your time to reflect on your personal experiences and impressions within the team. Please be honest and transparent with your feedback. That will help you as a team to know where to put our focus on. <Smile className="inline-block w-5 h-5" />
          </CardDescription>
          <CardDescription>
            <strong>Deadline:</strong> Please fill out the survey till <span className="font-medium">20th Sep 2024</span> <Smile className="inline-block w-5 h-5" />
          </CardDescription>
          <CardDescription className="italic text-muted-foreground">
            NOTE: The answers to this survey are anonymous. The survey results will be handled confidentially and only be used within your team sphere.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-lg font-semibold mb-4">{category.name}</h3>
              {category.questions.map((question, questionIndex) => {
                const questionId = `${categoryIndex}-${questionIndex}`
                return (
                  <div key={questionId} className="mb-4">
                    <Label className="text-base mb-2 block">{question}</Label>
                    <RadioGroup
                      onValueChange={(value: any) => handleScaleResponseChange(questionId, value)}
                      className="flex justify-between"
                    >
                      {scaleOptions.map((option) => (
                        <div key={option.value} className="flex flex-col items-center">
                          <RadioGroupItem
                            value={option.value}
                            id={`q${questionId}-${option.value}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`q${questionId}-${option.value}`}
                            className={`cursor-pointer px-3 py-2 rounded-md text-center text-sm transition-colors ${
                              scaleResponses[questionId] === option.value
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-secondary'
                            }`}
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors[questionId] && (
                      <p className="text-sm text-red-500 flex items-center mt-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        This question is required
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          <div>
            <h3 className="text-lg font-semibold mb-4">Open-Ended Questions</h3>
            {openEndedQuestions.map((question, index) => (
              <div key={index} className="mb-4">
                <Label className="text-base mb-2 block">{question}</Label>
                <Textarea
                  placeholder="Type your answer here..."
                  className={`w-full ${errors[`open-${index}`] ? 'border-red-500' : ''}`}
                  onChange={(e) => handleOpenEndedResponseChange(index.toString(), e.target.value)}
                />
                {errors[`open-${index}`] && (
                  <p className="text-sm text-red-500 flex items-center mt-2">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    This question is required
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        {message && (
          <div className={`p-4 mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}