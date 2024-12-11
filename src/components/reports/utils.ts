export function getQuarter(name: string): string {
  const month = name.toLowerCase()
  if (month.includes('01') || month.includes('02') || month.includes('03')) return 'Q1'
  if (month.includes('04') || month.includes('05') || month.includes('06')) return 'Q2'
  if (month.includes('07') || month.includes('08') || month.includes('09')) return 'Q3'
  if (month.includes('10') || month.includes('11') || month.includes('12')) return 'Q4'
  return 'Q?'
}