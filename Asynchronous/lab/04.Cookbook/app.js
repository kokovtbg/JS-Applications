function loadRecipes() {
    let main = document.querySelector('main');
    main.innerHTML = '';

    let url = 'http://localhost:3030/jsonstore/cookbook/recipes';
    fetch(url)
    .then(response => response.json())
    .then(data => Object.entries(data).forEach(([k, v]) => {
        let article = document.createElement('article');
        article.classList.add('preview');
        
        let divTitle = document.createElement('div');
        divTitle.classList.add('title');
        let h2 = document.createElement('h2');
        h2.textContent = v.name;
        divTitle.appendChild(h2);

        let divImg = document.createElement('div');
        divImg.classList.add('small');
        let img = document.createElement('img');
        img.src = v.img;
        divImg.appendChild(img);

        let parKey = document.createElement('p');
        parKey.textContent = k;
        parKey.hidden = true;

        article.appendChild(divTitle);
        article.appendChild(divImg);
        article.appendChild(parKey);
        article.addEventListener('click', viewDetails);
        main.appendChild(article);
    }))
    .catch(err => console.log(err));
    
    function viewDetails(e) {
        let article = e.target;
        let id = article.querySelector('p').textContent;
        let urlDetails = `http://localhost:3030/jsonstore/cookbook/details/${id}`;
        
        fetch(urlDetails)
        .then(response => response.json())
        .then(data => {
            let articleDetails = document.createElement('article');
            let ingredients = [];
            data.ingredients.forEach(i => {
                ingredients.push(`<li>${i}</li>`);
            });
            let steps = [];
            data.steps.forEach(s => {
                steps.push(`<p>${s}</p>`);
            });
            articleDetails.innerHTML = 
            `
            <h2>${data.name}</h2>
            <div class="band">
                <div class="thumb">
                    <img src="${data.img}">
                </div>
                <div class="ingredients">
                    <h3>Ingredients:</h3>
                    <ul>
                    ${ingredients.join('\n')}
                    </ul>
                </div>
            </div>
            <div class="description">
                <h3>Preparation:</h3>
                ${steps.join('\n')}
            </div>
            `;
            article.replaceWith(articleDetails);
        })
        .catch(err => console.log(err));
    }
}