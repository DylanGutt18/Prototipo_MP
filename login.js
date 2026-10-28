/* ==========================================================================
   login.js — Tela de login (autenticação de teste)
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);

  const STORAGE_KEY = 'dash:auth:v1';
  const AUTH_USER = 'admin';
  const AUTH_PASS = '1234';

  function isLogged() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch { return false; }
  }

  function setLogged(v) {
    try {
      if (v) localStorage.setItem(STORAGE_KEY, 'true');
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function getScreen() {
    let screen = document.getElementById('loginScreen');
    if (screen) return screen;

    screen = document.createElement('div');
    screen.id = 'loginScreen';
    screen.className = 'login-screen';
    screen.innerHTML = `
      <div class="login-card">
        <div class="login-brand">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path d="M4 20V10M10 20V4M16 20v-7M22 20V8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
          </svg>
          <span>Painel</span>
        </div>

        <div class="login-head">
          <h1>Bem-vindo de volta</h1>
          <p>Entre para acessar o painel</p>
        </div>

        <form class="login-form" id="loginForm" novalidate>
          <div class="login-field">
            <label for="loginUser">Usuário</label>
            <div class="login-input-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5"/>
              </svg>
              <input type="text" id="loginUser" name="user" placeholder="Login" autocomplete="username" autofocus>
            </div>
          </div>

          <div class="login-field">
            <label for="loginPass">Senha</label>
            <div class="login-input-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
              <input type="password" id="loginPass" name="pass" placeholder="Senha" autocomplete="current-password">
              <button type="button" class="login-toggle-pw" id="loginTogglePw" aria-label="Mostrar senha">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="login-error" id="loginError" role="alert">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".6" fill="currentColor" stroke="none"/>
            </svg>
            <span id="loginErrorMsg">Usuário ou senha incorretos.</span>
          </div>

          <button type="submit" class="login-submit" id="loginSubmit">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span>Entrar</span>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(screen);
    bind(screen);
    return screen;
  }

  function bind(screen) {
    // Evita registrar listeners duplicados se bind() for chamado mais de uma vez
    if (screen.dataset.bound === 'true') return;
    screen.dataset.bound = 'true';

    const form = screen.querySelector('#loginForm');
    const userInput = screen.querySelector('#loginUser');
    const passInput = screen.querySelector('#loginPass');
    const errorBox = screen.querySelector('#loginError');
    const errorMsg = screen.querySelector('#loginErrorMsg');
    const submitBtn = screen.querySelector('#loginSubmit');
    const toggleBtn = screen.querySelector('#loginTogglePw');

    let busy = false;

    function showError(msg) {
      errorMsg.textContent = msg;
      errorBox.classList.add('is-visible');
      // re-trigger shake
      errorBox.style.animation = 'none';
      void errorBox.offsetWidth;
      errorBox.style.animation = '';
    }
    function hideError() {
      errorBox.classList.remove('is-visible');
    }

    // Restaura o estado do formulário (usado ao reabrir após logout)
    function resetForm() {
      busy = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        <span>Entrar</span>
      `;
      hideError();
    }

    // Expõe para show() poder chamar
    screen._resetForm = resetForm;

    [userInput, passInput].forEach(inp => {
      inp.addEventListener('input', hideError);
    });

    toggleBtn.addEventListener('click', () => {
      const isPw = passInput.type === 'password';
      passInput.type = isPw ? 'text' : 'password';
      toggleBtn.setAttribute('aria-label', isPw ? 'Ocultar senha' : 'Mostrar senha');
      toggleBtn.innerHTML = isPw
        ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-6.5 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94"/>
             <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19"/>
             <line x1="2" y1="2" x2="22" y2="22"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
             <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
             <circle cx="12" cy="12" r="3"/>
           </svg>`;
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (busy) return;

      const user = (userInput.value || '').trim();
      const pass = passInput.value || '';

      if (!user || !pass) {
        showError('Preencha usuário e senha.');
        return;
      }

      busy = true;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
          <path d="M21 12a9 9 0 1 1-6.2-8.5"/>
        </svg>
        <span>Entrando…</span>
      `;

      setTimeout(() => {
        if (user === AUTH_USER && pass === AUTH_PASS) {
          setLogged(true);
          hide();
        } else {
          showError('Usuário ou senha incorretos.');
          busy = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span>Entrar</span>
          `;
          passInput.value = '';
          passInput.focus();
        }
      }, 450);
    });
  }

  function show() {
    const screen = getScreen();
    screen.hidden = false;
    document.body.classList.add('login-open');
    const userInput = screen.querySelector('#loginUser');
    const passInput = screen.querySelector('#loginPass');
    if (userInput) userInput.value = '';
    if (passInput) {
      passInput.value = '';
      passInput.type = 'password';
    }
    // Restaura o botão "Entrar" e libera o estado de busy
    screen._resetForm?.();
    setTimeout(() => userInput?.focus(), 80);
  }
  function hide() {
    const screen = document.getElementById('loginScreen');
    if (screen) screen.hidden = true;
    document.body.classList.remove('login-open');
    document.dispatchEvent(new CustomEvent('auth:login'));
  }

  function logout() {
    setLogged(false);
    show();
    document.dispatchEvent(new CustomEvent('auth:logout'));
  }

  // expõe API antes do boot
  window.Auth = {
    isLogged,
    logout,
    show,
    hide,
  };

  // Boot: se não estiver logado, mostra a tela
  if (!isLogged()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }
})();