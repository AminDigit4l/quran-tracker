function updateChart(entries) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Format dates for chart labels
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        return `${day} ${month}`;
    };

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedEntries.map(entry => formatDate(entry.date)),
            datasets: [{
                data: sortedEntries.map(entry => entry.pages),
                borderColor: '#e91e63',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointBackgroundColor: '#e91e63'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}