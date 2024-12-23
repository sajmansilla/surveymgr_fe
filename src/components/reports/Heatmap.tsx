import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Heatmap = ({ data, width = 800, height = 400 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    // Filter data for the selected survey_id and include team_name
    const filteredData = data.flatMap((d) =>
      d.scores.map((score) => ({
        teamId: d.teamId,
        team_name: d.team_name, // Include team_name
        category_name: score.category_name,
        score: score.score,
        adviceColor:
          score.adviceColor === "green"
            ? "#4CAF50"
            : score.adviceColor === "red"
            ? "#FF5722"
            : score.adviceColor === "yellow"
            ? "#FF9800"
            : "#FF9800",
      }))
    );

    // Get unique team names and category names
    const teamNames = [...new Set(filteredData.map((d) => d.team_name))];
    const categories = [...new Set(filteredData.map((d) => d.category_name))];

    // Dimensions and margins
    const margin = { top: 20, right: 20, bottom: 50, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear the SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(teamNames)
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleBand()
      .domain(categories)
      .range([0, innerHeight])
      .padding(0.1);

    // Create a group for the heatmap
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Draw heatmap cells
    g.selectAll("rect")
      .data(filteredData)
      .join("rect")
      .attr("x", (d) => xScale(d.team_name))
      .attr("y", (d) => yScale(d.category_name))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => d.adviceColor);

    // Add X-axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)");

    // Add Y-axis
    g.append("g").call(d3.axisLeft(yScale));

    // Add tooltip behavior
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("font-size", "12px") // Set font size
      .style("font-weight", "normal") // Ensure text is not bold
      .style("display", "none");

    g.selectAll("rect")
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `<div>Team: ${d.team_name}</div><div>Category: ${d.category_name}</div><div>Score: ${d.score}</div>`
          )
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY + 5}px`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default Heatmap;
