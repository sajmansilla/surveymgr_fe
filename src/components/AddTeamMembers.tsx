import { useState, useEffect } from 'react';

interface Team {
  id: number;
  team_name: string;
}

interface Person {
  id: number;
  name: string;
  email: string;
}

interface TeamMember {
  team_id: number;
  person_id: number;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {

    const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const [teamsRes, peopleRes, membersRes] = await Promise.all([
          fetch(`${apiUrl}/api/teams`),
          fetch(`${apiUrl}/api/people`),
          fetch(`${apiUrl}/api/teammembers`)
        ]).then(responses => Promise.all(responses.map(response => response.json())));

        setTeams(teamsRes.teams);
        setPeople(peopleRes.people);
        setTeamMembers(membersRes.members);
        setLoading(false);
      } catch (err) {
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isMember = (personId: number, teamId: number) => {
    return teamMembers.some(member => member.person_id === personId && member.team_id === teamId);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#031320] text-white font-mono flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#031320] text-white font-mono flex items-center justify-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#031320] text-white font-mono p-8">
      <h1 className="text-4xl mb-8 text-center">{'{'} Team Management {'}'}</h1>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-[#0a1925] sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Names</th>
              <th scope="col" className="px-6 py-3">Email</th>
              {teams.map(team => (
                <th key={team.id} scope="col" className="px-6 py-3 text-center">{team.team_name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[#112331]">
            {people.map((person, index) => (
              <tr key={person.id} className={index % 2 === 0 ? 'bg-[#0a1925]' : 'bg-[#112331]'}>
                <td className="px-6 py-4 font-medium whitespace-nowrap">{person.name}</td>
                <td className="px-6 py-4">{person.email}</td>
                {teams.map(team => (
                  <td key={`${person.id}-${team.id}`} className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isMember(person.id, team.id)}
                      readOnly
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}