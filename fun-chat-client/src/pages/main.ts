import { ws } from '../services/websocket';
import { navigate } from '../router';

let selectedUser: string | null = null;

interface Message {
  from: string;
  to: string;
  text: string;
  datetime: number;
  id: string;
  status: {
    isDelivered: boolean;
    isReaded: boolean;
    isEdited: boolean;
    isDeleted?: boolean;
  };
}

interface User {
  login: string;
  isLogined: boolean;
}

let activeUsers: User[] = [];
let inactiveUsers: User[] = [];
const readTimestamps: Record<string, number> = {};

function renderUserList(searchTerm: string = ''): void {
  const listEl = document.getElementById('user-list') as HTMLUListElement;
  if (!listEl) return;

  listEl.innerHTML = '';
  const currentUser = localStorage.getItem('user');

  const combinedUsers = [
    ...activeUsers.map(u => ({ ...u, isLogined: true })),
    ...inactiveUsers.map(u => ({ ...u, isLogined: false })),
  ];

  const filtered = combinedUsers
    .filter(u => u.login !== currentUser)
    .filter(u => u.login.toLowerCase().includes(searchTerm.toLowerCase()));

  filtered.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = `${user.login} ${user.isLogined ? '🟢' : '🔴'}`;
    li.dataset.username = user.login;
    li.style.cursor = 'pointer';

    li.addEventListener('click', () => {
      selectedUser = user.login;
      updateChatTitle();
      ws.send({
        id: null,
        type: 'MSG_FROM_USER',
        payload: { user: { login: selectedUser } },
      });
    });

    listEl.appendChild(li);
  });
}

function updateChatTitle(): void {
  const titleEl = document.getElementById('chat-title') as HTMLElement;
  if (!titleEl || !selectedUser) return;

  const allUsers = [
    ...activeUsers.map(u => ({ ...u, isLogined: true })),
    ...inactiveUsers.map(u => ({ ...u, isLogined: false })),
  ];
  const selected = allUsers.find(u => u.login === selectedUser);
  const status = selected?.isLogined ? '🟢' : '🔴';

  titleEl.textContent = `Chat with ${selectedUser} ${status}`;
}

function handleEditMessage(messageId: string): void {
  const msgDiv = document.querySelector(`[data-msg-id="${messageId}"]`) as HTMLDivElement;
  if (!msgDiv) return;

  const msgTextEl = msgDiv.querySelector('.msg-text') as HTMLSpanElement;
  const originalText = msgTextEl.textContent || '';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalText;
  input.style.width = '80%';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 Save';
  saveBtn.addEventListener('click', () => {
    const newText = input.value.trim();
    if (newText && newText !== originalText) {
      ws.send({
        id: crypto.randomUUID(),
        type: 'MSG_EDIT',
        payload: {
          message: {
            id: messageId,
            text: newText,
          },
        },
      });
    }
  });

  msgTextEl.replaceWith(input);
  msgDiv.querySelector('.edit-btn')?.replaceWith(saveBtn);
}

function handleDeleteMessage(messageId: string): void {
  const msgDiv = document.querySelector(`[data-msg-id="${messageId}"]`);
  if (!msgDiv) {
    console.warn('[Delete] No message div found for ID:', messageId);
    return;
  }

  if (msgDiv.querySelector('.confirm-delete-btn')) {
    console.log('[Delete] Confirmation already shown.');
    return;
  }

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm Delete';
  confirmBtn.className = 'confirm-delete-btn';
  confirmBtn.style.marginLeft = '0.5rem';

  confirmBtn.addEventListener('click', () => {
    console.log('[Delete] Sending MSG_DELETE for ID:', messageId);

    ws.send({
      id: crypto.randomUUID(),
      type: 'MSG_DELETE',
      payload: {
        message: { id: messageId },
      },
    });

    confirmBtn.remove();
  });

  msgDiv.appendChild(confirmBtn);
}


