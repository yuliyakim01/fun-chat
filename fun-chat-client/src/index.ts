import { addRoute, renderRoute } from './router';
import { renderLoginPage } from './pages/login';
import { renderMainPage } from './pages/main';
import { renderAboutPage } from './pages/about';

// Define routes
addRoute('/', renderLoginPage);
addRoute('/login', renderLoginPage);
addRoute('/main', renderMainPage);
addRoute('/about', renderAboutPage);

document.addEventListener('DOMContentLoaded', () => {
  renderRoute(location.pathname);
});
