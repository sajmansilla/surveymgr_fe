export default function Header() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <img
        src="/survey_logo.svg"
        alt="SurveyMGR Logo"
        className="w-auto h-24 logo"
      />
      <h1 className="text-3xl md:text-5xl tracking-tight font-body font-bold">
        {'{ '}CoFa ACs SurveyMGR{' };'}
      </h1>
    </div>
  );
}
