import { getMovies } from "./getAllMovies.js";

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', login);
const loginButton = document.querySelectorAll("nav ul li a")[2];
loginButton.addEventListener('click', onLogin);
const registerButton = document.querySelectorAll('nav ul li a')[3];
registerButton.addEventListener('click', onRegister);
const registerForm = document.getElementById('form-sign-up');
registerForm.addEventListener('submit', register);
const logoutButton = document.querySelectorAll('nav ul li a')[1];
logoutButton.addEventListener('click', onLogout);

export function onLogin() {
    document.getElementById('form-login').style.display = 'block';
    document
        .querySelectorAll('#home-page, #add-movie, #movie-example, #edit-movie, #form-sign-up')
        .forEach(e => e.style.display = 'none');
}

export async function login(e) {
    e.preventDefault();
    const url = 'http://localhost:3030/users/login';
    const form = e.target;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData);
    try {
        const response = await fetch(url, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        if (response.status !== 200) {
            throw new Error('Invalid data');
        }
        const data = await response.json();
        
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('id', data._id);
        
        document
            .querySelectorAll('nav ul li.user')
            .forEach(e => e.style.display = 'inline');
        document.getElementById('welcome-msg').textContent = `Welcome, ${data.email}`;
        document
            .querySelectorAll('nav ul li.guest')
            .forEach(e => e.style.display = 'none');
        document.getElementById('home-page').style.display = 'block';
        document.getElementById('form-login').style.display = 'none';
        document.querySelector('#home-page #add-movie-button').style.display = 'block';
        getMovies();

        Array.from(form.querySelectorAll('input')).forEach(i => i.value = '');
        const span = loginForm.querySelector('span');
        if (span) {
            loginForm.removeChild(span);
        }
        return data;
    } catch(err) {
        const span = document.createElement('span');
        span.textContent = err.message;
        if (!loginForm.querySelector('span')) {
            loginForm.appendChild(span);
        }
    }
}

export function onRegister() {
    document.getElementById('form-sign-up').style.display = 'block';
    document
        .querySelectorAll('#home-page, #add-movie, #movie-example, #edit-movie, #form-login')
        .forEach(e => e.style.display = 'none');
} 

export async function register(e) {
    e.preventDefault();
    const url = 'http://localhost:3030/users/register';
    const form = e.target;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData);
    
    try {
        if (body.email === '' || body.password.length < 6 
            || body.repeatPassword !== body.password) {
            throw new Error('Invalid data!');        
        }
        const response = await fetch(url, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });
        if (response.status !== 200) {
            throw new Error('Invalid data');
        }
        const data = await response.json();
        
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('id', data._id);
        
        document
            .querySelectorAll('nav ul li.user')
            .forEach(e => e.style.display = 'inline');
        document.getElementById('welcome-msg').textContent = `Welcome, ${data.email}`;
        document
            .querySelectorAll('nav ul li.guest')
            .forEach(e => e.style.display = 'none');

        Array.from(form.querySelectorAll('input')).forEach(i => i.value = '');
        document.getElementById('home-page').style.display = 'block';
        document.getElementById('form-sign-up').style.display = 'none';
        document.querySelector('#home-page #add-movie-button').style.display = 'inline';
        getMovies();

        const span = registerForm.querySelector('span');
        if (span) {
            registerForm.removeChild(span);
        }
        return data;
    } catch(err) {
        const span = document.createElement('span');
        span.textContent = err.message;
        if (!registerForm.querySelector('span')) {
            registerForm.appendChild(span);
        }
    }
}

export async function onLogout() {
    const url = 'http://localhost:3030/users/logout';
    const accessToken = sessionStorage.getItem('accessToken');
    const response = await fetch(url, {
        method: 'get',
        headers: { 
            'Content-Type': 'application/json',
            'X-Authorization': JSON.stringify(accessToken)
        }
    })
    const data = await response.json();
    
    sessionStorage.clear();
    
    document
        .querySelectorAll('nav ul li.user')
        .forEach(e => e.style.display = 'none');
    document.getElementById('welcome-msg').textContent = `Welcome, guest`;
    document
        .querySelectorAll('nav ul li.guest')
        .forEach(e => e.style.display = 'inline');
    getMovies();
    document.querySelector('#home-page #add-movie-button').style.display = 'none';

    return data;
}