import { renderLoginPage } from './pages/login';
import { renderAboutPage } from './pages/about';
import { renderMainPage } from './pages/main';

type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {};

export function addRoute(path: string, handler: RouteHandler): void {
  routes[path] = handler;
}

export function navigate(path: string): void {
  history.pushState({}, '', path);
  renderRoute(path);
}

export function renderRoute(path: string): void {
  if (path === '/login') {
    renderLoginPage();
  } else if (path === '/about') {
    renderAboutPage();
  } else {
    renderMainPage();
  }
}


function renderNotFound(): void {
  document.body.innerHTML = '<h1>404 - Page Not Found</h1>';
}

window.addEventListener('popstate', () => {
  renderRoute(location.pathname);
});
