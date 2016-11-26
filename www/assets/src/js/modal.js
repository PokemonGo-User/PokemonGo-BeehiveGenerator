var modalView = {
    modal: document.getElementById("modal"),
    modalTitle: document.getElementById("modal-title"),
    modalBody: document.getElementById("modal-body"),
    spinner: '<span class="glyphicon glyphicon-refresh glyphicon-spin"></span>'
};
modalView.setText = function (title, body) {
    if (title) {
        this.modalTitle.innerHTML = title;
    }
    if (body) {
        this.modalBody.innerHTML = body;
    }
};

modalView.show = function (title, body) {
    this.setText(title, body);
    $(this.modal).modal("show");
};

modalView.showLoadingIcon = function (title) {
    this.setText(title, this.spinner);
    this.show();
};

modalView.hide = function () {
    $(this.modal).modal("hide");
};