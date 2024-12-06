// Google Sheets API key and Spreadsheet details
const apiKey = 'AIzaSyCOcgml16vEy6ySElOyZCldnDZt_iDXjYk';  // Replace with your API key
const spreadsheetId = '1aoO-goC4d3XQtNHe5SZBPVCxKoQnsHaE-KktTtMkM9k';  // Replace with your Spreadsheet ID

// Initialize Pie Chart (default empty data)
const ctxPie = document.getElementById("risk-pie-chart")?.getContext("2d");
let pieChart;
if (ctxPie) {
    pieChart = new Chart(ctxPie, {
        type: "pie",
        data: {
            labels: ["High", "Medium", "Low"],  // Labels for the categories (e.g., HIGH, MEDIUM, LOW)
            datasets: [{
                label: "Risk Overview",
                data: [],  // Data for the count of each category
                backgroundColor: ["#e74c3c", "#f39c12", "#2ecc71"],  // Red for HIGH, Yellow for MEDIUM, Green for LOW
            }]
        }
    });
}

// Initialize Line Chart (default empty data)
const ctxLine = document.getElementById("retention-line-chart")?.getContext("2d");
let lineChart;
if (ctxLine) {
    lineChart = new Chart(ctxLine, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Retention Rate",
                data: [],
                fill: false,
                borderColor: "#3498db",
                tension: 0.1
            }, {
                label: "New Customers",
                data: [],
                fill: false,
                borderColor: "#f39c12",
                tension: 0.1
            }]
        }
    });
}

// Fetch High Risk Customer Count and Data for Home Page
function fetchCustomerDataDashboard() {
    const customerRange = 'Main Table!A2:F';  // Range for the Main Table
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${customerRange}?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => handleCustomerDataDashboard(data))
        .catch(error => console.error("Error fetching customer data for Dashboard:", error));
}

// Handle Customer Data for Dashboard
function handleCustomerDataDashboard(data) {
    const rows = data.values;

    // Prepare an array to store customer data
    const customerData = rows.map(row => {
        return {
            name: row[0],
            segment: row[1],
            riskScore: row[2],
            riskCategory: row[3],
            churnProbability: parseFloat(row[4]),
            recommendedActions: row[5]
        };
    });

    // Store customer data globally for table generation
    window.customerData = customerData;

    // Generate the customer risk breakdown table for Dashboard
    if (document.getElementById("customerTable")) {
        generateTableDashboard(customerData);  // Dashboard: Generate the table with customer data
    }

    // Update High Risk Customers count (only for Dashboard)
    if (document.querySelector('.high-risk-customers h3')) {
        const highRiskCount = customerData.filter(customer => customer.riskCategory === 'HIGH').length;
        document.querySelector('.high-risk-customers h3').innerHTML = `High Risk Customers Detected: ${highRiskCount}`;
    }
}


// Function to generate the customer risk breakdown table dynamically for Dashboard
function generateTableDashboard(data) {
    const tbody = document.getElementById("customerTable").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    data.forEach(customer => {
        // Fix for churn probability formatting
        const churnProbability = (customer.churnProbability >= 1) ? (customer.churnProbability / 100) : customer.churnProbability; // If the churn probability is > 1, divide it by 100 to make it a decimal.

        const row = tbody.insertRow();
        row.innerHTML = `
            <td onclick="openPopup(${JSON.stringify(customer)})">${customer.name}</td>
            <td onclick="openPopup(${JSON.stringify(customer)})">${customer.segment}</td>
            <td onclick="openPopup(${JSON.stringify(customer)})">${customer.riskScore}%</td>
            <td onclick="openPopup(${JSON.stringify(customer)})">${customer.riskCategory}</td>
            <td onclick="openPopup(${JSON.stringify(customer)})">${(churnProbability * 100).toFixed(2)}%</td> <!-- Churn probability adjusted -->
            <td onclick="openPopup(${JSON.stringify(customer)})">${customer.recommendedActions}</td>
        `;
    });
}

// Fetch and Update Pie Chart (Risk Overview) on Insights Page
function updatePieChart() {
    const countRange = 'Count!A2:B';  // Range for the Count Sheet (High, Medium, Low risk distribution)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${countRange}?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const riskCounts = data.values;
            const highRiskCount = parseInt(riskCounts.find(row => row[0] === 'HIGH')?.[1]) || 0;
            const mediumRiskCount = parseInt(riskCounts.find(row => row[0] === 'MEDIUM')?.[1]) || 0;
            const lowRiskCount = parseInt(riskCounts.find(row => row[0] === 'LOW')?.[1]) || 0;

            if (pieChart) {
                pieChart.data.datasets[0].data = [highRiskCount, mediumRiskCount, lowRiskCount];
                pieChart.update();
            }
        })
        .catch(error => console.error("Error fetching pie chart data:", error));
}

// Fetch Retention Graph Data from Retention Sheet (Insights Page)
function updateRetentionGraphInsights() {
    const retentionRange = 'Retention!A2:C';  // Adjust the range for your "Retention" sheet
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${retentionRange}?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const retentionData = data.values;
            const labels = retentionData.map(row => row[0]);  // Month/Year or Time period
            const newCustomers = retentionData.map(row => parseInt(row[1]));  // Number of new customers
            const retentionRates = retentionData.map(row => parseFloat(row[2]));  // Retention rate

            if (lineChart) {
                lineChart.data.labels = labels;
                lineChart.data.datasets[0].data = retentionRates;
                lineChart.data.datasets[1].data = newCustomers;
                lineChart.update();
            }
        })
        .catch(error => console.error("Error fetching retention graph data:", error));
}

// Initialize the Dashboard Data Fetching
document.addEventListener('DOMContentLoaded', () => {
    fetchCustomerDataDashboard();  // Fetch the customer data and populate table & high-risk count
    updatePieChart();  // Update the Pie Chart
    updateRetentionGraphInsights();  // Update the Retention Graph
});

// Example: Add filtering functionality for the table if required
function filterTableByRiskCategory() {
    const riskCategory = document.getElementById('riskCategory').value;
    const filteredData = riskCategory === 'all' ? window.customerData : window.customerData.filter(customer => customer.riskCategory.toLowerCase() === riskCategory.toLowerCase());
    generateTableDashboard(filteredData);
}

function filterTableBySegment() {
    const segment = document.getElementById('segment').value;
    const filteredData = segment === 'all' ? window.customerData : window.customerData.filter(customer => customer.segment.toLowerCase() === segment.toLowerCase());
    generateTableDashboard(filteredData);
}

// Toggle Side Panel visibility
function toggleSidePanel() {
    const sidePanel = document.getElementById("sidePanel");
    sidePanel.classList.toggle("active");  // Toggle the 'active' class on the side panel
}

// Filter customer data based on pie chart selection (high, medium, low risk)
function filterTableByPieChart(selectedCategory) {
    const filteredData = selectedCategory === 'all' ? window.customerData : window.customerData.filter(customer => customer.riskCategory.toLowerCase() === selectedCategory.toLowerCase());
    generateTableDashboard(filteredData);
}

// Add event listener to pie chart sections for filtering
if (pieChart) {
    pieChart.options.onClick = function(evt, elements) {
        if (elements.length) {
            const clickedElement = elements[0];
            const selectedCategory = pieChart.data.labels[clickedElement.index].toLowerCase();
            filterTableByPieChart(selectedCategory);
        }
    };
}
