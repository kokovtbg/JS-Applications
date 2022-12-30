function loadCommits() {
    let username = document.getElementById('username');
    let repo = document.getElementById('repo');
    let commits = document.getElementById('commits');

    let url = `https://api.github.com/repos/${username.value}/${repo.value}/commits`;

    commits.innerHTML = '';
    fetch(url)
    .then(response => {
        if (response.status !== 200) {
            throw new Error(`Error: ${response.status} (Not Found)`);
        }
        return response.json();
    })
    .then(data => data.forEach(e => {
        let li = document.createElement('li');
        li.textContent = `${e.commit.author.name}: ${e.commit.message}`;
        commits.appendChild(li);
    }))
    .catch(err => {
        let li = document.createElement('li');
        li.textContent = err.message;
        commits.appendChild(li);
    })
}