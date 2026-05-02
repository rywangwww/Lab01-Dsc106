import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = (await fetchJSON('../lib/projects.json')) ?? [];
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');
let query = '';
let selectedIndex = -1;
let selectedYear = null;

function updateProjectTitle(count) {
  if (projectsTitle) {
    projectsTitle.textContent = `Projects (${count})`;
  }
}

function filterProjectsByQuery(projectsGiven) {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return projectsGiven;
  }

  return projectsGiven.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(normalizedQuery);
  });
}

function renderPieChart(projectsGiven) {
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  const rolledData = d3
    .rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    )
    .sort(([yearA], [yearB]) => d3.descending(String(yearA), String(yearB)));

  const data = rolledData.map(([year, count]) => {
    return { value: count, label: String(year) };
  });

  selectedIndex = data.findIndex((d) => d.label === selectedYear);

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedYear = selectedYear === data[i].label ? null : data[i].label;
        renderPage();
      });
  });

  data.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color: ${colors(i)}`)
      .attr('class', `legend-item${i === selectedIndex ? ' selected' : ''}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        renderPage();
      });
  });
}

function renderPage() {
  const searchedProjects = filterProjectsByQuery(projects);

  if (
    selectedYear &&
    !searchedProjects.some((project) => String(project.year) === selectedYear)
  ) {
    selectedYear = null;
    selectedIndex = -1;
  }

  const visibleProjects = selectedYear
    ? searchedProjects.filter((project) => String(project.year) === selectedYear)
    : searchedProjects;

  renderProjects(visibleProjects, projectsContainer, 'h2');
  renderPieChart(searchedProjects);
  updateProjectTitle(visibleProjects.length);
}

searchInput?.addEventListener('input', (event) => {
  query = event.target.value;
  renderPage();
});

renderPage();
