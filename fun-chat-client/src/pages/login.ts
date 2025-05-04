import { ws } from '../services/websocket';

export function renderLoginPage(): void {
  const app = document.body;
  app.innerHTML = '';

  const container = document.createElement('div');
  container.innerHTML = `
    <h1>Login to Fun Chat</h1>
    <form id="login-form">
      <label>
        Username:
        <input type="text" id="username" required autocomplete="username" />
      </label><br/>
      <label>
        Password:
        <input type="password" id="password" required autocomplete="current-password" />
      </label><br/>
      <button type="submit">Login</button>
    </form>
    <p id="error" style="color: red;"></p>
  `;

  app.appendChild(container);

  const form = document.getElementById('login-form') as HTMLFormElement;
  const errorDisplay = document.getElementById('error') as HTMLParagraphElement;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = (document.getElementById('username') as HTMLInputElement).value.trim();
    const password = (document.getElementById('password') as HTMLInputElement).value.trim();

    if (username.length < 3) {
      errorDisplay.textContent = 'Username must be at least 3 characters.';
      return;
    }

    if (password.length < 6) {
      errorDisplay.textContent = 'Password must be at least 6 characters.';
      return;
    }

    errorDisplay.textContent = '';

    const loginMessage = {
      id: null,
      type: 'USER_LOGIN',
      payload: {
        user: {
          login: username,
          password: password,
        }
      }
    };

    console.log('[LOGIN MESSAGE]', loginMessage);
    ws.send(loginMessage);
  });

  const handler = (data: any) => {
    if (data.type === 'ERROR') {
      const error = data.payload?.error || 'Login failed.';
      console.warn('[LOGIN ERROR]', error);
      errorDisplay.textContent = error;
    }

    if (data.type === 'USER_LOGIN' && data.payload?.user?.login) {
      const username = data.payload.user.login;
      localStorage.setItem('user', username);

      ws.removeOnMessage(handler);

      history.pushState({}, '', '/main');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  ws.onMessage(handler);
}
