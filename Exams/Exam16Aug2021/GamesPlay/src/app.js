import { html, render } from '../../../../../node_modules/lit-html/lit-html.js';
import { requester } from './api.js';

let main = document.getElementById('main-content');
const homeSection = document.getElementById('welcome-world');
const dashboard = document.getElementById('catalog-page');
const loginSection = document.getElementById('login-page');
const registerSection = document.getElementById('register-page');
dashboard.innerHTML = '';
homeSection.innerHTML = '';
const createSection = document.getElementById('create-page');
const detailsSection = document.getElementById('game-details');
detailsSection.innerHTML = '';
const editSection = document.getElementById('edit-page');


document.querySelectorAll('section').forEach(s => s.remove());


const homeButton = document.querySelector('header h1 a');
homeButton.addEventListener('click', showHome);
const allGamesbutton = document.querySelector('nav a');
allGamesbutton.addEventListener('click', showDashboard);
const loginButton = document.querySelector('#guest a');
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('#guest a')[1];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('#user a')[1];
logoutButton.addEventListener('click', logout);
const createButton = document.querySelector('#user a');
createButton.addEventListener('click', create);


function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        document.getElementById('user').style.display = 'inline';
        document.getElementById('guest').style.display = 'none';
    } else {
        document.getElementById('user').style.display = 'none';
        document.getElementById('guest').style.display = 'inline';
    }
}

async function showHome(e) {
    e ? e.preventDefault() : '';

    const url = 'data/games?sortBy=_createdOn%20desc&distinct=category';
    const response = await requester('get', url);
    const data = await response.json();
    const games = html`
    <div class="welcome-message">
        <h2>ALL new games are</h2>
        <h3>Only in GamesPlay</h3>
    </div>
    <img src="./images/four_slider_img01.png" alt="hero">
    
    <div id="home-page">
        <h1>Latest Games</h1>
    
        <!-- Display div: with information about every game (if any) -->
        ${data.map(g => html`
        <div class="game">
            <div class="image-wrap">
                <img src=".${g.imageUrl}">
            </div>
            <h3>${g.title}</h3>
            <div class="rating">
                <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
            </div>
            <div class="data-buttons">
                <a href="#" class="btn details-btn" @click=${details} id=${g._id} data-id=${g._ownerId}>Details</a>
            </div>
        </div>`)}
    
        <!-- Display paragraph: If there is no games  -->
        ${data.length === 0 ? html`<p class="no-articles">No games yet</p>` : html``}
    </div>`

    render(games, homeSection);


    main.replaceChildren(homeSection);
}

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/games?sortBy=_createdOn%20desc';
    const response = await requester('get', url);
    const data = await response.json();
    const games = html`
    <h1>All Games</h1>
    <!-- Display div: with information about every game (if any) -->
    ${data.map(g => html`
    <div class="allGames">
        <div class="allGames-info">
            <img src=".${g.imageUrl}">
            <h6>${g.category}</h6>
            <h2>${g.title}</h2>
            <a href="#" class="details-button" @click=${details} id=${g._id} data-id=${g._ownerId}>Details</a>
        </div>
    
    </div>`)}
    
    <!-- Display paragraph: If there is no games  -->
    ${data.length === 0 ? html`<h3 class="no-articles">No articles yet</h3>` : html``}`;


    render(games, dashboard);

    main.replaceChildren(dashboard);
}

function login(e) {
    e.preventDefault();
    main.replaceChildren(loginSection);
    loginSection.addEventListener('submit', onLogin);
}

async function onLogin(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.email === '' || object.password === '') {
        window.alert('No user');
        return;
    }

    const response = await requester('post', 'users/login', object);

    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);

    form.reset();
    showHome();
    showNavbar();

    return data;
}

function register(e) {
    e.preventDefault();
    main.replaceChildren(registerSection);
    registerSection.addEventListener('submit', onRegister);
}

async function onRegister(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.email === '' || object.password === ''
        || object['confirm-password'] !== object.password) {
        window.alert('No user');
        return;
    }

    const response = await requester('post', 'users/register', object);

    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);

    form.reset();
    showHome();
    showNavbar();

    return data;
}

async function logout(e) {
    e.preventDefault();
    const response = await requester('get', 'users/logout');

    sessionStorage.clear();
    showNavbar();
    showHome();
    return response;
}

