import { addMovie, addMovieSubmit } from "./addMovie.js";
import { login, onLogin, register, onRegister, onLogout } from "./auth.js";
import { getMovies } from "./getAllMovies.js";

const email = sessionStorage.getItem('email');

document
    .querySelectorAll('#add-movie, #movie-example, #edit-movie, #form-login, #form-sign-up')
    .forEach(e => e.style.display = 'none');
const moviesButton = document.querySelector('nav a');
moviesButton.addEventListener('click', gotoHome);

if (email) {
    document
        .querySelectorAll('nav ul li.guest')
        .forEach(e => e.style.display = 'none');
    document
        .querySelectorAll('nav ul li.user')
        .forEach(e => e.style.display = 'inline');
} else {
    document
        .querySelectorAll('nav ul li.guest')
        .forEach(e => e.style.display = 'inline');
    document
        .querySelectorAll('nav ul li.user')
        .forEach(e => e.style.display = 'none');
}

function gotoHome(e) {
    e.preventDefault();
    getMovies();
    document
        .querySelectorAll('#add-movie, #movie-example, #edit-movie, #form-login, #form-sign-up')
        .forEach(e => e.style.display = 'none');
    document.getElementById('home-page').style.display = 'block';
}

getMovies();