// Меню (бургер)
const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');
function setNav(open) {
  if (!burger || !nav) return;
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('is-open', open);
}
if (burger && nav) {
  burger.addEventListener('click', () => setNav(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
}

// Отправка заявки напрямую в Telegram (без сервера).
// Токен и chat_id подставляются при деплое.
const TG_TOKEN = '9285275662:AAHiDPdCB8lH-FY2Vgw_e2ZCfJvAWlM0PZg';
const TG_CHAT = '-1004306924783';
const TG_THREAD = '23';

const form = document.getElementById('lead-form');
const status = document.getElementById('form-status');

function setErr(id, input, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
  if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!status) return;
    const name = form.elements.namedItem('name');
    const contact = form.elements.namedItem('contact');
    const consent = form.elements.namedItem('consent');
    const way = form.elements.namedItem('way');
    const message = form.elements.namedItem('message');

    const okName = setErr('e-name', name, name.value.trim() ? '' : 'Укажите имя');
    const okContact = setErr('e-contact', contact, contact.value.trim().length >= 5 ? '' : 'Укажите телефон или Telegram');
    const okConsent = setErr('e-consent', consent, consent.checked ? '' : 'Нужно согласие на обработку данных');
    if (!(okName && okContact && okConsent)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const wayText = way && way.value ? way.value : '—';
    let text = '🆕 Новая заявка с сайта\n\n👤 Имя: ' + name.value.trim() + '\n📞 Контакт: ' + contact.value.trim() + '\n🎯 Интересует: ' + wayText;
    if (message && message.value.trim()) text += '\n💬 Комментарий: ' + message.value.trim();
    if (text.length > 3500) text = text.slice(0, 3500) + '…';

    const btn = form.querySelector('button[type="submit"]');
    const original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Отправляем…'; }
    status.textContent = '';

    try {
      await fetch('https://api.telegram.org/bot' + TG_TOKEN + '/sendMessage', {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ chat_id: TG_CHAT, message_thread_id: TG_THREAD, text: text }),
      });
      status.textContent = 'Спасибо! Заявка отправлена — мы свяжемся с вами.';
      form.reset();
    } catch (err) {
      status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз.';
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    }
  });
}
