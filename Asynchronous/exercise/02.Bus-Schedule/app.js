function solve() {
    let messageSpan = document.querySelector('div span');
    let departButtton = document.getElementById('depart');
    let arriveButton = document.getElementById('arrive');
    let count = 0;
    let nextStation = '';
    
    function depart() {
        let url = count === 0 ? 
        `http://localhost:3030/jsonstore/bus/schedule/depot` : 
        `http://localhost:3030/jsonstore/bus/schedule/${nextStation}`;
        fetch(url)
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Error');
                }
                return response.json();
            })
            .then(data => {
                messageSpan.textContent = `Next stop ${data.name}`;
                departButtton.disabled = true;
                arriveButton.disabled = false;
            })
            .catch(err => messageSpan.textContent = err.message);
        count++;
    }

    function arrive() {
        let url = count === 1 ? 
        `http://localhost:3030/jsonstore/bus/schedule/depot` : 
        `http://localhost:3030/jsonstore/bus/schedule/${nextStation}`;
        fetch(url)
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Error');
                }
                return response.json();
            })
            .then(data => {
                messageSpan.textContent = `Arriving at ${data.name}`;
                departButtton.disabled = false;
                arriveButton.disabled = true;
                nextStation = data.next;
            })
            .catch(err => messageSpan.textContent = err.message);
    }

    return {
        depart,
        arrive
    };
}

let result = solve();