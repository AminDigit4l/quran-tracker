// Keep these at top level
let campaigns = JSON.parse(localStorage.getItem('campaigns')) || {};
let activeCampaign = localStorage.getItem('activeCampaign') || null;

document.addEventListener('DOMContentLoaded', () => {
    updateCurrentDate();
    checkUserStatus();
    initializeNavigation();
    initializeEventListeners();
    
    if (activeCampaign) {
        updateDashboard();
    }
});

function initializeEventListeners() {
    initializeCampaignListeners(campaigns, activeCampaign, updateDashboard);
    // Remove initializeEntryListeners call since we're handling it in the entry form view
}

function updateCurrentDate() {
    const date = new Date();
    const options = { day: '2-digit', weekday: 'long', year: 'numeric' };
    document.getElementById('currentDate').textContent = date.toLocaleDateString('en-US', options);
}

function checkUserStatus() {
    const hasExistingCampaigns = Object.keys(campaigns).length > 0;
    document.getElementById('newUserView').style.display = hasExistingCampaigns ? 'none' : 'block';
    document.getElementById('existingUserView').style.display = hasExistingCampaigns ? 'block' : 'none';
    
    if (hasExistingCampaigns) {
        loadCampaigns();
    }
}

function loadCampaigns() {
    const campaignSelect = document.getElementById('campaignSelect');
    campaignSelect.innerHTML = '';
    
    const createOption = document.createElement('option');
    createOption.value = "create_new";
    createOption.textContent = "Create New Campaign";
    campaignSelect.appendChild(createOption);
    
    for (const campaign in campaigns) {
        const option = document.createElement('option');
        option.value = campaign;
        option.textContent = campaign;
        if (campaign === activeCampaign) option.selected = true;
        campaignSelect.appendChild(option);
    }
}

function updateDashboard() {
    const campaignData = campaigns[activeCampaign];
    if (!campaignData) return;

    const totalPagesRead = campaignData.entries.reduce((sum, entry) => sum + entry.pages, 0);
    const pagesLeft = campaignData.target - totalPagesRead;
    
    const averagePages = campaignData.entries.length > 0 
        ? Math.round(totalPagesRead / campaignData.entries.length) 
        : 0;

    document.getElementById('totalPages').textContent = campaignData.target;
    document.getElementById('averagePages').textContent = averagePages;
    document.getElementById('pagesLeft').textContent = pagesLeft;

    updateProgressBar(totalPagesRead, campaignData.target);
    updateChart(campaignData.entries);
}

function updateProgressBar(currentPages, targetPages) {
    if (!targetPages || targetPages <= 0) return;
    
    const progressPercentage = Math.min((currentPages / targetPages) * 100, 100);
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.innerText = `${Math.round(progressPercentage)}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);
    }
}

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

// Event Listeners
document.getElementById('campaignSelect').addEventListener('change', function() {
    if (this.value === 'create_new') {
        $('#newCampaignModal').modal('show');
        this.value = activeCampaign || '';
    } else {
        activeCampaign = this.value;
        localStorage.setItem('activeCampaign', activeCampaign);
        updateDashboard();
    }
});

document.getElementById('createCampaignBtn').addEventListener('click', function() {
    const campaignName = document.getElementById('newCampaignName').value.trim();
    const targetPages = parseInt(document.getElementById('newTargetPages').value);

    if (campaignName && !isNaN(targetPages) && targetPages > 0) {
        if (campaigns[campaignName]) {
            alert('Campaign name already exists. Please choose a different name.');
            return;
        }

        campaigns[campaignName] = { target: targetPages, entries: [] };
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        
        document.getElementById('newCampaignName').value = '';
        document.getElementById('newTargetPages').value = '';
        $('#newCampaignModal').modal('hide');

        activeCampaign = campaignName;
        localStorage.setItem('activeCampaign', activeCampaign);
        loadCampaigns();
        updateDashboard();
    } else {
        alert('Please enter a valid campaign name and target pages.');
    }
});

// Remove the old addEntry event listener