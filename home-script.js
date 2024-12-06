// Define the Spreadsheet ID and API Key
const apiKey = 'AIzaSyCOcgml16vEy6ySElOyZCldnDZt_iDXjYk';  // Replace with your API key
const spreadsheetId = '1aoO-goC4d3XQtNHe5SZBPVCxKoQnsHaE-KktTtMkM9k';  // Replace with your Spreadsheet ID

// Function to fetch high-risk customer data for Home Page
function fetchHighRiskCustomerDataHome() {
    const customerRange = 'Main Table!A2:F';  // Range for the Main Table
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${customerRange}?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => handleHighRiskCustomerDataHome(data))
        .catch(error => console.error("Error fetching high-risk customer data for Home Page:", error));
}

// Handle the fetched high-risk customer data for Home Page
function handleHighRiskCustomerDataHome(data) {
    const rows = data.values;

    // Filter customers with 'HIGH' risk category
    const highRiskData = rows.filter(row => row[3] === 'HIGH').map(row => {
        return {
            name: row[0],
            segment: row[1],
            riskScore: row[2],
            riskCategory: row[3],
            churnProbability: parseFloat(row[4]) / 100, // Adjust churn probability to be a decimal (divide by 100)
            recommendedActions: row[5]
        };
    });

    // Store high-risk customer data globally for table generation
    window.highRiskCustomerData = highRiskData;

    // Generate the high-risk customer risk breakdown table
    if (document.getElementById("customerTable")) {
        generateTableHome(highRiskData);  // Generate table for high-risk customers
    }

    // Update High Risk Customers count (only for Home Page)
    if (document.querySelector('#highRiskCount')) {
        const highRiskCount = highRiskData.length;
        document.querySelector('#highRiskCount').innerHTML = `High Risk Customers Detected: ${highRiskCount}`;
    }
}

// Function to generate the high-risk customer risk breakdown table for Home Page
function generateTableHome(data) {
    const tbody = document.getElementById("customerTable").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    data.forEach(customer => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.segment}</td>
            <td>${customer.riskScore}%</td>
            <td>${customer.riskCategory}</td>
            <td>${(customer.churnProbability * 100).toFixed(2)}%</td> <!-- Correct churn probability format -->
            <td>${customer.recommendedActions}</td>
        `;
    });
}

// Initialize the High Risk Customer Data Fetching
document.addEventListener('DOMContentLoaded', () => {
    fetchHighRiskCustomerDataHome();  // Fetch and populate the high-risk customer data and table
});

// Function to toggle the side panel (hamburger menu)
function toggleSidePanel() {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.classList.toggle('active');
}

// Fetch and populate other data if needed (e.g., charts, additional tables)
function fetchAdditionalData() {
    // Your additional data fetching logic goes here
}

// Example: Fetching and displaying a pie chart for risk categories
function renderRiskCategoryChart() {
    const ctx = document.getElementById('risk-pie-chart').getContext('2d');
    const data = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
            data: [30, 50, 20],  // Example data
            backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
            borderColor: '#fff',
            borderWidth: 2
        }]
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                    }
                }
            }
        }
    };
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options
    });
}

// Example: Fetching and displaying retention trends chart
function renderRetentionTrendsChart() {
    const ctx = document.getElementById('retention-line-chart').getContext('2d');
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Retention Rate',
            data: [85, 80, 75, 70, 65],  // Example data
            borderColor: '#2980b9',
            backgroundColor: 'rgba(41, 128, 185, 0.2)',
            borderWidth: 2,
            fill: true
        }]
    };
    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

// Call the rendering functions when needed
renderRiskCategoryChart();
renderRetentionTrendsChart();
