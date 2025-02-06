function initializeNavigation() {
    // Create bottom navigation bar
    const navBar = document.createElement('nav');
    navBar.className = 'bottom-nav';
    navBar.innerHTML = `
        <div class="nav-item active" data-view="home">
            <i class="fas fa-home"></i>
        </div>
        <div class="nav-item" data-view="add-entry">
            <i class="fas fa-plus-circle"></i>
        </div>
        <div class="nav-item" data-view="history">
            <i class="fas fa-history"></i>
        </div>
    `;
    document.body.appendChild(navBar);

    // Add event listeners to nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.view === 'add-entry') {
                $('#addEntryModal').modal('show');
                initializeEntryForm();
                return;
            }
            
            // Only update active state for non-entry buttons
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            switchView(item.dataset.view);
        });
    });
}

function switchView(view) {
    const appContainer = document.querySelector('.app-container');
    const historyView = document.querySelector('.history-view');

    // Hide all views first
    [appContainer, historyView].forEach(el => {
        if (el) el.style.display = 'none';
    });

    // Show selected view
    switch(view) {
        case 'home':
            if (appContainer) appContainer.style.display = 'block';
            break;
        case 'history':
            showHistory();
            break;
    }
}

function showHistory() {
    let historyView = document.querySelector('.history-view');
    if (!historyView) {
        historyView = createHistoryView();
    }
    historyView.style.display = 'block';
}

function createHistoryView() {
    const view = document.createElement('div');
    view.className = 'history-view';
    view.innerHTML = `
        <h4>Reading History</h4>
        <div class="history-list"></div>
    `;
    document.body.appendChild(view);
    return view;
}

window.initializeNavigation = initializeNavigation;