import { html, render } from '../../../../../node_modules/lit-html/lit-html.js';
import { requester } from './api.js';

let main = document.getElementById('content');
const homeSection = document.querySelector('section.welcome-content');
const loginSection = document.getElementById('loginPage');
const registerSection = document.getElementById('registerPage');
const dashboard = document.getElementById('dashboard');
const animalsDiv = document.querySelector('#dashboard div.animals-dashboard');
const paragraphNoItems = animalsDiv.querySelector('p.no-pets');
animalsDiv.innerHTML = '';
const createSection = document.getElementById('createPage');
const detailsSection = document.getElementById('detailsPage');
const detailsDiv = detailsSection.querySelector('div.details');
detailsDiv.innerHTML = '';
const editSection = document.getElementById('editPage');


document.querySelectorAll('section').forEach((s, i) => i === 0 ? '' : s.remove());

const loginButton = document.querySelectorAll('nav ul li a')[2];
loginButton.addEventListener('click', login);
const registerButton = document.querySelectorAll('nav ul li a')[3];
registerButton.addEventListener('click', register);
const logoutButton = document.querySelectorAll('nav ul li a')[5];
logoutButton.addEventListener('click', logout);
const dashboardButton = document.querySelectorAll('nav ul li a')[1];
dashboardButton.addEventListener('click', showDashboard);
const homeButton = document.querySelectorAll('nav ul li a')[0];
homeButton.addEventListener('click', showHome);
const createButton = document.querySelectorAll('nav ul li a')[4];
createButton.addEventListener('click', create);

function showNavbar() {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        createButton.style.display = 'inline';
        logoutButton.style.display = 'inline';
    } else {
        loginButton.style.display = 'inline';
        registerButton.style.display = 'inline';
        createButton.style.display = 'none';
        logoutButton.style.display = 'none';

    }
}

function showHome(e) {
    e ? e.preventDefault() : '';
    main.replaceChildren(homeSection);
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
        || object['repeatPassword'] !== object.password) {
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

async function showDashboard(e) {
    e ? e.preventDefault() : '';

    const url = 'data/pets?sortBy=_createdOn%20desc&distinct=name';
    const response = await requester('get', url);
    const data = await response.json();
    const pets = data.map(p => html`
    <div class="animals-board">
        <article class="service-img">
            <img class="animal-image-cover" src=${p.image.substring(1)}>
        </article>
        <h2 class="name">${p.name}</h2>
        <h3 class="breed">${p.breed}</h3>
        <div class="action">
            <a class="btn" href="#" @click=${details} id=${p._id} data-id=${p._ownerId}>Details</a>
        </div>
    </div>`);


    render(pets, animalsDiv);
    if (data.length === 0) {
        animalsDiv.appendChild(paragraphNoItems);
    }

    main.replaceChildren(dashboard);
}

function create(e) {
    e.preventDefault();
    main.replaceChildren(createSection);
    createSection.addEventListener('submit', onCreate);
}

async function onCreate(e) {
    e.preventDefault();
    const url = 'data/pets';
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.name === '' || object.breed === ''
        || object.age === '' || object.weight === ''
        || object.image === '') {
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

    const url = `data/pets/${id}`;
    const response = await requester('get', url);
    const data = await response.json();

    const urlCountDonations = `data/donation?where=petId%3D%22${id}%22&distinct=_ownerId&count`;
    const responseCountDonations = await requester('get', urlCountDonations);
    const dataCountDonations = await responseCountDonations.json();

    const urlCountDonationsUser = `data/donation?where=petId%3D%22${id}%22%20and%20_ownerId%3D%22${currId}%22&count`;
    const responseCountDonationsUser = await requester('get', urlCountDonationsUser);
    const dataCountDonationsUser = await responseCountDonationsUser.json(); 

    const template = () => html`
    <div class="animalPic">
        <img src=${data.image.substring(1)}>
    </div>
    <div>
        <div class="animalInfo">
            <h1>Name: ${data.name}</h1>
            <h3>Breed: ${data.breed}</h3>
            <h4>Age: ${data.age}</h4>
            <h4>Weight: ${data.weight}</h4>
            <h4 class="donation">Donation: ${dataCountDonations > 0 ? dataCountDonations + '00' : dataCountDonations}$</h4>
        </div>
        <!-- if there is no registered user, do not display div-->
        ${idOwner === currId ? html`
        <div class="actionBtn">
            <!-- Only for registered user and creator of the pets-->
            <a href="#" class="edit" @click=${edit} data-id=${data._id}>Edit</a>
            <a href="#" class="remove" @click=${deleteItem} data-id=${data._id}>Delete</a>
            <!--(Bonus Part) Only for no creator and user-->
            <!-- <a href="#" class="donate">Donate</a> -->
        </div>` : html``}
        ${currId && idOwner !== currId && dataCountDonationsUser === 0 ? html`
        <div class="actionBtn">
            <!--(Bonus Part) Only for no creator and user-->
            <a href="#" class="donate" @click=${donate} data-id=${id} data-ownerId=${idOwner}>Donate</a>
        </div>` : html``}
    </div>`;


    render(template(), detailsDiv);
    main.replaceChildren(detailsSection);

    return data;
}

async function donate(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const ownerId = e.target.getAttribute('data-ownerId');
    const object = {petId: id};
    const url = 'data/donation';
    const response = await requester('post', url, object);
    const data = await response.json();

    details(id, ownerId);
    return data;
}

async function edit(e) {
    e.target ? e.preventDefault() : '';

    const id = e.target ? e.target.getAttribute('data-id') : e;
    const url = `data/pets/${id}`;
    const response = await requester('get', url);
    const data = await response.json();

    const img = editSection.querySelector('img');
    img.src = data.image.substring(1);

    const name = editSection.querySelectorAll('input')[0];
    const breed = editSection.querySelectorAll('input')[1];
    const age = editSection.querySelectorAll('input')[2];
    const weight = editSection.querySelectorAll('input')[3];
    const image = editSection.querySelectorAll('input')[4];

    name.value = data.name;
    breed.value = data.breed;
    age.value = data.age;
    weight.value = data.weight;
    image.value = data.image;

    main.replaceChildren(editSection);
    const form = editSection.querySelector('form');
    form.setAttribute('data-id', id);
    form.addEventListener('submit', onEdit);

    return data;
}

async function onEdit(e) {
    e.preventDefault();
    const id = e.target.getAttribute('data-id');

    const url = `data/pets/${id}`;
    const form = e.target;
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    if (object.name === '' || object.breed === ''
        || object.age === '' || object.weight === ''
        || object.image === '') {
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
        const url = `data/pets/${id}`;
        const response = await requester('delete', url);

        const data = await response.json();
        showHome();
        return data;
    }
}

showHome();
showNavbar();