function create(e) {
    e.preventDefault();
    main.replaceChildren(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/games';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.category === ''
        || object.maxLevel === '' || object.imageUrl === ''
        || object.summary === '') {
        return;
    }
    const response = await requester('post', url, object);

    const data = await response.json();
    showHome();
    form.reset();
    return data;
}

async function details(e, ownerId) {
    e.target ? e.preventDefault() : '';
    const id = e.target ? e.target.id : e;
    const idOwner = e.target ? e.target.getAttribute('data-id') : ownerId;
    const currId = sessionStorage.getItem('id');

    const url = `data/games/${id}`;
    const response = await requester('get', url);
    const data = await response.json();

    const urlComments = `data/comments?where=gameId%3D%22${id}%22`;
    const responseComments = await requester('get', urlComments);
    const dataComments = await responseComments.json();

    const template = html`
    <h1>Game Details</h1>
    <div class="info-section">
    
        <div class="game-header">
            <img class="game-img" src=".${data.imageUrl}" />
            <h1>${data.title}</h1>
            <span class="levels">MaxLevel: ${data.maxLevel}</span>
            <p class="type">${data.category}</p>
        </div>
    
        <p class="text">
            ${data.summary}
        </p>
    
        <!-- Bonus ( for Guests and Users ) -->
        <div class="details-comments">
            <h2>Comments:</h2>
            <ul>
                <!-- list all comments for current game (If any) -->
                ${dataComments.map(c => html`
                <li class="comment">
                    <p>Content: ${c.comment}</p>
                </li>`)}
                
            </ul>
            <!-- Display paragraph: If there are no games in the database -->
            ${dataComments.length === 0 ? html`<p class="no-comment">No comments.</p>` : html``}
        </div>
    
    
        <!-- Edit/Delete buttons ( Only for creator of this game )  -->
        ${idOwner === currId ? html`
        <div class="buttons">
            <a href="#" class="button" @click=${edit} data-id=${data._id}>Edit</a>
            <a href="#" class="button" @click=${deleteItem} data-id=${data._id}>Delete</a>
        </div>` : html``}
    </div>
    <!-- Bonus -->
    <!-- Add Comment ( Only for logged-in users, which is not creators of the current game ) -->
    ${currId && idOwner !== currId ? html`
    <article class="create-comment">
        <label>Add new comment:</label>
        <form class="form" @submit=${comment} data-id=${data._id} data-ownerId=${data._ownerId}>
            <textarea name="comment" placeholder="Comment......"></textarea>
            <input class="btn submit" type="submit" value="Add Comment">
        </form>
    </article>` : html``}`;


    render(template, detailsSection);
    main.replaceChildren(detailsSection);

    return data;
}

async function comment(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);

    const id = e.target.getAttribute('data-id');
    const ownerId = e.target.getAttribute('data-ownerid')
    
    object.gameId = id;
    const url = 'data/comments';
    const response = requester('post', url, object);
    const data = await (await response).json();
    form.reset();
    details(id, ownerId);
    return data;
}

async function edit(e) {
    e.target ? e.preventDefault() : '';

    const id = e.target ? e.target.getAttribute('data-id') : e;
    const url = `data/games/${id}`;
    const response = await requester('get', url);
    const data = await response.json();

    const title = editSection.querySelectorAll('input')[0];
    const category = editSection.querySelectorAll('input')[1];
    const maxLevel = editSection.querySelectorAll('input')[2];
    const imageUrl = editSection.querySelectorAll('input')[3];
    const summary = editSection.querySelector('textarea');

    title.value = data.title;
    category.value = data.category;
    maxLevel.value = data.maxLevel;
    imageUrl.value = data.imageUrl;
    summary.value = data.summary;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/games/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.category === ''
        || object.maxLevel === '' || object.imageUrl === ''
        || object.summary === '') {
        return;
    }
    const response = await requester('put', url, object);

    const data = await response.json();
    edit(id);
    main.replaceChildren(editSection);
    form.reset();
    return data;
}

async function deleteItem(e) {
    e.preventDefault();
    const isConfirm = confirm("Press a button!");
    if (isConfirm) {
        const id = e.target.getAttribute('data-id');
        const url = `data/games/${id}`;
        const response = await requester('delete', url);

        const data = await response.json();
        showHome();
        return data;
    }
}

showNavbar();
showHome();