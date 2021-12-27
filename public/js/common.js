// Globals
let cropper;

$('#postTextarea, #replyTextarea').keyup((event) => {
    let textbox = $(event.target);
    let value = textbox.val().trim();

    let isModal = textbox.parents('.modal').length === 1;

    let submitButton = isModal
        ? $('#submitReplyButton')
        : $('#submitPostButton');

    if (submitButton.length == 0) return alert('no submit button found');

    if (value === '') {
        submitButton.prop('disabled', true);
        return;
    }

    submitButton.prop('disabled', false);
});

$('#replyModal').on('show.bs.modal', (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $('#submitReplyButton').data('id', postId);

    $.get(`/api/posts/${postId}`, (results) => {
        outputPosts(results.postData, $('#originalPostContainer'));
    });
});

$('#deletePostModal').on('show.bs.modal', (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $('#deletePostButton').data('id', postId);
});

$('#deletePostButton').click((event) => {
    let postId = $(event.target).data('id');

    $.ajax({
        url: `/api/posts/${postId}`,
        type: 'DELETE',
        success: (data, status, xhr) => {
            if (xhr.status !== 202) {
                alert('could not delete post');
                return;
            }
            location.reload();
        },
    });
});

$('#filePhoto').change((event) => {
    let input = $(event.target)[0];

    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let image = document.getElementById('imagePreview');
            image.src = e.target.result;

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false,
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
});

$('#coverPhoto').change((event) => {
    let input = $(event.target)[0];

    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let image = document.getElementById('coverPreview');
            image.src = e.target.result;

            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false,
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
});

$('#imageUploadButton').click(() => {
    let canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
        alert('Could not upload image. Make sure it is an image file!');
        return;
    }

    canvas.toBlob((blob) => {
        let formData = new FormData();
        formData.append('croppedImage', blob);

        $.ajax({
            url: '/api/users/profilePicture',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            },
        });
    });
});

$('#coverPhotoUploadButton').click(() => {
    let canvas = cropper.getCroppedCanvas();

    if (canvas == null) {
        alert('Could not upload image. Make sure it is an image file!');
        return;
    }

    canvas.toBlob((blob) => {
        let formData = new FormData();
        formData.append('croppedImage', blob);

        $.ajax({
            url: '/api/users/coverPhoto',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                location.reload();
            },
        });
    });
});

$('#replyModal').on('hidden.bs.modal', () => {
    $('#originalPostContainer').html('');
});

$(document).on('click', '.likeButton', (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);

    if (postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: 'PUT',
        success: (postData) => {
            button.find('span').text(postData.likes.length || '');

            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass('active');
            } else {
                button.removeClass('active');
            }
        },
    });
});

$(document).on('click', '.shareButton', (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);

    if (postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/share`,
        type: 'POST',
        success: (postData) => {
            button.find('span').text(postData.shareUsers.length || '');

            if (postData.shareUsers.includes(userLoggedIn._id)) {
                button.addClass('active');
            } else {
                button.removeClass('active');
            }
        },
    });
});

$(document).on('click', '.post', (event) => {
    let element = $(event.target);
    let postId = getPostIdFromElement(element);

    if (postId !== undefined && !element.is('button')) {
        window.location.href = `/posts/${postId}`;
    }
});

$(document).on('click', '.followButton', (event) => {
    let button = $(event.target);
    let userId = button.data().user;

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: 'PUT',
        success: (data, status, xhr) => {
            if (xhr.status == 404) {
                alert('user not found');
                return;
            }

            let difference = 1;
            if (data.following && data.following.includes(userId)) {
                button.addClass('following');
                button.text('Following');
            } else {
                button.removeClass('following');
                button.text('Follow');
                difference = -1;
            }

            let followersLabel = $('#followersValue');
            if (followersLabel.length != 0) {
                let followersText = followersLabel.text();
                followersLabel.text(parseInt(followersText) + difference);
            }
        },
    });
});

function getPostIdFromElement(element) {
    let isRoot = element.hasClass('post');
    let rootElement = isRoot ? element : element.closest('.post');
    let postId = rootElement.data().id;

    if (postId === undefined) return alert('Post id undefined');

    return postId;
}

$('#submitPostButton, #submitReplyButton').click((event) => {
    let button = $(event.target);

    let isModal = button.parents('.modal').length === 1;
    let textbox = isModal ? $('#replyTextarea') : $('#postTextarea');

    let data = {
        content: textbox.val(),
    };

    if (isModal) {
        let id = button.data().id;
        if (id == null) return alert('button id is null');
        data.replyTo = id;
    }

    $.post('/api/posts', data, (postData) => {
        if (postData.replyTo) {
            location.reload();
        } else {
            let html = createPostHtml(postData);
            $('.postsContainer').prepend(html);
            textbox.val('');
            button.prop('disabled', true);
        }
    });
});

function createPostHtml(postData, largeFont = false) {
    if (postData == null) return alert('post object is null');

    let isShare = postData.shareData !== undefined;
    let sharedBy = isShare ? postData.postedBy.userName : null;
    postData = isShare ? postData.shareData : postData;

    let postedBy = postData.postedBy;

    if (postedBy._id === undefined) {
        return console.log('User object not populated');
    }

    let displayName = postedBy.firstName + ' ' + postedBy.lastName;
    let timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
        ? 'active'
        : '';
    let shareButtonActiveClass = postData.shareUsers.includes(userLoggedIn._id)
        ? 'active'
        : '';
    let largeFontClass = largeFont ? 'largeFont' : '';

    let shareText = '';
    if (isShare) {
        shareText = `<span>
                        <i class="far fa-share-square"></i>
                        Shared by <a href = '/profile/${sharedBy}'>@${sharedBy}</a>
                    </span>`;
    }

    let replyFlag = '';
    if (postData.replyTo && postData.replyTo._id) {
        if (!postData.replyTo._id) {
            return alert('Reply id is not populated');
        } else if (!postData.replyTo.postedBy._id) {
            return alert('Posted by id is not populated');
        }

        let replyToUsername = postData.replyTo.postedBy.userName;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;
    }

    let button = '';

    if (postData.postedBy._id == userLoggedIn._id) {
        button = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class='fas fa-times'></i></button>`;
    }

    return `<div class='post ${largeFontClass}' data-id=${postData._id}>
                <div class='postActionContainer'>
                    ${shareText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${
                                postedBy.userName
                            }' class='displayName'>${displayName}</a>
                            <span class='username'>@${postedBy.userName}</span>
                            <span class='date'>${timestamp}</span>
                            ${button}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div> 
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class="far fa-comment-dots"></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='shareButton ${shareButtonActiveClass}'>
                                    <i class="far fa-share-square"></i>
                                    <span>${
                                        postData.shareUsers.length || ''
                                    }</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class="fas fa-heart"></i>
                                    <span>${postData.likes.length || ''}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {
    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return 'Just now';
        return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function outputPosts(results, container) {
    container.html('');

    if (!Array.isArray(results)) {
        results = [results];
    }

    results.forEach((result) => {
        let html = createPostHtml(result);
        container.append(html);
    });

    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show. </span>");
    }
}

function outputPostsWithReplies(results, container) {
    container.html('');

    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        let html = createPostHtml(results.replyTo);
        container.append(html);
    }

    let mainPosthtml = createPostHtml(results.postData, true);
    container.append(mainPosthtml);

    results.replies.forEach((result) => {
        let html = createPostHtml(result);
        container.append(html);
    });
}
