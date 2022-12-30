let topicContainer = document.querySelector('.topic-container');
const url = 'http://localhost:3030/jsonstore/collections/myboard/posts';
const form = document.querySelector('form');
const postButton = document.querySelector('button.public');
postButton.addEventListener('click', createPost);
const cancelButton = document.querySelector('.cancel');
cancelButton.addEventListener('click', clearFields);
let container = document.querySelector('.container');
const homeButton = document.querySelector('nav ul li a');
homeButton.addEventListener('click', getHome)

let inHome = true;

function getHome() {
    if (!inHome) {
        container.querySelector('main').style.display = 'block';
        container.querySelector('.theme-content').style.display = 'none';
        inHome = true;
    }
}

function loadPosts() {
    fetch(url)
        .then(response => response.json())
        .then(data => renderPosts(data));
}

function renderPosts(data) {
    topicContainer.innerHTML = '';
    Object.values(data).forEach(p => {
        const element = document.createElement('div');
        element.classList.add('topic-name-wrapper');
        element.innerHTML =
            `<div class="topic-name">
                <a href="#" class="normal" id="${p._id}">
                    <h2>${p.topicName}</h2>
                </a>
                <div class="columns">
                    <div>
                        <p>Date: <time>${p.time}</time></p>
                        <div class="nick-name">
                            <p>Username: <span>${p.username}</span></p>
                        </div>
                    </div>
                </div>
            </div>`;
        element.querySelector('a').addEventListener('click', postView);
        topicContainer.appendChild(element);
    })
}

function clearFields(e) {
    e.preventDefault();
    form.querySelectorAll('input').forEach(e => e.value = '');
    form.querySelector('textarea').value = '';
}

function createPost(e) {
    e.preventDefault();
    const formData = new FormData(form);
    let obj = Object.fromEntries(formData);
    obj.time = new Date();
    fetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    });

    form.querySelectorAll('input').forEach(e => e.value = '');
    form.querySelector('textarea').value = '';
    loadPosts();
}

function postView(e) {
    const id = e.target ? e.target.parentElement.id : e;

    let themeContentDiv = container.querySelector('.theme-content');
    if (themeContentDiv) {
        themeContentDiv.remove();
    }

    fetch(url + `/${id}`)
        .then(response => response.json())
        .then(data => {
            const themeContent = document.createElement('div');
            themeContent.classList.add('theme-content');
            const themeTitle = document.createElement('div');
            themeTitle.classList.add('theme-title');
            const themeNameWrapper = document.createElement('div');
            themeNameWrapper.classList.add('theme-name-wrapper');
            const themeName = document.createElement('div');
            themeName.classList.add('theme-name');
            const headerTitle = document.createElement('h2');
            headerTitle.textContent = data.topicName;
        
            themeName.appendChild(headerTitle);
            themeNameWrapper.appendChild(themeName);
            themeTitle.appendChild(themeNameWrapper);
            themeContent.appendChild(themeTitle);

            const comment = document.createElement('div');
            comment.classList.add('comment');
            comment.innerHTML = 
                `<div class="header">
                    <img src="./static/profile.png" alt="avatar">
                    <p><span>${data.username}</span> posted on <time>${data.time}</time></p>
        
                    <p class="post-content">${data.postText}</p>
                </div>`;

            const urlComments = 'http://localhost:3030/jsonstore/collections/myboard/comments';
            
            fetch(urlComments)
                .then(response => response.json())
                .then(dataComments => {
                    Object.values(dataComments).forEach(c => {
                        if (c.idPost === id) {
                            comment.innerHTML += 
                            `<div id="user-comment">
                                <div class="topic-name-wrapper">
                                    <div class="topic-name">
                                        <p><strong>${c.username}</strong> commented on <time>${c.time}</time></p>
                                        <div class="post-content">
                                            <p>${c.postText}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                        }
                    })
                    themeContent.appendChild(comment);
                    themeContent.innerHTML += 
                        `<div class="answer-comment">
                            <p><span>currentUser</span> comment:</p>
                            <div class="answer">
                                <form id="${id}">
                                    <textarea name="postText" id="comment" cols="30" rows="10"></textarea>
                                    <div>
                                        <label for="username">Username <span class="red">*</span></label>
                                        <input type="text" name="username" id="username">
                                    </div>
                                    <button>Post</button>
                                </form>
                            </div>
                        </div>`;
                    themeContent.querySelector('form')
                        .addEventListener('submit', createComment);
                    container.appendChild(themeContent);
                    container.querySelector('main').style.display = 'none';
                    inHome = false;
                })

            
        });

}

function createComment(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const obj = Object.fromEntries(formData);
    obj.idPost = form.id;
    const time = new Date();
    obj.time = time;
    const urlComments = 'http://localhost:3030/jsonstore/collections/myboard/comments';
    fetch(urlComments, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obj)
    });
    form.querySelector('textarea').value = '';
    form.querySelector('input').value = '';
    postView(obj.idPost);
}

loadPosts();