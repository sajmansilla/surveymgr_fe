export async function fetchSurveyData(
  survey_id: number,
  setSurveyData: (data: any) => void) {
  try {
    const response = await fetch(`/api/surveyedit/${survey_id}`);
    if (!response.ok) throw new Error("Error fetching survey data");
    const data = await response.json();
    setSurveyData(data);
  } catch (error) {
    console.error(error);
  }
}
