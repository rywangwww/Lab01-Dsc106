console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch JSON from ${url}: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    return null;
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) {
    return;
  }

  containerElement.innerHTML = '';

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = '<p>No projects available yet.</p>';
    return;
  }

  const level = /^h[1-6]$/i.test(headingLevel) ? headingLevel.toLowerCase() : 'h2';

  for (const project of projects) {
    const article = document.createElement('article');

    const heading = document.createElement(level);
    heading.textContent = project.title ?? 'Untitled project';

    const image = document.createElement('img');
    image.src = project.image ?? 'https://vis-society.github.io/labs/2/images/empty.svg';
    image.alt = project.title ?? 'Project image';

    const details = document.createElement('div');
    details.className = 'project-details';

    const description = document.createElement('p');
    description.textContent = project.description ?? '';

    const year = document.createElement('p');
    year.className = 'project-year';
    year.textContent = project.year ?? '';

    details.append(description, year);

    article.append(heading, image, details);
    containerElement.append(article);
  }
}

export function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

const pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'https://github.com/raymondWRW', title: 'GitHub' },
];

document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `,
);

const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
}

if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', (event) => {
  const colorScheme = event.target.value;
  setColorScheme(colorScheme);
  localStorage.colorScheme = colorScheme;
});

const nav = document.createElement('nav');
document.body.prepend(nav);

function normalizePath(pathname) {
  return pathname.replace(/index\.html$/, '').replace(/\/$/, '');
}

const rootUrl = new URL('./', import.meta.url);

for (const p of pages) {
  let url = p.url;
  const title = p.title;

  if (!url.startsWith('http')) {
    url = new URL(url, rootUrl).href;
  }

  const a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
    'current',
    a.host === location.host &&
      normalizePath(a.pathname) === normalizePath(location.pathname),
  );

  const isExternal = a.host && a.host !== location.host;
  if (isExternal) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  nav.append(a);
}
