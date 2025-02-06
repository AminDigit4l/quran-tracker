function initializeEntryForm() {
    setDefaultDate();
    updateCurrentCampaignName();
    setupEntryButton();
}

function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    const dateInput = document.getElementById('entryDate');
    dateInput.value = formattedDate;
    dateInput.max = formattedDate;
}

function setupEntryButton() {
    const addEntryButton = document.getElementById('addEntry');
    if (addEntryButton) {
        // Remove redundant cloning since we're using a single event listener
        addEntryButton.addEventListener('click', handleEntrySubmission);
    }
}

function updateCurrentCampaignName() {
    const campaignNameElement = document.querySelector('.current-campaign-name');
    if (activeCampaign) {
        campaignNameElement.textContent = `Campaign: ${activeCampaign}`;
    } else {
        campaignNameElement.textContent = 'No active campaign selected';
    }
}

function handleEntrySubmission() {
    const date = document.getElementById('entryDate').value;
    const pages = parseInt(document.getElementById('pagesRead').value);

    if (!date || !pages || pages <= 0) {
        alert('Please enter valid date and pages');
        return;
    }

    if (!activeCampaign) {
        alert('Please select a campaign first');
        return;
    }

    // Add entry to campaign
    campaigns[activeCampaign].entries.push({
        date: date,
        pages: pages
    });

    // Save to localStorage
    localStorage.setItem('campaigns', JSON.stringify(campaigns));

    // Clear form
    document.getElementById('entryDate').value = '';
    document.getElementById('pagesRead').value = '';

    // Close modal
    $('#addEntryModal').modal('hide');

    // Update dashboard
    updateDashboard();

    // Update history view if it exists
    const historyView = document.querySelector('.history-view');
    if (historyView) {
        const historySelect = document.getElementById('historyCampaignSelect');
        if (historySelect) {
            setupHistorySelect();
            displayHistoryEntries();
        }
    }
}

window.initializeEntryForm = initializeEntryForm;