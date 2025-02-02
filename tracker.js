let campaigns = JSON.parse(localStorage.getItem('campaigns')) || {};
let activeCampaign = localStorage.getItem('activeCampaign') || null;

document.addEventListener('DOMContentLoaded', () => {
    loadCampaigns();
    loadArchivedCampaigns();
    if (activeCampaign) {
        updateDashboard();
        loadArchivedCampaigns();
        initializeProgressBar();  // Initialize progress bar on page load
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
            loadArchivedCampaigns();
            initializeProgressBar();  // Set initial progress to 0%
        }
    } else {
        alert('Please enter a valid campaign name and target pages.');
    }
});

document.getElementById('campaignSelect').addEventListener('change', function() {
    activeCampaign = this.value;
    localStorage.setItem('activeCampaign', activeCampaign);
    updateDashboard();
    loadArchivedCampaigns();
    initializeProgressBar();  // Reinitialize progress bar for the selected campaign
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
        updateProgressBar(campaignData.entries.reduce((sum, pages) => sum + pages, 0), campaignData.target);  // Update progress bar
        loadArchivedCampaigns(); // Added this line to refresh the archive table
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
    updateProgressBar(campaignData.entries.reduce((sum, pages) => sum + pages, 0), campaignData.target);  // Ensure progress bar syncs with chart
}

function initializeProgressBar() {
    if (activeCampaign) {
        const campaignData = campaigns[activeCampaign];
        const totalPagesRead = campaignData.entries.reduce((sum, pages) => sum + pages, 0);
        updateProgressBar(totalPagesRead, campaignData.target);
    }
}

function updateProgressBar(currentPages, targetPages) {
    if (targetPages <= 0) {
        console.error("Invalid target pages");
        return;
    }

    // Calculate progress and cap it at 100%
    const progressPercentage = Math.min((currentPages / targetPages) * 100, 100);
    
    // Update progress bar width and text
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.innerText = `${Math.floor(progressPercentage)}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
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
        const pagesLeft = campaignData.target - totalPagesRead;
        const displayPagesLeft = pagesLeft <= 0 ? 'Completed 🎉' : `${pagesLeft} pages left`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${campaignName}</td>
            <td>${campaignData.target}</td>
            <td>${totalPagesRead}</td>
            <td class="${pagesLeft <= 0 ? 'completed' : ''}">${displayPagesLeft}</td>
        `;
        archiveTableBody.appendChild(row);
    }
}
