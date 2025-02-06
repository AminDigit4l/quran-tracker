function loadCampaigns(campaigns, activeCampaign) {
    const campaignSelect = document.getElementById('campaignSelect');
    campaignSelect.innerHTML = '';
    
    // Add existing campaigns first
    for (const campaign in campaigns) {
        const option = document.createElement('option');
        option.value = campaign;
        option.textContent = campaign;
        if (campaign === activeCampaign) option.selected = true;
        campaignSelect.appendChild(option);
    }
    
    // Add "Create New" option at the end
    const createOption = document.createElement('option');
    createOption.value = "create_new";
    createOption.textContent = "Create New Campaign";
    campaignSelect.appendChild(createOption);
}

function initializeCampaignListeners(campaigns, activeCampaign, updateDashboard) {
    // Campaign select listener
    // Remove this duplicate listener at the bottom of the file
    // Modify existing campaign select listener to show/hide delete button
    // Campaign select listener
    document.getElementById('campaignSelect').addEventListener('change', function() {
        if (this.value === 'create_new') {
            const modal = $('#newCampaignModal');
            modal.modal('show');
            // Reset form when modal opens
            document.getElementById('newCampaignName').value = '';
            document.getElementById('newTargetPages').value = '';
            this.value = activeCampaign || '';
            
            // Handle modal hidden event
            modal.on('hidden.bs.modal', function() {
                // Remove focus from the create button
                document.getElementById('createCampaignBtn').blur();
                // Reset form when modal closes
                document.getElementById('newCampaignName').value = '';
                document.getElementById('newTargetPages').value = '';
            });
        } else {
            activeCampaign = this.value;
            localStorage.setItem('activeCampaign', activeCampaign);
            updateDashboard();
            updateDeleteButton();
        }
    });

    // Create campaign button listener
    document.getElementById('createCampaignBtn').addEventListener('click', function() {
        const nameInput = document.getElementById('newCampaignName');
        const pagesInput = document.getElementById('newTargetPages');
        const campaignName = nameInput.value.trim();
        const targetPages = parseInt(pagesInput.value);

        // Only validate if inputs are empty
        if (!campaignName) {
            alert('Please enter a campaign name.');
            nameInput.focus();  // Return focus to the input
            return;
        }

        if (!targetPages || isNaN(targetPages) || targetPages <= 0) {
            alert('Please enter a valid number of pages.');
            return;
        }

        if (campaigns[campaignName]) {
            alert('Campaign name already exists. Please choose a different name.');
            return;
        }

        // Create campaign
        campaigns[campaignName] = { target: targetPages, entries: [] };
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        
        // Clear form and close modal
        document.getElementById('newCampaignName').value = '';
        document.getElementById('newTargetPages').value = '';
        $('#newCampaignModal').modal('hide');

        // Update campaign selection
        activeCampaign = campaignName;
        localStorage.setItem('activeCampaign', activeCampaign);
        loadCampaigns(campaigns, activeCampaign);
        updateDashboard();
        updateDeleteButton();
    });

    // Delete campaign listener
    document.getElementById('deleteCampaignBtn').addEventListener('click', function() {
        if (!activeCampaign) return;
        
        if (confirm(`Are you sure you want to delete "${activeCampaign}" campaign? This action cannot be undone.`)) {
            const campaignNames = Object.keys(campaigns);
            const currentIndex = campaignNames.indexOf(activeCampaign);
            
            // Store the next campaign before deletion
            let nextCampaign = null;
            if (campaignNames.length > 1) {
                const nextIndex = currentIndex < campaignNames.length - 1 ? currentIndex : currentIndex - 1;
                nextCampaign = campaignNames[nextIndex];
            }
            
            // Delete current campaign
            delete campaigns[activeCampaign];
            localStorage.setItem('campaigns', JSON.stringify(campaigns));
            
            // Set next active campaign
            activeCampaign = nextCampaign;
            localStorage.setItem('activeCampaign', activeCampaign || '');
            
            // Update UI
            loadCampaigns(campaigns, activeCampaign);
            updateDashboard();
            updateDeleteButton();
            
            // Update history if visible
            const historyView = document.querySelector('.history-view');
            if (historyView && historyView.style.display !== 'none') {
                setupHistorySelect();
                displayHistoryEntries();
            }
        }
    });
}

function updateDeleteButton() {
    const deleteBtn = document.getElementById('deleteCampaignBtn');
    if (deleteBtn) {
        deleteBtn.style.display = activeCampaign ? 'block' : 'none';
    }
}

window.initializeCampaignListeners = initializeCampaignListeners;
window.loadCampaigns = loadCampaigns;