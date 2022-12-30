async function getInfo() {
    let stopId = document.getElementById('stopId');

    let stopIdValue = stopId.value;
    let url = `http://localhost:3030/jsonstore/bus/businfo/${stopIdValue}`;

    let stopNameDiv = document.getElementById('stopName');
    
    let busesUl = document.getElementById('buses');
    busesUl.innerHTML = '';
    stopId.value = '';

    try {
        const response = await fetch(url);
        const data = await response.json();

        stopNameDiv.textContent = data.name;
        Object.entries(data.buses).forEach(([busNumber, timeArrive]) => {
            const li = document.createElement('li');
            li.textContent = `Bus ${busNumber} arrives in ${timeArrive} minutes`;
            busesUl.appendChild(li);
        })
    } catch(err) {
        stopNameDiv.textContent = 'Error';
    }
}