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

$('#submitPostButton').click((event) => {
    let button = $(event.target);
    let textbox = $('#postTextarea');

    let data = {
        content: textbox.val()
    }

    $.post('/api/posts', data, (postData) => {
        let html = createPostHtml(postData);
        $('.postsContainer').prepend(html);
        textbox.val('');
        button.prop('disabled', true);
    })

})

function createPostHtml(postData) {
    
    let postedBy = postData.postedBy;
    let displayName = postedBy.firstName + ' ' + postedBy.lastName;
    let timestamp = postData.createdAt;

    return `<div class='post'>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.userName}' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.userName}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class="far fa-comment-dots"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class="far fa-share-square"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer'>
                                <button>
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}