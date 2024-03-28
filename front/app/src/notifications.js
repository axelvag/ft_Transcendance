import { Toast } from 'bootstrap';

const wrapperSelector = '#notifications';
const containerSelector = '#notifications .toast-container';
let lastToastIndex = 0;
let isInitialized = false;
const notificationsWaitingInit = [];

const createNotificationsContainer = () => {
  const el = document.querySelector(wrapperSelector);
  if (!el) {
    console.error('Notification wrapper not found');
    return;
  }
  el.innerHTML = '<div class="toast-container position-fixed bottom-0 end-0"></div>';
};

const initNotifications = () => {
  if (isInitialized) return;
  document.addEventListener('DOMContentLoaded', createNotificationsContainer);

  requestAnimationFrame(() => {
    isInitialized = true;
    notificationsWaitingInit.forEach(notify);
  });
};

const notify = data => {
  if (!isInitialized) {
    notificationsWaitingInit.push(data);
    return;
  }

  if (!data) {
    data = {};
  } else if (typeof data === 'string') {
    data = { message: data };
  }

  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error('Notification container not found');
    return;
  }
  lastToastIndex++;
  const toastId = `toast-${lastToastIndex}`;
  const themeClasses = data.theme ? `text-bg-${data.theme}` : 'toast-invert';

  let iconHtml = '';
  if (data.icon) {
    iconHtml = `
      <div class="flex-shrink-0 flex-grow-0 my-auto fs-5 ms-2 ps-1">
        <ui-icon name="${data.icon}" block class="${data.iconClass || ''}"></ui-icon>
      </div>
    `;
  }

  let actionsHtml = '';
  if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
    data.actions.forEach((action, index) => {
      const actionId = `${toastId}-action-${index + 1}`;
      data.actions[index].id = actionId;
      actionsHtml += `
        <button
          type="button"
          id="${actionId}"
          class="btn btn-sm me-1 ${action.themeClass ? action.themeClass : 'btn-light border border-1'}"
        >
          <small class="px-1 fw-semibold">${action.label || 'Action'}</small>
        </button>
      `;
    });
    actionsHtml = `<div class="mt-2">${actionsHtml}</div>`;
  } else {
    data.actions = null;
  }

  const toastHtml = `
    <div
      id="${toastId}"
      class="toast align-items-center m-3 ${themeClasses} border-0"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex">
        ${iconHtml}
        <div class="toast-body flex-shrink-1 flex-grow-1 text-truncate">
          ${data.message || 'No message'}
          ${actionsHtml}
        </div>
        <div class="flex-shrink-0 flex-grow-0 my-auto me-2">
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', toastHtml);

  // instantiate toast
  const toastEl = document.getElementById(toastId);
  let toast = new Toast(toastEl, {
    autohide: data.hasOwnProperty('autohide') ? data.autohide : true,
    delay: data.delay || 3000,
  });

  // clear element and dispose on hidden
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
    toast = null;
  });

  // add event listeners to actions
  if (data.actions) {
    data.actions.forEach(action => {
      const actionEl = document.getElementById(action.id);
      if (actionEl && action.onclick && typeof action.onclick === 'function') {
        actionEl.addEventListener('click', () => {
          action.onclick();
          toast.hide();
        });
      }
    });
  }

  // show toast
  toast.show();
};

export { initNotifications, notify };
