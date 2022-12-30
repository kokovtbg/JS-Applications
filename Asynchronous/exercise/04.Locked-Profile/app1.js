function lockedProfile() {
    let url = 'http://localhost:3030/jsonstore/advanced/profiles';
    let main = document.getElementById('main');
    main.innerHTML = '';

    let index = 1;
    fetch(url)
        .then(response => response.json())
        .then(data => Object.values(data).forEach(v => {

            let div = document.createElement('div');
            div.classList.add('profile');

            div.innerHTML =
                `<img src="./iconProfile2.png" class="userIcon" />
                <label>Lock</label>
                <input type="radio" name="user${index}Locked" value="lock" checked>
                <label>Unlock</label>
                <input type="radio" name="user${index}Locked" value="unlock"><br>
                <hr>
                <label>Username</label>
                <input type="text" name="user1Username" value="${v.username}" disabled readonly />
                <div class="user${index}Username hiddenInfo">
                    <hr>
                    <label>Email:</label>
                    <input type="email" name="user${index}Email" value="${v.email}" disabled readonly />
                    <label>Age:</label>
                    <input type="text" name="user${index}Age" value="${v.age}" disabled readonly />
                </div>`;

            let button = document.createElement('button');
            button.textContent = 'Show more';
            button.addEventListener('click', () => {
                let inputLock = div.querySelectorAll("input[type='radio']")[1];
                if (inputLock.checked && button.textContent === 'Show more') {
                    div.querySelector('div')
                        .classList.remove('hiddenInfo');
                    button.textContent = 'Hide it';
                } else if (inputLock.checked && button.textContent === 'Hide it') {
                    div.querySelector('div').classList.add('hiddenInfo');
                    button.textContent = 'Show more';
                }
            });
            div.appendChild(button);
            main.appendChild(div);
            index++;
        }));

}