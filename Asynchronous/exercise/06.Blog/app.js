function attachEvents() {
    let buttonLoad = document.getElementById('btnLoadPosts');
    buttonLoad.addEventListener('click', loadPosts);

    let buttonView = document.getElementById('btnViewPost');
    buttonView.addEventListener('click', view);

    let titles = [];

    function loadPosts() {
        let posts = document.getElementById('posts');
        let urlPosts = `http://localhost:3030/jsonstore/blog/posts`;

        fetch(urlPosts)
            .then(response => response.json())
            .then(data => Object.entries(data).forEach(([key, value]) => {
                let option = document.createElement('option');
                option.value = key;
                option.textContent = value.title;
                posts.appendChild(option);
                let titleObj = {
                    key: key,
                    title: value.title,
                    body: value.body
                }
                titles.push(titleObj);
            }));
    }

    function view(e) {
        let titleOption = e.target.parentElement.querySelector('select').value;
        
        let postTitleInArr = titles.find(e => e.key === titleOption);
        let title = document.getElementById('post-title');
        title.textContent = postTitleInArr.title;
        let parPostDetails = document.getElementById('post-body');
        parPostDetails.textContent = postTitleInArr.body;
        
        let urlComments = `http://localhost:3030/jsonstore/blog/comments`;

        
        fetch(urlComments)
            .then(response => response.json())
            .then(data => Object.values(data).forEach(v => {
                if (v.postId === postTitleInArr.key) {
                
                    let postCommentsUl = document.getElementById('post-comments');
                    postCommentsUl.innerHTML = '';
                    let urlCurrComment = `http://localhost:3030/jsonstore/blog/comments/${v.id}`;
                    fetch(urlCurrComment)
                        .then(response => response.json())
                        .then(data => {
                            let li = document.createElement('li');
                            li.id = data.id;
                            li.textContent = data.text;
                            postCommentsUl.appendChild(li);
                        });
                }
                
            }));
    }
}

attachEvents();