/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/pages/about.ts":
/*!****************************!*\
  !*** ./src/pages/about.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   renderAboutPage: () => (/* binding */ renderAboutPage)
/* harmony export */ });
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../router */ "./src/router.ts");

function renderAboutPage() {
    var _a, _b;
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
    (_a = document.getElementById('nav-login')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (e) => {
        e.preventDefault();
        (0,_router__WEBPACK_IMPORTED_MODULE_0__.navigate)('/login');
    });
    (_b = document.getElementById('nav-main')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (e) => {
        e.preventDefault();
        (0,_router__WEBPACK_IMPORTED_MODULE_0__.navigate)('/main');
    });
}


/***/ }),

/***/ "./src/pages/login.ts":
/*!****************************!*\
  !*** ./src/pages/login.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   renderLoginPage: () => (/* binding */ renderLoginPage)
/* harmony export */ });
/* harmony import */ var _services_websocket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/websocket */ "./src/services/websocket.ts");

function renderLoginPage() {
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
    const form = document.getElementById('login-form');
    const errorDisplay = document.getElementById('error');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
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
        _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send(loginMessage);
    });
    const handler = (data) => {
        var _a, _b, _c;
        if (data.type === 'ERROR') {
            const error = ((_a = data.payload) === null || _a === void 0 ? void 0 : _a.error) || 'Login failed.';
            console.warn('[LOGIN ERROR]', error);
            errorDisplay.textContent = error;
        }
        if (data.type === 'USER_LOGIN' && ((_c = (_b = data.payload) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.login)) {
            const username = data.payload.user.login;
            localStorage.setItem('user', username);
            _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.removeOnMessage(handler);
            history.pushState({}, '', '/main');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    };
    _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.onMessage(handler);
}


/***/ }),

/***/ "./src/pages/main.ts":
/*!***************************!*\
  !*** ./src/pages/main.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   renderMainPage: () => (/* binding */ renderMainPage)
/* harmony export */ });
/* harmony import */ var _services_websocket__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/websocket */ "./src/services/websocket.ts");
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../router */ "./src/router.ts");


