const button = document.getElementById('submit');
button.addEventListener('click', addStudent);

async function getStudents() {
    const url = 'http://localhost:3030/jsonstore/collections/students';
    const response = await fetch(url);
    const data = await response.json();

    const bodyTable = document.querySelector('table tbody');
    bodyTable.innerHTML = '';
    Object.values(data).forEach(s => {
        const firstName = s.firstName;
        const lastName = s.lastName;
        const facultyNumber = s.facultyNumber;
        const grade = s.grade;
        
        const row = document.createElement('tr');
        const firstNameTD = document.createElement('td');
        firstNameTD.textContent = firstName;
        const lastNameTD = document.createElement('td');
        lastNameTD.textContent = lastName;
        const facultyNumberTD = document.createElement('td');
        facultyNumberTD.textContent = facultyNumber;
        const gradeTD = document.createElement('td');
        gradeTD.textContent = grade;

        row.appendChild(firstNameTD);
        row.appendChild(lastNameTD);
        row.appendChild(facultyNumberTD);
        row.appendChild(gradeTD);

        bodyTable.appendChild(row);
    })
}

async function addStudent(e) {
    e.preventDefault();
    let inputs = Array.from(document.querySelectorAll('form input'));
    if (inputs[0].value === '' || inputs[1].value === '' 
        || inputs[2].value === '' || inputs[3].value === '') {
        return;
    }
    const facNumber = inputs[2].value;
    for (let i = 0; i < facNumber.length; i++) {
        const element = facNumber[i];
        if (!Number.isInteger(Number(element))) {
            return;
        }
    }
    if (!Number(inputs[3].value)) {
        return;
    }
    
    let url = 'http://localhost:3030/jsonstore/collections/students';
    let formData = new FormData(e.target.parentElement);
    
    formData = Object.fromEntries(formData.entries());
    
    const response = await fetch(url, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    });
    getStudents();
    
    inputs.forEach(e => e.value = '');
}

getStudents();