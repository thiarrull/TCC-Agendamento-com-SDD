document.querySelectorAll("[data-confirm-delete]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este agendamento?",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  });
});
