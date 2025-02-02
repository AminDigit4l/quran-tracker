// Cleaned app.js for Quran Reading Tracker

let campaigns = JSON.parse(localStorage.getItem('campaigns')) || {};
let activeCampaign = localStorage.getItem('activeCampaign') || null;

document.addEventListener('DOMContentLoaded', () => {
    loadCampaigns();
    loadArchivedCampaigns();
    if (activeCampaign) {
        updateDashboard();
    }
});

document.getElementById('createCampaignBtn').addEventListener('click', function() {
    const campaignName = document.getElementById('newCampaignName').value.trim();
    const targetPages = parseInt(document.getElementById('newTargetPages').value);

    if (campaignName && !isNaN(targetPages) && targetPages > 0) {
        if (campaigns[campaignName]) {
            alert('Campaign name already exists. Please choose a different name.');
        } else {
            campaigns[campaignName] = { target: targetPages, entries: [] };
            localStorage.setItem('campaigns', JSON.stringify(campaigns));
            alert('New campaign created successfully!');

            document.getElementById('newCampaignName').value = '';
            document.getElementById('newTargetPages').value = '';
            $('#newCampaignModal').modal('hide');

            activeCampaign = campaignName;
            localStorage.setItem('activeCampaign', activeCampaign);
            loadCampaigns();
            updateDashboard();
        }
    } else {
        alert('Please enter a valid campaign name and target pages.');
    }
});

document.getElementById('campaignSelect').addEventListener('change', function() {
    activeCampaign = this.value;
    localStorage.setItem('activeCampaign', activeCampaign);
    updateDashboard();
});

document.getElementById('addEntry').addEventListener('click', function() {
    const pages = parseInt(document.getElementById('pagesRead').value);
    const campaignData = campaigns[activeCampaign];
    const totalPagesRead = campaignData.entries.reduce((sum, pages) => sum + pages, 0);
    const remainingPages = campaignData.target - totalPagesRead;

    if (!isNaN(pages) && pages > 0 && pages <= remainingPages) {
        campaigns[activeCampaign].entries.push(pages);
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        updateDashboard();
        document.getElementById('pagesRead').value = '';
    } else {
        alert(`Please enter a valid number of pages (1 to ${remainingPages}).`);
    }
});

function loadCampaigns() {
    const campaignSelect = document.getElementById('campaignSelect');
    campaignSelect.innerHTML = '';  
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
    updateChart(campaignData.entries);
}

function updateChart(entries) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: entries.length }, (_, i) => `Day ${i + 1}`),
            datasets: [{
                label: `${activeCampaign} - Pages Read`,
                data: entries,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                tension: 0.3,
                borderWidth: 3
            }]
        },
        options: { responsive: true }
    });
}

function loadArchivedCampaigns() {
    const archiveTableBody = document.getElementById('archiveTableBody');
    archiveTableBody.innerHTML = '';

    for (const [campaignName, campaignData] of Object.entries(campaigns)) {
        const totalPagesRead = campaignData.entries.reduce((sum, pages) => sum + pages, 0);
        const status = totalPagesRead >= campaignData.target ? 'Completed 🎉' : 'In Progress';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${campaignName}</td>
            <td>${campaignData.target}</td>
            <td>${totalPagesRead}</td>
            <td>${status}</td>
        `;
        archiveTableBody.appendChild(row);
    }
}
