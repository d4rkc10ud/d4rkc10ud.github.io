const terminal = document.querySelector('#terminal');
const cv = document.querySelector('#static-cv');
const result = document.querySelector('#result');
const input = document.querySelector('#command');
const echo = document.querySelector('#command-echo');
const shortcuts = [...document.querySelectorAll('[data-command]')];
const sections = new Map([...cv.querySelectorAll('section')].map(section => [section.id, section]));
const history = [];
let position = 0;
let draft = '';

function run(command) {
  result.replaceChildren();
  if (command === 'help') {
    const descriptions = {
      about: 'Read my professional summary',
      experience: 'View roles and responsibilities',
      projects: 'Explore projects and achievements',
      skills: 'View technical skills and tools',
      certs: 'View certifications and training',
      education: 'View education and languages',
      contact: 'Find my LinkedIn profile',
      all: 'Read the full CV',
      help: 'List available commands',
      clear: 'Clear the output'
    };
    const list = document.createElement('dl');
    list.className = 'help-commands';
    for (const [name, description] of Object.entries(descriptions)) {
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = name;
      detail.textContent = description;
      list.append(term, detail);
    }
    result.append(list);
  } else if (command === 'all') {
    for (const section of sections.values()) appendSection(section);
  } else if (sections.has(command)) {
    appendSection(sections.get(command));
  } else if (command !== 'clear') {
    result.textContent = 'Unknown command. Type help to see the available commands.';
  }
  for (const button of shortcuts) {
    button.setAttribute('aria-pressed', String(button.dataset.command === command));
  }
  result.classList.remove('flash');
  requestAnimationFrame(() => result.classList.add('flash'));
}

function appendSection(section) {
  const copy = section.cloneNode(true);
  copy.removeAttribute('id');
  result.append(copy);
}

function submit(value) {
  const command = value.trim().toLowerCase();
  if (!command) return;
  if (history.at(-1) !== command) history.push(command);
  position = history.length;
  draft = '';
  input.value = '';
  echo.hidden = command === 'clear';
  echo.textContent = '└─$ ' + command;
  run(command);
}

document.querySelector('#prompt').addEventListener('submit', event => {
  event.preventDefault();
  submit(input.value);
});
for (const button of shortcuts) {
  button.addEventListener('click', () => submit(button.dataset.command));
}
input.addEventListener('keydown', event => {
  if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !history.length) return;
  event.preventDefault();
  if (event.key === 'ArrowUp' && position === history.length) draft = input.value;
  const direction = event.key === 'ArrowUp' ? -1 : 1;
  position = Math.min(history.length, Math.max(0, position + direction));
  input.value = history[position] ?? draft;
});

cv.open = false;
terminal.hidden = false;
echo.textContent = '└─$ help';
echo.hidden = false;
run('help');

const backdrop = document.querySelector('.backdrop');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let pointerFrame = 0;
let pointerX = 0;
let pointerY = 0;

window.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    if (reducedMotion.matches) return;
    const x = pointerX / innerWidth;
    const y = pointerY / innerHeight;
    backdrop.style.setProperty('--pan-x', ((x - .5) * 48) + 'px');
    backdrop.style.setProperty('--pan-y', ((y - .5) * 48) + 'px');
  });
}, { passive: true });

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) backdrop.removeAttribute('style');
});
