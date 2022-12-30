function solution() {
    let main = document.getElementById('main');
    let urlAll = `http://localhost:3030/jsonstore/advanced/articles/list`;

    fetch(urlAll)
        .then(response => response.json())
        .then(data => data.forEach(e => {
            let div = document.createElement('div');
            div.classList.add('accordion');
            div.innerHTML =
                `<div class="head">
                <span>${e.title}</span>
                <button class="button" id="${e._id}">More</button>
            </div>
            <div class="extra">
                <p></p>
            </div>`;
            let urlDetails = `http://localhost:3030/jsonstore/advanced/articles/details/${e._id}`;
            fetch(urlDetails)
                    .then(response => response.json())
                .then(data => {
                    let par = div.querySelector('.extra p');
                    par.textContent = data.content;
                })
            main.appendChild(div);
            div.querySelector('button').addEventListener('click', (e) => {

                let target = e.target;
                let extraDivE = e.target.parentElement.parentElement.children[1];

                if (target.textContent == 'More') {
                    target.textContent = 'Less';
                    extraDivE.style.display = 'inline';                            
                } else {
                    target.textContent = 'More';
                    extraDivE.style.display = 'none';
                }
            })
        }))
}

solution();