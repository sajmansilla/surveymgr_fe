import { useState, useEffect } from 'react';

const useFetchSurveyData = (id: string) => {
  const [surveyData, setSurveyData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const apiUrl =
    import.meta.env.VITE_API_URL || "https://surveymgr-production.up.railway.app";

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        // Fetch survey data
        const surveyResponse = await fetch(`${apiUrl}/api/survey/${id}`);
        if (!surveyResponse.ok) {
          throw new Error(`Survey fetch failed with status: ${surveyResponse.status}`);
        }
        const survey = await surveyResponse.json();
        setSurveyData(survey.survey);

        // Fetch categories
        const categoryResponse = await fetch(`${apiUrl}/api/categories`);
        if (!categoryResponse.ok) {
          throw new Error(`Category fetch failed with status: ${categoryResponse.status}`);
        }

        const categoryData = await categoryResponse.json();

        if (categoryData && categoryData.category) {
          setCategories(categoryData.category);
        } else {
          console.error("Categories not found in response");
        }

        // Fetch questions
        const questionResponse = await fetch(`${apiUrl}/api/questions`);
        if (!questionResponse.ok) {
          throw new Error(`Question fetch failed with status: ${questionResponse.status}`);
        }
        const questionData = await questionResponse.json();
        setQuestions(questionData.questions);

        // Fetch teams
        const teamResponse = await fetch(`${apiUrl}/api/teams`);
        if (!teamResponse.ok) {
          throw new Error(`Team fetch failed with status: ${teamResponse.status}`);
        }
        const teamData = await teamResponse.json();
        setTeams(teamData.teams);

        // Fetch members
        const memberResponse = await fetch(`${apiUrl}/api/teammembers`);
        if (!memberResponse.ok) {
          throw new Error(`Member fetch failed with status: ${memberResponse.status}`);
        }

        const memberData = await memberResponse.json();
        
        setMembers(memberData.members);

        const memberPromises = memberData.members.map(async (member: any) => {
          const personResponse = await fetch(`${apiUrl}/api/people/${member.person_id}`);
          if (!personResponse.ok) {
            throw new Error(`Person fetch failed with status: ${personResponse.status}`);
          }
          const personData = await personResponse.json();
          return { ...member, ...personData.person };
        });

        const allMembers = await Promise.all(memberPromises);

        setMembers(allMembers);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchSurveyData();
  }, [id]);

  return { surveyData, categories, questions, teams, members };
};

export default useFetchSurveyData;