let selectedUser = null;
let activeUsers = [];
let inactiveUsers = [];
const readTimestamps = {};
function renderUserList(searchTerm = '') {
    const listEl = document.getElementById('user-list');
    if (!listEl)
        return;
    listEl.innerHTML = '';
    const currentUser = localStorage.getItem('user');
    const combinedUsers = [
        ...activeUsers.map(u => (Object.assign(Object.assign({}, u), { isLogined: true }))),
        ...inactiveUsers.map(u => (Object.assign(Object.assign({}, u), { isLogined: false }))),
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
            _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({
                id: null,
                type: 'MSG_FROM_USER',
                payload: { user: { login: selectedUser } },
            });
        });
        listEl.appendChild(li);
    });
}
function updateChatTitle() {
    const titleEl = document.getElementById('chat-title');
    if (!titleEl || !selectedUser)
        return;
    const allUsers = [
        ...activeUsers.map(u => (Object.assign(Object.assign({}, u), { isLogined: true }))),
        ...inactiveUsers.map(u => (Object.assign(Object.assign({}, u), { isLogined: false }))),
    ];
    const selected = allUsers.find(u => u.login === selectedUser);
    const status = (selected === null || selected === void 0 ? void 0 : selected.isLogined) ? '🟢' : '🔴';
    titleEl.textContent = `Chat with ${selectedUser} ${status}`;
}
function handleEditMessage(messageId) {
    var _a;
    const msgDiv = document.querySelector(`[data-msg-id="${messageId}"]`);
    if (!msgDiv)
        return;
    const msgTextEl = msgDiv.querySelector('.msg-text');
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
            _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({
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
    (_a = msgDiv.querySelector('.edit-btn')) === null || _a === void 0 ? void 0 : _a.replaceWith(saveBtn);
}
function handleDeleteMessage(messageId) {
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
        _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({
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
function generateMessageHTML(msg, currentUser, lastRead, dividerInserted) {
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
function attachMessageActionListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const msgDiv = e.target.closest('[data-msg-id]');
            if (msgDiv)
                handleEditMessage(msgDiv.getAttribute('data-msg-id'));
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const msgDiv = e.target.closest('[data-msg-id]');
            if (msgDiv)
                handleDeleteMessage(msgDiv.getAttribute('data-msg-id'));
        });
    });
}
function setupUnreadDividerHandler() {
    const divider = document.getElementById('unread-divider');
    if (!divider)
        return;
    const clearDivider = () => {
        divider.remove();
        if (selectedUser)
            readTimestamps[selectedUser] = Date.now();
    };
    const chat = document.getElementById('chat-history');
    chat.addEventListener('scroll', clearDivider, { once: true });
    chat.addEventListener('click', clearDivider, { once: true });
    const sendBtn = document.getElementById('send-btn');
    sendBtn === null || sendBtn === void 0 ? void 0 : sendBtn.addEventListener('click', clearDivider, { once: true });
}
function renderChatHistory(messages) {
    const historyEl = document.getElementById('chat-history');
    if (!historyEl || !selectedUser)
        return;
    const currentUser = localStorage.getItem('user');
    const lastRead = readTimestamps[selectedUser] || 0;
    let dividerInserted = false;
    const chatMessages = messages.length === 0
        ? '<p>This is the beginning of the dialogue.</p>'
        : messages.map(msg => {
            const { html, insertDivider } = generateMessageHTML(msg, currentUser, lastRead, dividerInserted);
            if (insertDivider)
                dividerInserted = true;
            return html;
        }).join('');
    historyEl.innerHTML = chatMessages;
    setTimeout(() => historyEl.scrollTop = historyEl.scrollHeight, 0);
    attachMessageActionListeners();
    setupUnreadDividerHandler();
}
function renderLayout(user) {
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
function attachEventListeners(user) {
    var _a;
    (_a = document.getElementById('logout-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({ id: null, type: 'USER_LOGOUT', payload: { user: { login: user } } });
        localStorage.removeItem('user');
        (0,_router__WEBPACK_IMPORTED_MODULE_1__.navigate)('/login');
    });
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendBtn.click();
        }
    });
    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (!text || !selectedUser)
            return;
        _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({
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
    const searchInput = document.getElementById('user-search');
    searchInput === null || searchInput === void 0 ? void 0 : searchInput.addEventListener('input', () => {
        renderUserList(searchInput.value);
    });
}
function initializeWebSocketHandlers(user) {
    _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.onMessage((data) => {
        var _a, _b, _c, _d, _e, _f;
        if (data.type === 'USER_ACTIVE' && ((_a = data.payload) === null || _a === void 0 ? void 0 : _a.users)) {
            activeUsers = data.payload.users;
            renderUserList(((_b = document.getElementById('user-search')) === null || _b === void 0 ? void 0 : _b.value) || '');
        }
        if (data.type === 'USER_INACTIVE' && ((_c = data.payload) === null || _c === void 0 ? void 0 : _c.users)) {
            inactiveUsers = data.payload.users;
            renderUserList(((_d = document.getElementById('user-search')) === null || _d === void 0 ? void 0 : _d.value) || '');
        }
        if (data.type === 'USER_EXTERNAL_LOGIN' || data.type === 'USER_EXTERNAL_LOGOUT') {
            _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({ id: null, type: 'USER_ACTIVE', payload: null });
            _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({ id: null, type: 'USER_INACTIVE', payload: null });
        }
        if (data.type === 'MSG_FROM_USER' &&
            ((_e = data.payload) === null || _e === void 0 ? void 0 : _e.messages) &&
            selectedUser &&
            data.payload.messages.some((m) => (m.from === selectedUser && m.to === user) ||
                (m.from === user && m.to === selectedUser))) {
            updateChatTitle();
            const unreadMessageIds = data.payload.messages
                .filter((m) => m.from === selectedUser && !m.status.isReaded)
                .map((m) => m.id);
            if (unreadMessageIds.length > 0) {
                readTimestamps[selectedUser] = Date.now();
                _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({
                    id: crypto.randomUUID(),
                    type: 'MSG_READ',
                    payload: { messageIds: unreadMessageIds },
                });
            }
            renderChatHistory(data.payload.messages);
        }
        if (data.type === 'MSG_SEND') {
            const msg = (_f = data.payload) === null || _f === void 0 ? void 0 : _f.message;
            if (!msg)
                return;
            const isRelated = (msg.from === selectedUser && msg.to === user) ||
                (msg.from === user && msg.to === selectedUser);
            if (isRelated && selectedUser) {
                _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({
                    id: null,
                    type: 'MSG_FROM_USER',
                    payload: { user: { login: selectedUser } },
                });
            }
        }
        if (['MSG_EDIT', 'MSG_DELETE'].includes(data.type) && selectedUser) {
            _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({
                id: null,
                type: 'MSG_FROM_USER',
                payload: { user: { login: selectedUser } },
            });
        }
    });
    _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({ id: null, type: 'USER_ACTIVE', payload: null });
    _services_websocket__WEBPACK_IMPORTED_MODULE_0__.ws.send({ id: null, type: 'USER_INACTIVE', payload: null });
}
function renderMainPage() {
    const user = localStorage.getItem('user');
    if (!user) {
        (0,_router__WEBPACK_IMPORTED_MODULE_1__.navigate)('/login');
        return;
    }
    renderLayout(user);
    attachEventListeners(user);
    initializeWebSocketHandlers(user);
}


/***/ }),