function generateMessageHTML(msg: Message, currentUser: string, lastRead: number, dividerInserted: boolean): { html: string, insertDivider: boolean } {
  const isOwnMessage = msg.from === currentUser;
  const isUnread = msg.datetime > lastRead && msg.from !== currentUser;

  const statusText = isOwnMessage
    ? `${msg.status.isReaded ? 'Read' : 'Delivered'}`
    : '';

  const msgHtml = `
    <div data-msg-id="${msg.id}" style="margin-bottom: 0.5rem;">
      <p>
        <strong>${isOwnMessage ? 'You' : msg.from}:</strong>
        <span class="msg-text">${msg.status.isDeleted ? '<i>(message deleted)</i>' : msg.text}</span>
        <br />
        <small>${new Date(msg.datetime).toLocaleTimeString()} 
          ${msg.status.isEdited ? '(edited)' : ''} ${statusText}
        </small>
      </p>
      ${isOwnMessage && !msg.status.isDeleted ? `
        <button class="edit-btn"> Edit</button>
        <button class="delete-btn"> Delete</button>
      ` : ''}
    </div>
  `;

  return {
    html: isUnread && !dividerInserted ? `<hr id="unread-divider" style="border: 1px solid #aaa;" />${msgHtml}` : msgHtml,
    insertDivider: isUnread && !dividerInserted,
  };
}

function attachMessageActionListeners(): void {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const msgDiv = (e.target as HTMLElement).closest('[data-msg-id]');
      if (msgDiv) handleEditMessage(msgDiv.getAttribute('data-msg-id')!);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const msgDiv = (e.target as HTMLElement).closest('[data-msg-id]');
      if (msgDiv) handleDeleteMessage(msgDiv.getAttribute('data-msg-id')!);
    });
  });
}

function setupUnreadDividerHandler(): void {
  const divider = document.getElementById('unread-divider');
  if (!divider) return;

  const clearDivider = () => {
    divider.remove();
    if (selectedUser) readTimestamps[selectedUser] = Date.now();
  };

  const chat = document.getElementById('chat-history')!;
  chat.addEventListener('scroll', clearDivider, { once: true });
  chat.addEventListener('click', clearDivider, { once: true });
  const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
  sendBtn?.addEventListener('click', clearDivider, { once: true });
}

function renderChatHistory(messages: Message[]): void {
  const historyEl = document.getElementById('chat-history') as HTMLDivElement;
  if (!historyEl || !selectedUser) return;

  const currentUser = localStorage.getItem('user')!;
  const lastRead = readTimestamps[selectedUser] || 0;
  let dividerInserted = false;

  const chatMessages = messages.length === 0
    ? '<p>This is the beginning of the dialogue.</p>'
    : messages.map(msg => {
        const { html, insertDivider } = generateMessageHTML(msg, currentUser, lastRead, dividerInserted);
        if (insertDivider) dividerInserted = true;
        return html;
      }).join('');

  historyEl.innerHTML = chatMessages;
  setTimeout(() => historyEl.scrollTop = historyEl.scrollHeight, 0);

  attachMessageActionListeners();
  setupUnreadDividerHandler();
}


function renderLayout(user: string): void {
  document.body.innerHTML = `
    <header>
      <h2>Fun Chat</h2>
      <p id="current-user">Logged in as: <strong>${user}</strong></p>
      <nav style="margin-bottom: 1rem;">
        <a href="/about">About</a>
        <button id="logout-btn" style="margin-left: 1rem;">Logout</button>
      </nav>
    </header>
    <main style="display: flex;">
      <aside style="width: 30%; border-right: 1px solid #ccc; padding: 0.5rem;">
        <h3>Users</h3>
        <input type="text" id="user-search" placeholder="Search users..." style="width: 100%; margin-bottom: 0.5rem;" />
        <ul id="user-list"></ul>
      </aside>
      <section style="width: 70%; padding: 0.5rem;">
        <h3 id="chat-title">Chat</h3>
        <div id="chat-history" style="height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 0.5rem;"></div>
        <textarea id="message-input" rows="2" style="width: 100%; margin-top: 0.5rem;"></textarea>
        <button id="send-btn">Send</button>
      </section>
    </main>
    <p>
      <img src="/images/images.png" alt="Logo" style="height: 20px; vertical-align: middle; margin-right: 8px;" />
      RS School © 2025 Fun Chat by <a href="https://github.com/yuliyakim01" target="_blank" rel="noopener noreferrer">Yuliya Kim</a>
    </p>
  `;
}

