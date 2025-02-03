let campaigns = JSON.parse(localStorage.getItem('campaigns')) || {};
let activeCampaign = localStorage.getItem('activeCampaign') || null;

document.addEventListener('DOMContentLoaded', () => {
    loadCampaigns();
    loadArchivedCampaigns();
    if (activeCampaign) {
        updateDashboard();
        initializeProgressBar();
        renderDailyEntries();  // Ensure daily entries are shown on page load
    }
});

document.getElementById('createCampaignBtn').addEventListener('click', function () {
    const campaignName = document.getElementById('newCampaignName').value.trim();
    const targetPages = parseInt(document.getElementById('newTargetPages').value);

    if (campaignName && !isNaN(targetPages) && targetPages > 0) {
        if (campaigns[campaignName]) {
            alert('Campaign name already exists. Please choose a different name.');
        } else {
            campaigns[campaignName] = { target: targetPages, entries: [] };
            localStorage.setItem('campaigns', JSON.stringify(campaigns));
            alert('New campaign created successfully!');

            // Clear inputs and close modal
            document.getElementById('newCampaignName').value = '';
            document.getElementById('newTargetPages').value = '';
            $('#newCampaignModal').modal('hide');

            activeCampaign = campaignName;
            localStorage.setItem('activeCampaign', activeCampaign);
            loadCampaigns();
            updateDashboard();
            initializeProgressBar();
            renderDailyEntries();  // Clear/reset daily entries for new campaign
        }
    } else {
        alert('Please enter a valid campaign name and target pages.');
    }
});

document.getElementById('campaignSelect').addEventListener('change', function () {
    activeCampaign = this.value;
    localStorage.setItem('activeCampaign', activeCampaign);
    updateDashboard();
    initializeProgressBar();
    renderDailyEntries();  // Show daily entries for the selected campaign
});

document.getElementById('addEntry').addEventListener('click', function () {
    const pages = parseInt(document.getElementById('pagesRead').value);
    const campaignData = campaigns[activeCampaign];
    const totalPagesRead = campaignData.entries.reduce((sum, pages) => sum + pages, 0);
    const remainingPages = campaignData.target - totalPagesRead;

    if (!isNaN(pages) && pages > 0 && pages <= remainingPages) {
        // Optional: Track the date with each entry
        const today = new Date().toLocaleDateString();
        campaignData.entries.push({ pages: pages, date: today });
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        updateDashboard();
        renderDailyEntries();  // Update table with the new entry
        loadArchivedCampaigns();
        document.getElementById('pagesRead').value = '';  // Clear input field
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
    const totalPagesRead = campaignData.entries.reduce((sum, entry) => sum + entry.pages, 0);
    updateProgressBar(totalPagesRead, campaignData.target);
    updateChart(campaignData.entries);
}

function renderDailyEntries() {
    const dailyEntriesTableBody = document.querySelector('#dailyEntriesTable tbody');
    dailyEntriesTableBody.innerHTML = '';  // Clear the table before re-rendering

    const campaignData = campaigns[activeCampaign];
    if (!campaignData) return;

    campaignData.entries.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.pages}</td>
            <td>
                <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
            </td>
        `;
        dailyEntriesTableBody.appendChild(row);
    });
}

function editEntry(index) {
    const campaignData = campaigns[activeCampaign];
    const entryToEdit = campaignData.entries[index];

    document.getElementById('pagesRead').value = entryToEdit.pages;  // Prefill input with pages read

    // Remove the entry temporarily and refresh the table
    campaignData.entries.splice(index, 1);
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    renderDailyEntries();
}

function deleteEntry(index) {
    const campaignData = campaigns[activeCampaign];
    campaignData.entries.splice(index, 1);  // Remove the selected entry
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    renderDailyEntries();  // Refresh the table
    updateDashboard();  // Update progress bar and chart
    loadArchivedCampaigns();  // Refresh archive table
}

function initializeProgressBar() {
    if (activeCampaign) {
        const campaignData = campaigns[activeCampaign];
        const totalPagesRead = campaignData.entries.reduce((sum, entry) => sum + entry.pages, 0);
        updateProgressBar(totalPagesRead, campaignData.target);
    }
}

function updateProgressBar(currentPages, targetPages) {
    if (targetPages <= 0) {
        console.error("Invalid target pages");
        return;
    }
    const progressPercentage = Math.min((currentPages / targetPages) * 100, 100);
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.innerText = `${Math.floor(progressPercentage)}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
}

function updateChart(entries) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    const chartData = entries.map(entry => entry.pages);
    const labels = entries.map((entry, index) => `Day ${index + 1}`);

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${activeCampaign} - Pages Read`,
                data: chartData,
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
        const totalPagesRead = campaignData.entries.reduce((sum, entry) => sum + entry.pages, 0);
        const pagesLeft = campaignData.target - totalPagesRead;
        const displayPagesLeft = pagesLeft <= 0 ? 'Completed 🎉' : `${pagesLeft}`;

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
