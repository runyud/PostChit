$('#postTextarea').keyup((event) => {
    let textbox = $(event.target);
    let value = textbox.val().trim();

    let submitButton = $('#submitPostButton');

    if(submitButton.length == 0) return alert('no submit button found');

    if(value === "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
});
