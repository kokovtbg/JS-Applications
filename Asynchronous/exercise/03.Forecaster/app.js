function attachEvents() {
    let submitBtn = document.getElementById('submit');
    submitBtn.addEventListener('click', viewForecast);
    let locationInput = document.getElementById('location');
    let forecastDiv = document.getElementById('forecast');
    let currenDiv = document.getElementById('current');
    let upcomingDiv = document.getElementById('upcoming');

    let code = '';
    let name = '';
    let today = {};
    let upcoming = [];

    function viewForecast() {

        let url = `http://localhost:3030/jsonstore/forecaster/locations`;

        
        fetch(url)
            .then(response => response.json())
            .then(data => data.forEach(e => {
                if (locationInput.value === e.name) {
                    code = e.code;

                    let urlToday = `http://localhost:3030/jsonstore/forecaster/today/${code}`;
                    fetch(urlToday)
                        .then(response => response.json())
                        .then(data => {
                            name = data.name;
                            today.low = data.forecast.low;
                            today.high = data.forecast.high;
                            today.condition = data.forecast.condition;

                            let urlUpcoming = `http://localhost:3030/jsonstore/forecaster/upcoming/${code}`;
                            fetch(urlUpcoming)
                                .then(response => response.json())
                                .then(data => {
                                    data.forecast.forEach(d => upcoming.push(d));

                                    forecastDiv.style.display = 'block';
                                    
                                    let divForecasts = document.createElement('div');
                                    divForecasts.classList.add('forecasts');
                                    
                                    let spanCondSymbol = document.createElement('span');
                                    spanCondSymbol.classList.add('condition');
                                    spanCondSymbol.classList.add('symbol');
                                    // •	Sunny			&#x2600; // ☀
                                    // •	Partly sunny	&#x26C5; // ⛅
                                    // •	Overcast		&#x2601; // ☁
                                    // •	Rain			&#x2614; // ☂
                                    // •	Degrees		&#176;   // °

                                    
                                    switch (today.condition) {
                                        case 'Sunny':
                                            spanCondSymbol.innerHTML = '&#x2600;';
                                            break;
                                        case 'Partly sunny':
                                            spanCondSymbol.innerHTML = '&#x26C5;';
                                            break;
                                        case 'Overcast':
                                            spanCondSymbol.innerHTML = '&#x2601;';
                                            break;
                                        case 'Rain':
                                            spanCondSymbol.innerHTML = '&#x2614;';
                                            break;
                                    }
                                    let spanCond = document.createElement('span');
                                    spanCond.classList.add('condition');

                                    let spanName = document.createElement('span');
                                    spanName.classList.add('forecast-data');
                                    spanName.textContent = name;

                                    let spanTemp = document.createElement('span');
                                    spanTemp.classList.add('forecast-data');
                                    spanTemp.innerHTML = today.low + '&#176;/' + today.high + '&#176;';
                                    
                                    let spanCondition = document.createElement('span');
                                    spanCondition.classList.add('forecast-data');
                                    spanCondition.textContent = today.condition;

                                    spanCond.appendChild(spanName);
                                    spanCond.appendChild(spanTemp);
                                    spanCond.appendChild(spanCondition);

                                    divForecasts.appendChild(spanCondSymbol);
                                    divForecasts.appendChild(spanCond);

                                    currenDiv.appendChild(divForecasts);


                                    // second Div----------
                                    let divForInfo = document.createElement('div');
                                    divForInfo.classList.add('forecast-info');

                                    upcoming.forEach(d => {
                                        let spanUpcoming = document.createElement('span');
                                        spanUpcoming.classList.add('upcoming');

                                        let spanSymbol = document.createElement('span');
                                        spanSymbol.classList.add('symbol');

                                        switch (d.condition) {
                                            case 'Sunny':
                                                spanSymbol.innerHTML = '&#x2600;';
                                                break;
                                            case 'Partly sunny':
                                                spanSymbol.innerHTML = '&#x26C5;';
                                                break;
                                            case 'Overcast':
                                                spanSymbol.innerHTML = '&#x2601;';
                                                break;
                                            case 'Rain':
                                                spanSymbol.innerHTML = '&#x2614;';
                                                break;
                                        }

                                        let spanTemp = document.createElement('span');
                                        spanTemp.classList.add('forecast-data');
                                        spanTemp.innerHTML = d.low + '&#176;/' + d.high + '&#176;';

                                        let spanCondition = document.createElement('span');
                                        spanCondition.classList.add('forecast-data');
                                        spanCondition.textContent = d.condition;

                                        spanUpcoming.appendChild(spanSymbol);
                                        spanUpcoming.appendChild(spanTemp);
                                        spanUpcoming.appendChild(spanCondition);

                                        divForInfo.appendChild(spanUpcoming);
                                        upcomingDiv.appendChild(divForInfo);
                                    })
                                    


                                })
                        });
                }
            }));
    }

}

attachEvents();