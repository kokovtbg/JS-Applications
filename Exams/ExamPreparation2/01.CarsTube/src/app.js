import { html, render } from '../../../../../node_modules/lit-html/lit-html.js';
import { requester } from './api.js';

let main = document.getElementById('site-content');
const homeSection = document.getElementById('main');
const loginSection = document.getElementById('login');
const registerSection = document.getElementById('register');
const dashboard = document.getElementById('car-listings');
dashboard.innerHTML = '';
const createSection = document.getElementById('create-listing');
const detailsSection = document.getElementById('listing-details');
detailsSection.innerHTML = '';
const editSection = document.getElementById('edit-listing');
const myCarsSection = document.getElementById('my-listings');
myCarsSection.innerHTML = '';


document.querySelectorAll('section').forEach(s => s.remove());


const homeButton = document.querySelector('nav a');
homeButton.addEventListener('click', showHome);
const loginButton = document.querySelector('#guest a');
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('#guest a')[1];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('#profile a')[3];
logoutButton.addEventListener('click', logout);
const dashboardButton = document.querySelectorAll('nav a')[1];
dashboardButton.addEventListener('click', showDashboard);
const createButton = document.querySelectorAll('#profile a')[2];
createButton.addEventListener('click', create);
const myCarsButton = document.querySelectorAll('#profile a')[1];
myCarsButton.addEventListener('click', showMyCars);


function showHome(e) {
    e ? e.preventDefault() : '';
    main.replaceChildren(homeSection);
}

function showNavbar() {
    const username = sessionStorage.getItem('username');
    if (username) {
        document.getElementById('guest').style.display = 'none';
        document.getElementById('profile').style.display = 'inline';
        document.querySelector('#profile a').textContent = `Welcome ${username}`;
    } else {
        document.getElementById('guest').style.display = 'inline';
        document.getElementById('profile').style.display = 'none';
    }
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
    if (object.username === '' || object.password === '') {
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/login', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('username', data.username);

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
    if (object.username === '' || object.password === ''
        || object['repeatPass'] !== object.password) {
        window.alert('No user');
        return;
    }

    const data = await requester('post', 'users/register', object);

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('username', data.username);

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
    showHome();
    return response;
}

async function showDashboard(e) {
    e ? e.preventDefault : '';
    const token = sessionStorage.getItem('accessToken');

    const url = 'data/cars?sortBy=_createdOn%20desc';
    const data = await requester('get', url);
    
    const template = html`
    <h1>Car Listings</h1>
    <div class="listings">
    
        <!-- Display all records -->
        ${data.map(c => html`
        <div class="listing">
            <div class="preview">
                <img src=".${c.imageUrl}">
            </div>
            <h2>${c.brand} ${c.model}</h2>
            <div class="info">
                <div class="data-info">
                    <h3>Year: ${c.year}</h3>
                    <h3>Price: ${c.price} $</h3>
                </div>
                <div class="data-buttons">
                    <a href="#" class="button-carDetails" @click=${details} id=${c._id} data-id=${c._ownerId}>Details</a>
                </div>
            </div>
        </div>`)}
    
    
    
        <!-- Display if there are no records -->
        ${data.length === 0 ? html`
        <p class="no-cars">No cars in database.</p>` : html``}
    </div>`;

    render(template, dashboard);
    main.replaceChildren(dashboard);
}

function create(e) {
    e.preventDefault();
    main.replaceChildren(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/cars';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.brand === '' || object.model === ''
        || object.description === '' || object.year === ''
        || object.imageUrl === '' || object.price === '') {
        return;
    }
    if (!Number(object.price) || !Number(object.year)
        || Number(object.price) <= 0 || Number(object.year) <= 0) {
        return;
    }
    object.price = Number(object.price);
    object.year = Number(object.year);
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

    const url = `data/cars/${id}`;
    const data = await requester('get', url);
    
    const template = () => html`
    <h1>Details</h1>
    <div class="details-info">
        <img src=".${data.imageUrl}">
        <hr>
        <ul class="listing-props">
            <li><span>Brand:</span>${data.brand}</li>
            <li><span>Model:</span>${data.model}</li>
            <li><span>Year:</span>${data.year}</li>
            <li><span>Price:</span>${data.price}$</li>
        </ul>
    
        <p class="description-para">${data.description}</p>
    
        ${idOwner === currId ? html`
        <div class="listings-buttons">
            <a href="#" class="button-list" @click=${edit} data-id=${data._id}>Edit</a>
            <a href="#" class="button-list" @click=${deleteItem} data-id=${data._id}>Delete</a>
        </div>` : html``}
    </div>`;


    render(template(), detailsSection);
    main.replaceChildren(detailsSection);

    return data;
}

async function edit(e) {
    e.preventDefault();

    const id = e.target.getAttribute('data-id');
    const url = `data/cars/${id}`;
    const data = await requester('get', url);
    
    const brand = editSection.querySelectorAll('input')[0];
    const model = editSection.querySelectorAll('input')[1];
    const description = editSection.querySelectorAll('input')[2];
    const year = editSection.querySelectorAll('input')[3];
    const imageUrl = editSection.querySelectorAll('input')[4];
    const price = editSection.querySelectorAll('input')[5];

    brand.value = data.brand;
    model.value = data.model;
    description.value = data.description;
    year.value = data.year;
    imageUrl.value = data.imageUrl;
    price.value = data.price;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/cars/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.brand === '' || object.model === ''
        || object.description === '' || object.year === ''
        || object.imageUrl === '' || object.price === '') {
        return;
    }
    if (!Number(object.price) || !Number(object.year)
        || Number(object.price) <= 0 || Number(object.year) <= 0) {
        return;
    }
    object.price = Number(object.price);
    object.year = Number(object.year);

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
        const url = `data/cars/${id}`;
        const data = await requester('delete', url);

        showDashboard();
        return data;
    }
}

async function showMyCars(e) {
    e.preventDefault();

    const userId = sessionStorage.getItem('id');

    const url = `data/cars?where=_ownerId%3D%22${userId}%22&sortBy=_createdOn%20desc`;
    const data = await requester('get', url);
    
    const template = html`
    <h1>My car listings</h1>
    <div class="listings">
    
        <!-- Display all records -->
        ${data.map(c => html`
        <div class="listing">
            <div class="preview">
                <img src=".${c.imageUrl}">
            </div>
            <h2>${c.brand} ${c.model}</h2>
            <div class="info">
                <div class="data-info">
                    <h3>Year: ${c.year}</h3>
                    <h3>Price: ${c.price} $</h3>
                </div>
                <div class="data-buttons">
                    <a href="#" class="button-carDetails" @click=${details} id=${c._id} data-id=${c._ownerId}>Details</a>
                </div>
            </div>
        </div>`)}
    
        <!-- Display if there are no records -->
        ${data.length === 0 ? html`
        <p class="no-cars"> You haven't listed any cars yet.</p>` : html``}
    </div>`

    render(template, myCarsSection);
    main.replaceChildren(myCarsSection);

}

showHome();
showNavbar();