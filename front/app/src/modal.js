import { Modal } from 'bootstrap';

const modalSelector = '#notificationModal';
let isModalInitialized = false;

const initModal = () => {
  if (isModalInitialized) return;

  const modalHTML = `
    <div class="modal fade" id="notificationModal" tabindex="-1" aria-labelledby="notificationModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="notificationModalLabel">Notification</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Message will be inserted here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="modalOkButton">OK</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalElement = document.querySelector(modalSelector);
  const modalInstance = new Modal(modalElement, {
    keyboard: false,
  });

  // Add event listener for 'OK' button
  document.getElementById('modalOkButton').addEventListener('click', () => {
    modalInstance.hide();
  });

  modalElement.addEventListener('hidden.bs.modal', () => {
    modalInstance.dispose();
    modalElement.remove();
    isModalInitialized = false; // Reinitialize if needed again
  });

  isModalInitialized = true;
};

const showModal = (title, message, options = {}) => {
  if (!isModalInitialized) {
    initModal();
  }

  const modalElement = document.querySelector(modalSelector);
  document.getElementById('notificationModalLabel').textContent = title;
  modalElement.querySelector('.modal-body').textContent = message;
  const modalInstance = Modal.getInstance(modalElement) || new Modal(modalElement);

  // Handle callbacks if provided
  if (options.okCallback) {
    document.getElementById('modalOkButton').onclick = () => {
      options.okCallback();
      modalInstance.hide();
    };
  } else {
    document.getElementById('modalOkButton').onclick = () => modalInstance.hide();
  }

  if (options.cancelCallback) {
    document.querySelector('.btn-secondary[data-bs-dismiss="modal"]').onclick = options.cancelCallback;
  }

  modalInstance.show();
};

export { showModal, initModal };