/***/ "./src/router.ts":
/*!***********************!*\
  !*** ./src/router.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addRoute: () => (/* binding */ addRoute),
/* harmony export */   navigate: () => (/* binding */ navigate),
/* harmony export */   renderRoute: () => (/* binding */ renderRoute)
/* harmony export */ });
/* harmony import */ var _pages_login__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pages/login */ "./src/pages/login.ts");
/* harmony import */ var _pages_about__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages/about */ "./src/pages/about.ts");
/* harmony import */ var _pages_main__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/main */ "./src/pages/main.ts");



const routes = {};
function addRoute(path, handler) {
    routes[path] = handler;
}
function navigate(path) {
    history.pushState({}, '', path);
    renderRoute(path);
}
function renderRoute(path) {
    if (path === '/login') {
        (0,_pages_login__WEBPACK_IMPORTED_MODULE_0__.renderLoginPage)();
    }
    else if (path === '/about') {
        (0,_pages_about__WEBPACK_IMPORTED_MODULE_1__.renderAboutPage)();
    }
    else {
        (0,_pages_main__WEBPACK_IMPORTED_MODULE_2__.renderMainPage)();
    }
}
function renderNotFound() {
    document.body.innerHTML = '<h1>404 - Page Not Found</h1>';
}
window.addEventListener('popstate', () => {
    renderRoute(location.pathname);
});


/***/ }),

/***/ "./src/services/websocket.ts":
/*!***********************************!*\
  !*** ./src/services/websocket.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebSocketService: () => (/* binding */ WebSocketService),
/* harmony export */   ws: () => (/* binding */ ws)
/* harmony export */ });
class WebSocketService {
    constructor(url) {
        this.url = url;
        this.messageHandlers = [];
        this.messageQueue = [];
        this.isConnected = false;
        this.socket = new WebSocket(url);
        this.initializeEvents();
    }
    initializeEvents() {
        this.socket.addEventListener('open', () => {
            console.log('[WS] Connected to server');
            this.isConnected = true;
            // Flush any queued messages
            this.messageQueue.forEach((msg) => this.send(msg));
            this.messageQueue = [];
        });
        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('[WS] Received:', data);
            this.messageHandlers.forEach((handler) => handler(data));
        });
        this.socket.addEventListener('close', () => {
            console.warn('[WS] Connection closed');
            this.isConnected = false;
        });
        this.socket.addEventListener('error', (error) => {
            console.error('[WS] Error:', error);
        });
    }
    send(data) {
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
        else {
            console.warn('[WS] Not connected yet, queueing message:', data);
            this.messageQueue.push(data);
        }
    }
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }
    removeOnMessage(handler) {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }
}
const ws = new WebSocketService('ws://localhost:4000');


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./router */ "./src/router.ts");
/* harmony import */ var _pages_login__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages/login */ "./src/pages/login.ts");
/* harmony import */ var _pages_main__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/main */ "./src/pages/main.ts");
/* harmony import */ var _pages_about__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pages/about */ "./src/pages/about.ts");




// Define routes
(0,_router__WEBPACK_IMPORTED_MODULE_0__.addRoute)('/', _pages_login__WEBPACK_IMPORTED_MODULE_1__.renderLoginPage);
(0,_router__WEBPACK_IMPORTED_MODULE_0__.addRoute)('/login', _pages_login__WEBPACK_IMPORTED_MODULE_1__.renderLoginPage);
(0,_router__WEBPACK_IMPORTED_MODULE_0__.addRoute)('/main', _pages_main__WEBPACK_IMPORTED_MODULE_2__.renderMainPage);
(0,_router__WEBPACK_IMPORTED_MODULE_0__.addRoute)('/about', _pages_about__WEBPACK_IMPORTED_MODULE_3__.renderAboutPage);
document.addEventListener('DOMContentLoaded', () => {
    (0,_router__WEBPACK_IMPORTED_MODULE_0__.renderRoute)(location.pathname);
});

})();

/******/ })()
;
//# sourceMappingURL=main.js.map