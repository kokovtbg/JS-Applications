import { html, render } from "../../../../../node_modules/lit-html/lit-html.js";
import { requester } from './api.js';

let main = document.getElementById('site-content');
const dashboard = document.getElementById('dashboard-page');
dashboard.innerHTML = '';
const loginSection = document.getElementById('login-page');
const registerSection = document.getElementById('register-page');
const createSection = document.getElementById('create-page');
const detailsSection = document.getElementById('details-page');
detailsSection.innerHTML = '';
const editSection = document.getElementById('edit-page');
const myBooksSection = document.getElementById('my-books-page');
myBooksSection.innerHTML = '';


document.querySelectorAll('section').forEach((s, i) => i === 0 ? '' : s.remove());


const loginButton = document.querySelector('#guest a');
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('#guest a')[1];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('#user a')[2];
logoutButton.addEventListener('click', logout);
const createButton = document.querySelectorAll('#user a')[1];
createButton.addEventListener('click', create);
const dashboardButton = document.querySelector('nav section a');
dashboardButton.addEventListener('click', showDashboard);
const myBooksButton = document.querySelector('#user a');
myBooksButton.addEventListener('click', showMyBooks);


function showNavbar() {
    const email = sessionStorage.getItem('email');
    if (email) {
        document.getElementById('guest').style.display = 'none';
        document.getElementById('user').style.display = 'inline';
        document.querySelector('#user span').textContent = `Welcome, ${email}`;
    } else {
        document.getElementById('guest').style.display = 'inline';
        document.getElementById('user').style.display = 'none';
    }
}

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/books?sortBy=_createdOn%20desc';
    const data = await requester('get', url);
    
    const template = html`
    <h1>Dashboard</h1>
    <!-- Display ul: with list-items for All books (If any) -->
    <ul class="other-books-list">
        ${data.map(b => html`
        <li class="otherBooks">
            <h3>${b.title}</h3>
            <p>Type: ${b.type}</p>
            <p class="img"><img src=".${b.imageUrl}"></p>
            <a class="button" href="#" @click=${details} id=${b._id} data-id=${b._ownerId}>Details</a>
        </li>`)}
    
    </ul>
    <!-- Display paragraph: If there are no books in the database -->
    ${data.length === 0 ? html`<p class="no-books">No books in database!</p>` : html``}`

    render(template, dashboard);
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

    const data = await requester('post', 'users/login', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);

    form.reset();
    showDashboard();
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
        || object['confirm-pass'] !== object.password) {
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/register', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('email', data.email);

    form.reset();
    showDashboard();
    showNavbar();

    return data;
}

async function logout(e) {
    e.preventDefault();
    const response = await requester('get', 'users/logout');

    sessionStorage.clear();
    showNavbar();
    showDashboard();
    return response;
}

function create(e) {
    e.preventDefault();
    main.replaceChildren(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/books';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.description === ''
        || object.imageUrl === '' || object.type === '') {
        return;
    }
    const data = await requester('post', url, object);

    showDashboard();
    form.reset();
    return data;
}

async function details(e, ownerId) {
    e.target ? e.preventDefault() : '';
    const id = e.target ? e.target.id : e;
    const idOwner = e.target ? e.target.getAttribute('data-id') : ownerId;
    const currId = sessionStorage.getItem('id');

    const url = `data/books/${id}`;
    const data = await requester('get', url);
    
    const urlLikes = `data/likes?where=bookId%3D%22${id}%22&distinct=_ownerId&count`;
    const dataLikes = await requester('get', urlLikes);
    
    const urlLikesUser = `data/likes?where=bookId%3D%22${id}%22%20and%20_ownerId%3D%22${currId}%22&count`;
    const dataLikesUser = await requester('get', urlLikesUser);
    
    const template = () => html`
    <div class="book-information">
        <h3>${data.title}</h3>
        <p class="type">Type: ${data.type}</p>
        <p class="img"><img src=".${data.imageUrl}"></p>
        <div class="actions">
            <!-- Edit/Delete buttons ( Only for creator of this book )  -->
            ${idOwner === currId ? html`
            <a class="button" href="#" @click=${edit} data-id=${data._id}>Edit</a>
            <a class="button" href="#" @click=${deleteItem} data-id=${data._id}>Delete</a>` : html``}
    
            <!-- Bonus -->
            <!-- Like button ( Only for logged-in users, which is not creators of the current book ) -->
            ${currId && idOwner !== currId && dataLikesUser === 0 ? html`<a class="button" href="#" @click=${like} data-id=${data._id} data-ownerId=${data._ownerId}>Like</a>` : html``}
    
            <!-- ( for Guests and Users )  -->
            <div class="likes">
                <img class="hearts" src="./images/heart.png">
                <span id="total-likes">Likes: ${dataLikes}</span>
            </div>
            <!-- Bonus -->
        </div>
    </div>
    <div class="book-description">
        <h3>Description:</h3>
        <p>${data.description}</p>
    </div>`;


    render(template(), detailsSection);
    main.replaceChildren(detailsSection);

    return data;
}

async function like(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const ownerId = e.target.getAttribute('data-ownerId');
    const object = {
        bookId: id
    }
    const url = 'data/likes';
    const data = await requester('post', url, object);
    details(id, ownerId);
    return data;
}

async function edit(e) {
    e.preventDefault();

    const id = e.target.getAttribute('data-id');
    const url = `data/books/${id}`;
    const data = await requester('get', url);
    
    const title = editSection.querySelectorAll('input')[0];
    const description = editSection.querySelector('textarea');
    const image = editSection.querySelectorAll('input')[1];
    const type = editSection.querySelector('select');

    title.value = data.title;
    description.value = data.description;
    image.value = data.imageUrl;
    type.value = data.type;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/books/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.title === '' || object.description === ''
        || object.imageUrl === '' || object.type === '') {
        return;
    }
    const data = await requester('put', url, object);

    details(id, data._ownerId);
    form.reset();
    return data;
}

async function deleteItem(e) {
    e.preventDefault();
    const isConfirm = confirm("Press a button!");
    if (isConfirm) {
        const id = e.target.getAttribute('data-id');
        const url = `data/books/${id}`;
        const data = await requester('delete', url);

        showDashboard();
        return data;
    }
}

async function showMyBooks(e) {
    e.preventDefault();

    const userId = sessionStorage.getItem('id');
    const url = `data/books?where=_ownerId%3D%22${userId}%22&sortBy=_createdOn%20desc`;
    const data = await requester('get', url);
    
    const template = () => html`
    <h1>My Books</h1>
    <!-- Display ul: with list-items for every user's books (if any) -->
    <ul class="my-books-list">
        ${data.map(b => html`
        <li class="otherBooks">
            <h3>${b.title}</h3>
            <p>Type: ${b.type}</p>
            <p class="img"><img src=".${b.imageUrl}"></p>
            <a class="button" href="#" @click=${details} id=${b._id} data-id=${b._ownerId}>Details</a>
        </li>`)}
        
    </ul>
    
    <!-- Display paragraph: If the user doesn't have his own books  -->
    ${data.length === 0 ? html`<p class="no-books">No books in database!</p>` : html``}`

    render(template(), myBooksSection);
    main.replaceChildren(myBooksSection);
}

showDashboard();
showNavbar();