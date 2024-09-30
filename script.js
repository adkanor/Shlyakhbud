document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const statusModal = document.getElementById("status-modal");
  const statusMessage = document.getElementById("status-message");
  const statusHeader = document.getElementById("status-header");

  const openModalButtons = document.querySelectorAll(".open-modal-button");
  const closeModalButton = document.getElementById("close-modal");
  const blurBackground = document.getElementById("blur-background");
  const statusCloseButton = document.getElementById("status-close");
  let closeModalTimeout;

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      modal.classList.add("show");
      blurBackground.style.display = "block";
      statusModal.classList.remove("show");
      clearTimeout(closeModalTimeout);
    });
  });

  closeModalButton.addEventListener("click", () => {
    closeAllModals();
  });

  statusCloseButton.addEventListener("click", () => {
    closeAllModals();
  });

  window.addEventListener("click", (event) => {
    if (event.target === blurBackground) {
      closeAllModals();
    }
  });

  function closeAllModals() {
    modal.classList.remove("show");
    clearTimeout(closeModalTimeout);
    statusModal.classList.remove("show");
    blurBackground.style.display = "none";
  }

  // Form validation

  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    const phoneInput = form.querySelector("input[type='tel']");
    const submitButton =
      form.querySelector(".submit-button") ||
      form.querySelector(".submit-modal-button");
    if (phoneInput) {
      const maskOptions = {
        mask: "+38(000)000-00-00",
        lazy: false,
      };
      const mask = new IMask(phoneInput, maskOptions);
    }

    const nameInput = form.querySelector("input[name='name']");
    if (nameInput) {
      nameInput.addEventListener("click", () => {
        nameInput.classList.remove("input-error");
        nameInput.placeholder = "Ім'я";
      });
    }
    phoneInput.addEventListener("click", () => {
      phoneInput.classList.remove("input-error");
      phoneInput.placeholder = "Номер телефону";
    });

    // Form listener
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = form.querySelector("input[name='name']");
      const phoneInput = form.querySelector("input[name='phone']");
      const messageInput = form.querySelector("input[name='message']");

      const nameValue = nameInput.value.trim();
      const phoneValue = phoneInput.value.trim();
      const messageValue = messageInput.value.trim() || "Немає";
      let isValid = true;
      if (nameValue.length < 2) {
        nameInput.classList.add("input-error");

        isValid = false;
      }
      if (
        phoneValue.includes("_") ||
        phoneValue.value === "" ||
        phoneValue.length !== 17
      ) {
        phoneInput.classList.add("input-error");
        isValid = false;
      }
      if (!isValid) {
        return;
      }

      submitButton.disabled = true;

      sendFormData(nameValue, phoneValue, messageValue);
    });

    // Send Data
    function sendFormData(name, phone, message) {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      let text = "<b>Заявка</b>\n";
      text += `<b>Ім'я:</b> ${name}\n`;
      text += `<b>Телефон:</b> ${phone}\n`;
      text += `<b>Повідомлення:</b> ${message}\n`;

      const data = {
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: "HTML",
      };
      console.log(data);
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok) {
            statusHeader.textContent = "Форма успішно відправлена";
            statusMessage.textContent = "Зателефонуємо вам найближчим часом";
            document.getElementById("success-icon").style.display = "block";
            document.getElementById("error-icon").style.display = "none";
          } else {
            statusHeader.textContent = "Форма не була відправлена";
            statusMessage.textContent = "Будь ласка, спробуйте ще раз";
            document.getElementById("success-icon").style.display = "none";
            document.getElementById("error-icon").style.display = "block";
          }
          showStatusModal();
        })

        .catch((error) => {
          statusHeader.textContent = "Форма не була відправлена";
          statusMessage.textContent = "Щось пішло не так, спробуйте ще раз.";
          document.getElementById("success-icon").style.display = "none";
          document.getElementById("error-icon").style.display = "block";
          showStatusModal();
        })
        .finally(() => {
          submitButton.disabled = false;
        });
    }
  });

  function showStatusModal() {
    statusModal.classList.add("show");
    closeModalTimeout = setTimeout(() => {
      closeAllModals();
    }, 10000);
  }
});
