import { navigate } from '../router';

export function renderAboutPage(): void {
  document.body.innerHTML = `
    <header>
      <h2>About Fun Chat</h2>
      <nav style="margin-bottom: 1rem;">
        <a href="/login" id="nav-login">Login</a> |
        <a href="/main" id="nav-main">Main</a>
      </nav>
    </header>
    <main style="padding: 1rem;">
      <p><strong>Fun Chat</strong> is a real-time messaging application built using TypeScript, WebSockets, and SPA routing.</p>
      <p>Created by <strong>Yuliya Kim</strong> as part of a frontend engineering project.</p>
      <p>The app includes features like:</p>
      <ul>
        <li>User authentication</li>
        <li>Live message exchange</li>
        <li>Message editing, deletion, and delivery status</li>
        <li>Responsive UI and routing</li>
      </ul>
    </main>
    <footer style="margin-top: 2rem;">
      <p>© 2025 Fun Chat by Yuliya Kim | <a href="https://github.com/yuliyakim01" target="_blank">GitHub</a></p>
    </footer>
  `;

  document.getElementById('nav-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/login');
  });

  document.getElementById('nav-main')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/main');
  });
}
