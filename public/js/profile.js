$(document).ready(() => {
    if(selectedTab === "replies") {
        loadReplies();
    } else {
        loadPosts();
    }
});

function loadPosts() {
    $(document).ready(() => {
        $.get(
            '/api/posts',
            { postedBy: profileUserId, pinned: true },
            (results) => {
                outputPinnedPost(results, $('.pinnedPostContainer'));
            }
        );
    });

    $(document).ready(() => {
        $.get(
            '/api/posts',
            { postedBy: profileUserId, isReply: false },
            (results) => {
                outputPosts(results, $('.postsContainer'));
            }
        );
    });
}

function loadReplies() {
    $(document).ready(() => {
        $.get(
            '/api/posts',
            { postedBy: profileUserId, isReply: true },
            (results) => {
                outputPosts(results, $('.postsContainer'));
            }
        );
    });
}

function outputPinnedPost(results, container) {
    if(results.length == 0) {
        container.hide();
        return;
    }

    container.html('');

    results.forEach((result) => {
        let html = createPostHtml(result);
        container.append(html);
    });
}

