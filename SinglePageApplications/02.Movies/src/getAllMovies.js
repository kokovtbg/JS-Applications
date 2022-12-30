// let idMovie;
// let idUser;
// let liked = false;
let likedMovies = new Map();
let userMovies = [];

export async function getMovies() {
  const url = 'http://localhost:3030/data/movies';
  const response = await fetch(url);
  const data = await response.json();
  renderMovies(data);
  return data;
}

function renderMovies(data) {
  const id = sessionStorage.getItem('id');
  const moviesList = document.getElementById('movies-list');
  moviesList.innerHTML = '';
  data.forEach(m => {
    const sectionMovie = document.createElement('section');
    sectionMovie.classList.add('view-section');
    sectionMovie.id = m._id;
    sectionMovie.innerHTML =
      `<div class="container">
          <div class="row bg-light text-dark">
            <h1>Movie title: ${m.title}</h1>

            <div class="col-md-8">
              <img
                class="img-thumbnail"
                src="${m.img}"
                alt="Movie"
              />
            </div>
            <div class="col-md-4 text-center">
              <h3 class="my-3">Movie Description</h3>
              <p>
                ${m.description}
              </p>
              <a class="btn btn-danger" href="#">Delete</a>
              <a class="btn btn-warning" href="#">Edit</a>
              <a class="btn btn-primary" href="#">Like</a>
              <span class="enrolled-span">Liked 1</span>
            </div>
          </div>
        </div>`;
    const aDelete = sectionMovie.querySelectorAll('a')[0];
    const aEdit = sectionMovie.querySelectorAll('a')[1];
    const aLike = sectionMovie.querySelectorAll('a')[2];
    aDelete.addEventListener('click', deleteMovie);
    aEdit.addEventListener('click', editMovie);
    aLike.addEventListener('click', likeMovie);
    let span = sectionMovie.querySelector('span');
    span.style.display = 'none';
    if (id && id === m._ownerId) {
      aLike.style.display = 'none';
    } else if (id) {
      aDelete.style.display = 'none';
      aEdit.style.display = 'none';
      // idMovie = m._id;
      // idUser = id;
      // getLikedData(id, m._id);
      
      const userMovie = userMovies.find(e => e.userId === id && e.movieId === m._id);
      if (userMovie) {
        aLike.style.display = 'none';
        span.style.display = 'inline';
        // countLikes(m._id);
        // const count = movieLiked;
        const countLikes = likedMovies.get(m._id);
        span.textContent = `Liked ${countLikes}`;
      }
    }
    if (!id) {
      aDelete.style.display = 'none';
      aEdit.style.display = 'none';
      aLike.style.display = 'none';
    }
    moviesList.appendChild(sectionMovie);
  })
  document.querySelector('#home-page #add-movie-button').style.display = 
  sessionStorage.getItem('email') ? 'block' : 'none';
}

async function getLikedData(idUser, idMovie) {
  const url = 'http://localhost:3030/data/likes';

  const response = await fetch(url);
  const data = await response.json();
  const element = data.find(e => e.movieId === idMovie && e._ownerId === idUser);
  
  if (element) {
    sessionStorage.setItem('movie', idMovie);
  }
  return data;
}

async function countLikes(id) {
  let movie = likedMovies.get(id);
  if (!movie) {
    likedMovies.set(id, 0);
  }
  const url = 'http://localhost:3030/data/likes';
  const response = await fetch(url);
  const data = await response.json();
  data.forEach(e => {
    if (e.movieId === id) {
      // sessionStorage.setItem(id, JSON.stringify(Number(sessionStorage.getItem(id)) + 1));
      likedMovies.set(id, likedMovies.get(id) + 1);
    }
  });
  return data;
}

export async function likeMovie(e) {
  e.preventDefault();
  const aLike = e.target;
  aLike.style.display = 'none';
  const id = e.target.parentElement.parentElement.parentElement.parentElement.id;
  const accessToken = sessionStorage.getItem('accessToken');
  const url = 'http://localhost:3030/data/likes';
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-Authorization': accessToken
    },
    body: JSON.stringify({ movieId: id })
  })
  const data = await response.json();

  const span = e.target.parentElement.querySelector('span');
  span.style.display = 'inline';
  
  const userMovie = {
    userId: sessionStorage.getItem('id'),
    movieId: id
  }
  userMovies.push(userMovie);
  countLikes(id);
  span.textContent = `Liked 1`;
  e.target.style.display = 'none';
  
  return data;
}

export async function editMovie(e) {
  e.preventDefault();
  const id = e.target.parentElement.parentElement.parentElement.parentElement.id;
  document.getElementById('edit-movie').style.display = 'block';
  document.getElementById('home-page').style.display = 'none';
  
  const inputs = document.querySelectorAll('#edit-movie input');
  const textarea = document.querySelector('#edit-movie textarea');

  const title = e.target.parentElement.parentElement.querySelector('h1');
  const description = e.target.parentElement.querySelector('p');
  const img = e.target.parentElement.parentElement.querySelector('img');

  inputs[0].value = title.textContent.substring(13);
  inputs[1].value = img.getAttribute('src');
  textarea.value = description.textContent;

  const form = document.querySelector('#edit-movie form');
  form.setAttribute('data-id', id);
  form.addEventListener('submit', onEdit);
}

async function onEdit(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.getAttribute('data-id');
  const formData = new FormData(form);
  const object = Object.fromEntries(formData);

  if (object.title === '' || object.img === '' || object.description === '') {
    return;
  }
  const accessToken = sessionStorage.getItem('accessToken');
  const url = `http://localhost:3030/data/movies/${id}`;
    const response = await fetch(url, {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': accessToken
        },
        body: JSON.stringify(object)
    })
    const dataFromResponse = await response.json();
    
    Array.from(form.querySelectorAll('input')).forEach(e => e.value = '');
    form.querySelector('textarea').value = '';
    getMovies();
    document.getElementById('edit-movie').style.display = 'none';
    document.getElementById('home-page').style.display = 'block';

    return dataFromResponse;
}

async function deleteMovie(e) {
  e.preventDefault();
  const id = e.target.parentElement.parentElement.parentElement.parentElement.id;

  const accessToken = sessionStorage.getItem('accessToken');
  const url = `http://localhost:3030/data/movies/${id}`;
    const response = await fetch(url, {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': accessToken
        }
    })
    const dataFromResponse = await response.json();
    
    getMovies();

    return dataFromResponse;
}