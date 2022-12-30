import { getMovies } from "./getAllMovies.js";

document.querySelector('#add-movie-button a').addEventListener('click', addMovie)
document.querySelector('#add-movie').addEventListener('submit', addMovieSubmit);


export function addMovie() {
    document.getElementById('add-movie').style.display = 'block';
    document.getElementById('home-page').style.display = 'none';
}

export async function addMovieSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    if (data.title === '' || data.img === '' || data.description === '') {
        return;
    }
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
        return;
    }
    const url = 'http://localhost:3030/data/movies';
    const response = await fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': accessToken
        },
        body: JSON.stringify(data)
    })
    const dataFromResponse = await response.json();
    
    Array.from(form.querySelectorAll('input')).forEach(e => e.value = '');
    form.querySelector('textarea').value = '';
    getMovies();
    document.getElementById('add-movie').style.display = 'none';
    document.getElementById('home-page').style.display = 'block';

    return dataFromResponse;
}

