let loadBookButton = document.querySelector('#loadBooks');
let url = 'http://localhost:3030/jsonstore/collections/books';
let tBodyElement = document.getElementsByTagName('tbody')[0];
let formElement = document.getElementsByTagName('form')[0];
let titleForm = formElement.querySelector('h3');
let buttonForm = formElement.querySelector('button');
let id = 0;

loadBookButton.addEventListener('click', loadBooks);

formElement.addEventListener('submit', function (e) {
    e.preventDefault();

    let formData = new FormData(e.target);
    formData = Object.fromEntries(formData);
    const urlSubmit = titleForm.textContent === 'FORM' ? 
    url : url + `/${id}`
    fetch(urlSubmit, {
        method: titleForm.textContent === 'FORM' ? 'post' : 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    })
    Array.from(formElement.querySelectorAll('input'))
        .forEach(i => i.value = '');
    titleForm.textContent = 'FORM';
    buttonForm.textContent = 'Submit';
})

async function loadBooks() {
    try {
        let response = await fetch(url);
        if (response.status !== 200) {
            throw new Error('Problem loading data')
        }
        let data = await response.json();
        let entries = Object.entries(data);
        tBodyElement.innerHTML = '';

        for (let [key, {author, title}] of entries) {
            let trElement = document.createElement('tr');
            let titleTDElement = document.createElement('td');
            titleTDElement.textContent = title;
            let authroTDElement = document.createElement('td');
            authroTDElement.textContent = author;
            
            trElement.appendChild(titleTDElement);
            trElement.appendChild(authroTDElement);

            let newTDElement = document.createElement('td');
            let editButton = document.createElement('button');
            let deleteButton = document.createElement('button');
            editButton.textContent = 'Edit';
            deleteButton.textContent = 'Delete';
            editButton.addEventListener('click', edit);
            deleteButton.addEventListener('click', remove);
            newTDElement.appendChild(editButton);
            newTDElement.appendChild(deleteButton);

            trElement.appendChild(newTDElement);
            tBodyElement.appendChild(trElement);

            function edit() {
                titleForm.textContent = 'Edit FORM';
                buttonForm.textContent = 'Save';
                let titleInput = formElement.querySelector("input[name='title']");
                let authorInput = formElement.querySelector("input[name='author']");
                titleInput.value = titleTDElement.textContent;
                authorInput.value = authroTDElement.textContent;
                id = key;
                // console.log(data);
                // fetch(`${url}/${key}`, {
                //     method: 'put',
                //     headers: {'Content-Type': 'application/json'},
                //     body: JSON.stringify(data)
                // })
            }

            function remove() {
                fetch(`${url}/${key}`, {
                    method: 'delete'
                })

                trElement.remove();
            }
        }
    } catch(err) {
        console.log(err);
    }
}