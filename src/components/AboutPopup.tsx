import React from "react";

interface AboutPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  name: string;
  role: string;
  email: string;
}

const team: TeamMember[] = [
  { name: "Sebastián Mansilla", role: "Ideation & Development", email: "sebastian.mansilla@dkbcodefactory.com" },
  { name: "Enas Nasr", role: "Ideation & Development", email: "enas.nasr@dkbcodefactory.com" },
  { name: "Marianna Shults", role: "Visual Design", email: "marianna.shults@dkbcodefactory.com" },
  { name: "Simon Alexander Malessa", role: "DevOps Sorcery", email: "simonalexander.malessa@dkb.de" },
];

const AboutPopup: React.FC<AboutPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#031320] text-white p-6 rounded-lg shadow-lg w-3/4 max-w-lg">
        <h2 className="text-2xl font-bold mb-4">About the Team</h2>
        <p className="text-base mb-6">
          This app was created by a dedicated team of people:
        </p>
        <ul className="space-y-2">
          {team.map((member) => (
            <li key={member.email}>
              <a
                href={`mailto:${member.email}`}
                className="text-blue-400 hover:underline hover:text-blue-300"
              >
                {member.name}
              </a>{" "}
              - {member.role}
            </li>
          ))}
        </ul>
        <button
          className="mt-4 bg-primary text-primary-foreground py-2 px-4 rounded hover:bg-primary-foreground hover:text-primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AboutPopup;
