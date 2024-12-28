import React from "react";
import ReactWordcloud from "react-wordcloud";

interface WordCloudGeneratorProps {
  words: { text: string; value: number }[];
}

const WordCloudGenerator: React.FC<WordCloudGeneratorProps> = ({ words }) => {
  const options = {
    rotations: 0, // Number of rotations
    rotationAngles: [-90, 0], // Angle range for rotations
    fontSizes: [20, 50], // Font size range
    enableTooltip: false, // Disable tooltip
    deterministic: true, // Ensure the word cloud loads the same way every time
  };

  return <ReactWordcloud words={words} options={options} />;
};

export default WordCloudGenerator;