function attachEventListeners(user: string): void {
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    ws.send({ id: null, type: 'USER_LOGOUT', payload: { user: { login: user } } });
    localStorage.removeItem('user');
    navigate('/login');
  });

  const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
  const messageInput = document.getElementById('message-input') as HTMLTextAreaElement;

  messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendBtn.click();
    }
  });

  sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (!text || !selectedUser) return;

    ws.send({
      id: crypto.randomUUID(),
      type: 'MSG_SEND',
      payload: {
        message: {
          to: selectedUser,
          text,
        },
      },
    });

    messageInput.value = '';
  });

  const searchInput = document.getElementById('user-search') as HTMLInputElement;
  searchInput?.addEventListener('input', () => {
    renderUserList(searchInput.value);
  });
}

function initializeWebSocketHandlers(user: string): void {
  ws.onMessage((data) => {
    if (data.type === 'USER_ACTIVE' && data.payload?.users) {
      activeUsers = data.payload.users;
      renderUserList((document.getElementById('user-search') as HTMLInputElement)?.value || '');
    }

    if (data.type === 'USER_INACTIVE' && data.payload?.users) {
      inactiveUsers = data.payload.users;
      renderUserList((document.getElementById('user-search') as HTMLInputElement)?.value || '');
    }

    if (data.type === 'USER_EXTERNAL_LOGIN' || data.type === 'USER_EXTERNAL_LOGOUT') {
      ws.send({ id: null, type: 'USER_ACTIVE', payload: null });
      ws.send({ id: null, type: 'USER_INACTIVE', payload: null });
    }

    if (
      data.type === 'MSG_FROM_USER' &&
      data.payload?.messages &&
      selectedUser &&
      data.payload.messages.some((m: Message) =>
        (m.from === selectedUser && m.to === user) ||
        (m.from === user && m.to === selectedUser))
    ) {
      updateChatTitle();

      const unreadMessageIds = data.payload.messages
        .filter((m: Message) => m.from === selectedUser && !m.status.isReaded)
        .map((m: Message) => m.id);

      if (unreadMessageIds.length > 0) {
        readTimestamps[selectedUser] = Date.now();
        ws.send({
          id: crypto.randomUUID(),
          type: 'MSG_READ',
          payload: { messageIds: unreadMessageIds },
        });
      }

      renderChatHistory(data.payload.messages);
    }
    if (data.type === 'MSG_SEND') {
      const msg = data.payload?.message;
      if (!msg) return;
    
      const isRelated =
        (msg.from === selectedUser && msg.to === user) ||
        (msg.from === user && msg.to === selectedUser);
    
      if (isRelated && selectedUser) {
        ws.send({
          id: null,
          type: 'MSG_FROM_USER',
          payload: { user: { login: selectedUser } },
        });
      }
    }
    

    if (['MSG_EDIT', 'MSG_DELETE'].includes(data.type) && selectedUser) {
      ws.send({
        id: null,
        type: 'MSG_FROM_USER',
        payload: { user: { login: selectedUser } },
      });
    }
    
  });

  ws.send({ id: null, type: 'USER_ACTIVE', payload: null });
  ws.send({ id: null, type: 'USER_INACTIVE', payload: null });
}

export function renderMainPage(): void {
  const user = localStorage.getItem('user');
  if (!user) {
    navigate('/login');
    return;
  }

  renderLayout(user);
  attachEventListeners(user);
  initializeWebSocketHandlers(user);
}
