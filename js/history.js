function createHistoryView() {
    const view = document.createElement('div');
    view.className = 'history-view';
    view.innerHTML = `
        <div class="card history-header-card">
            <h4>Reading History</h4>
            <div class="campaign-filter">
                <select id="historyCampaignSelect" class="form-control">
                    <option value="all">All Campaigns</option>
                </select>
            </div>
        </div>
        <div class="history-entries"></div>
    `;
    document.body.appendChild(view);
    initializeHistory();
    return view;
}

function initializeHistory() {
    setupHistorySelect();
    displayHistoryEntries();
}

function setupHistorySelect() {
    const select = document.getElementById('historyCampaignSelect');
    select.innerHTML = '<option value="all">All Campaigns</option>';
    
    Object.keys(campaigns).forEach(campaignName => {
        const option = document.createElement('option');
        option.value = campaignName;
        option.textContent = campaignName;
        select.appendChild(option);
        
        // Set the active campaign as selected
        if (campaignName === activeCampaign) {
            option.selected = true;
        }
    });

    // Remove old listener if exists
    select.removeEventListener('change', displayHistoryEntries);
    select.addEventListener('change', displayHistoryEntries);
}

function displayHistoryEntries() {
    const historyContainer = document.querySelector('.history-entries');
    const selectedCampaign = document.getElementById('historyCampaignSelect').value;
    historyContainer.innerHTML = '';

    if (selectedCampaign === 'all') {
        Object.entries(campaigns).forEach(([name, data]) => {
            displayCampaignEntries(name, data, historyContainer);
        });
    } else {
        displayCampaignEntries(selectedCampaign, campaigns[selectedCampaign], historyContainer);
    }
}

function displayCampaignEntries(campaignName, campaignData, container) {
    const campaignSection = document.createElement('div');
    campaignSection.className = 'card campaign-history-card';
    campaignSection.innerHTML = `
        <div class="campaign-header">
            <h5>${campaignName}</h5>
            <div class="campaign-stats">
                <span>Target: ${campaignData.target} pages</span>
                <span>Progress: ${calculateProgress(campaignData)}%</span>
            </div>
        </div>
        <div class="entries-list">
            ${createEntriesList(campaignData.entries, campaignName)}
        </div>
    `;
    container.appendChild(campaignSection);
    attachEntryListeners(campaignSection, campaignName);
}

function createEntriesList(entries, campaignName) {
    if (!entries || entries.length === 0) {
        return '<p class="no-entries">No entries yet</p>';
    }

    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedEntries.map((entry, index) => `
        <div class="entry-item" data-entry-index="${index}" data-campaign="${campaignName}">
            <div class="entry-info">
                <span class="entry-date">${formatDate(entry.date)}</span>
                <span class="entry-pages">${entry.pages} pages</span>
            </div>
            <div class="entry-actions">
                <button class="btn btn-sm btn-outline-primary edit-entry" type="button">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-entry" type="button">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function attachEntryListeners(container, campaignName) {
    // Delete listeners
    container.querySelectorAll('.delete-entry').forEach(button => {
        button.onclick = (e) => {
            e.stopPropagation();
            const entryItem = button.closest('.entry-item');
            const index = parseInt(entryItem.dataset.entryIndex);
            
            if (confirm('Are you sure you want to delete this entry?')) {
                campaigns[campaignName].entries.splice(index, 1);
                localStorage.setItem('campaigns', JSON.stringify(campaigns));
                updateDashboard();
                displayHistoryEntries();
            }
        };
    });

    // Edit listeners
    container.querySelectorAll('.edit-entry').forEach(button => {
        button.onclick = (e) => {
            e.stopPropagation();
            const entryItem = button.closest('.entry-item');
            const index = parseInt(entryItem.dataset.entryIndex);
            const entry = campaigns[campaignName].entries[index];

            function editEntry(campaignName, entryIndex) {
                const entry = campaigns[campaignName].entries[entryIndex];
                
                document.getElementById('editEntryDate').value = entry.date;
                document.getElementById('editPagesRead').value = entry.pages;
                document.getElementById('editEntryIndex').value = entryIndex;
                document.getElementById('editCampaignName').value = campaignName;
                
                $('#editEntryModal').modal('show');
            }
            
            function saveEditEntry() {
                const entryIndex = document.getElementById('editEntryIndex').value;
                const campaignName = document.getElementById('editCampaignName').value;
                const newDate = document.getElementById('editEntryDate').value;
                const newPages = parseInt(document.getElementById('editPagesRead').value);

                if (!newPages || newPages <= 0) {
                    alert('Please enter a valid number of pages');
                    return;
                }

                campaigns[campaignName].entries[index] = {
                    date: newDate,
                    pages: newPages
                };

                localStorage.setItem('campaigns', JSON.stringify(campaigns));
                $('#editEntryModal').modal('hide');
                
                updateDashboard();
                displayHistoryEntries();
            };
        };
    });
}

// Handle edit form submission
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('saveEditEntry').onclick = () => {
        const index = parseInt(document.getElementById('editEntryIndex').value);
        const campaignName = document.getElementById('editCampaignName').value;
        const newDate = document.getElementById('editEntryDate').value;
        const newPages = parseInt(document.getElementById('editPagesRead').value);

        if (!newPages || newPages <= 0) {
            alert('Please enter a valid number of pages');
            return;
        }

        campaigns[campaignName].entries[index] = {
            date: newDate,
            pages: newPages
        };

        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        $('#editEntryModal').modal('hide');
        
        updateDashboard();
        displayHistoryEntries();
    };
});

function calculateProgress(campaignData) {
    const totalRead = campaignData.entries.reduce((sum, entry) => sum + entry.pages, 0);
    return Math.round((totalRead / campaignData.target) * 100);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Add cleanup function for history view
function cleanupHistoryView() {
    const historySelect = document.getElementById('historyCampaignSelect');
    if (historySelect) {
        historySelect.innerHTML = '';
    }
}

// Export cleanup function
window.cleanupHistoryView = cleanupHistoryView;
window.createHistoryView = createHistoryView;