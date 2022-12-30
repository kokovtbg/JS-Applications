function loadRepos() {

	let username = document.getElementById('username');

	let url = `https://api.github.com/users/${username.value}/repos`;
	let repos = document.getElementById('repos');
	repos.innerHTML = '';
	fetch(url)
	.then(response => {
		if (response.status !== 200) {
			throw new Error(`Error ${response.status} ${response.statusText}`);
		}
		return response.json();
	})
	.then(data => data.forEach(e => {
		let li = document.createElement('li');
		
		let a = document.createElement('a');
		a.href = e.html_url;
		a.textContent = e.full_name;

		li.appendChild(a);
		repos.appendChild(li);
	}))
	.catch(error => {
		let li = document.createElement('li');
		li.textContent = error.message;
		repos.appendChild(li);
	});
}