function attachEvents() {
    const refreshBtn = document.getElementById('refresh');
    refreshBtn.addEventListener('click', getAllMessages);

    const submitBtn = document.getElementById('submit');
    submitBtn.addEventListener('click', postMessage);
}

async function getAllMessages() {
    const url = 'http://localhost:3030/jsonstore/messenger';
    const response = await fetch(url);
    const data = await response.json();
    const messagesArea = document.getElementById('messages');
    
    let messagesArr = [];
    Object.values(data)
        .forEach(e =>  messagesArr.push(`${e.author}: ${e.content}`));
    messagesArea.value = messagesArr.join('\n');
}

async function postMessage() {
    const url = 'http://localhost:3030/jsonstore/messenger';
    
    const authorInput = document.querySelector("input[name='author']");
    const contentInput = document.querySelector("input[name='content']");
    const author = authorInput.value;
    const content = contentInput.value;

    const response = await fetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({author, content})
    });
    const data = await response.json();

    authorInput.value = '';
    contentInput.value = '';
}

attachEvents();