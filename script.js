var activeFilters = {};
var datePickerInstance;

async function fetchSheetData() {
    try {
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/17FduGsy6e8Pih3Trvo3DtmCaYab86K0v0Ecmbbv0rfk/values/Sheet1?key=AIzaSyCkasty24BxbvXuoek8Pip-U_yRWy3Rk6s');
        const data = await response.json();
        const rows = data.values;

        const table = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
        table.innerHTML = "";

        for (let i = 1; i < rows.length; i++) {
            let newRow = table.insertRow();
            for (let j = 0; j < rows[i].length; j++) {
                let cell = newRow.insertCell(j);
                if (j === 7 && rows[i][j]) {
                    let a = document.createElement('a');
                    a.href = rows[i][j];
                    a.textContent = "Link";
                    cell.appendChild(a);
                } else if (j === 2) {
                    // Format the date cells to "Tue, 14 Feb"
                    let date = moment(rows[i][j], 'DD/MM/YYYY');
                    cell.textContent = date.format('ddd, DD MMM');
                } else {
                    cell.textContent = rows[i][j];
                }
            }
        }
        populateFilterOptions();
    } catch (error) {
        console.error('Error fetching sheet data:', error);
    }
}

async function populateFilterOptions() {
    let rows = Array.from(document.getElementById('infoTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr'));
    rows = rows.filter(row => row.style.display !== 'none');

    for (let i = 0; i < 7; i++) {
        if (i !== 2) { 
            let uniqueValues = [...new Set(rows.map(row => row.getElementsByTagName('td')[i]?.textContent))];
            let dropdown = document.getElementById('filter' + i);
            dropdown.innerHTML = uniqueValues.map((value, index) => `<div onclick="filterTable(${i}, '${value.replace("'", "\\'")}')">${value}</div>`).join('');
        }
    }
}

function hideDropdown(index) {
    var dropdown = document.getElementById('filter' + index);
    dropdown.style.display = 'none';
}

function toggleDropdown(index) {
    var dropdown = document.getElementById('filter' + index);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function filterTable(colIndex, filterValue) {
    var table = document.getElementById('infoTable');
    var rows = table.querySelectorAll('tr');
    var isFilterActive = false;

    for (var i = 1; i < rows.length; i++) {
        var cellValue = rows[i].cells[colIndex].innerText;
        if (cellValue !== filterValue) {
            rows[i].style.display = 'none';
        } else {
            rows[i].style.display = '';
            isFilterActive = true;  // Moved inside the loop to correctly detect any matching row
        }
    }

    var filterIndicator = document.getElementById('filterIndicator');
    var filterText = document.getElementById('filterText');
    if (isFilterActive) {
        filterIndicator.style.display = 'block';
        filterText.innerText = 'Filtered by: ' + filterValue;
    } else {
        filterIndicator.style.display = 'none';
    }
}


function applyFilters() {
    const table = document.getElementById('infoTable');
    const tr = table.getElementsByTagName('tr');
    for (let i = 1; i < tr.length; i++) {
        tr[i].style.display = "";
        let td = tr[i].getElementsByTagName('td');
        let hide = false;
        for (let [columnIndex, filterValue] of Object.entries(activeFilters)) {
            if (td[columnIndex].textContent !== filterValue) {
                hide = true;
                break;
            }
        }
        if (hide) {
            tr[i].style.display = "none";
        }
    }
    populateFilterOptions();
}

function updateFilterIndicator() {
    console.log('updateFilterIndicator called');
    let filterIndicator = document.getElementById('filterIndicator');
    let filterText = document.getElementById('filterText');
    filterText.innerHTML = "";
    for (let [columnIndex, filterValue] of Object.entries(activeFilters)) {
        let filterChip = document.createElement('div');
        filterChip.className = 'filter-chip';
        
        let filterSpan = document.createElement('span');
        filterSpan.textContent = filterValue;
        filterChip.appendChild(filterSpan);
        
        let closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.onclick = function() { removeFilter(columnIndex); };
        filterChip.appendChild(closeButton);
        
        filterText.appendChild(filterChip);
    }
    filterIndicator.style.display = Object.keys(activeFilters).length ? 'block' : 'none';
}

function removeFilter(columnIndex) {
    delete activeFilters[columnIndex];
    applyFilters();
    updateFilterIndicator();
}

function clearFilter() {
    activeFilters = {};
    applyFilters();
    updateFilterIndicator();
}

function toggleSortDropdown() {
    var dropdown = document.getElementById('sortOptions');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function sortTable(n, type) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("infoTable");
    switching = true;
    dir = "asc";
    var optionText;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (type === 'text') {
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            } else if (type === 'date') {
                let dateX = new Date(x.innerHTML.split('/').reverse().join('/'));
                let dateY = new Date(y.innerHTML.split('/').reverse().join('/'));
                if (dir == "asc") {
                    if (dateX > dateY) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (dateX < dateY) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
    
    // Update the label after sorting
    var optionsTextArray = ["Match", "City", "Date", "Time", "Airport", "League", "Country"];  // Array to store the labels of the options
    document.getElementById('sortLabel').textContent = "Sort by: " + optionsTextArray[n];
    }
    

function filterByMonth(month) {
    var table = document.getElementById("infoTable");
    var rows = table.getElementsByTagName("tr");
    var monthIndex = getMonthIndex(month);

    document.getElementById("filterIndicator").style.display = "block";
    document.getElementById("filterText").textContent = "Date Filtered by: " + month;

    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName("td");
        if (cells.length > 0) {
            var dateCell = cells[2];
            if (dateCell) {
                var dateText = dateCell.innerText || dateCell.textContent;
                var dateParts = dateText.split(",")[1].trim().split(" "); // Split by comma, then split by space
                var monthShortName = dateParts[1]; // Get the short name of the month
                if (monthShortName === month.slice(0, 3)) { // Compare with the first 3 letters of the selected month
                    rows[i].style.display = "";
                } else {
                    rows[i].style.display = "none";
                }
            }
        }
    }
    populateFilterOptions();
}

function getMonthIndex(month) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months.indexOf(month) + 1;
}

function hideSortOptions() {
    var dropdown = document.getElementById('sortOptions');
    dropdown.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", function() {
    var navbarDiv = document.getElementById('navbar-div');
    fetch('navbar.html')
        .then(response => response.text())
        .then(text => navbarDiv.innerHTML = text);
});

function updateResultsPerPage() {
    var selectElement = document.getElementById('resultsPerPage');
    var resultsPerPage = parseInt(selectElement.value, 10);
    var table = document.getElementById('infoTable');
    var rows = table.querySelectorAll('tr');
    var currentVisibleRows = Array.from(rows).filter(row => row.style.display !== 'none').length;

    for (var i = currentVisibleRows; i < currentVisibleRows + resultsPerPage; i++) {
        if (rows[i]) {
            rows[i].style.display = '';
        } else {
            break;
        }
    }
}


// Initial call to set up the default view
document.addEventListener('DOMContentLoaded', updateResultsPerPage);

function loadDefaultResults() {
    var resultsPerPage = 50; // Set your default number of results per page here
    var table = document.getElementById('infoTable');
    var rows = table.querySelectorAll('tr');

    for (var i = 1; i < rows.length; i++) {
        if (i <= resultsPerPage) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

window.onload = loadDefaultResults;


fetchSheetData();
