document.addEventListener('DOMContentLoaded', function() {
    // API configuration
    const API_ENDPOINT = 'https://uzbftxvzhd.execute-api.us-east-1.amazonaws.com/prod/status'; // Replace with your actual API Gateway URL
    const API_KEY = 'viDT2oTVNN6yIjOlbMOSMaxInRTAzpviai4qtXoy'; // Replace with your actual API key
    
    // DOM elements
    const statusIndicator = document.getElementById('status-indicator');
    const statusHeading = document.getElementById('status-heading');
    const statusMessage = document.getElementById('status-message');
    const statusDetails = document.getElementById('status-details');
    const lastUpdated = document.getElementById('last-updated');
    const pageUpdatedTime = document.getElementById('page-updated-time');
    const refreshButton = document.getElementById('refresh-button');
    
    // Fetch court status on page load
    fetchCourtStatus();
    
    // Add refresh button functionality
    refreshButton.addEventListener('click', function() {
        // Visual feedback for refresh
        statusIndicator.className = 'status-indicator';
        statusIndicator.innerHTML = '<div class="spinner"></div>';
        statusHeading.textContent = 'Updating status...';
        statusMessage.textContent = 'Please wait while we check for the latest information.';
        statusDetails.textContent = '';
        lastUpdated.textContent = '';
        
        // Fetch updated data
        fetchCourtStatus();
    });
    
    // Function to fetch court status from API
    function fetchCourtStatus() {
        fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateUI(data);
            updateLastCheckedTime();
        })
        .catch(error => {
            console.error('Error fetching court status:', error);
            showErrorState();
            updateLastCheckedTime();
        });
    }
    
    // Function to update UI with status data
    function updateUI(data) {
        // Clear spinner
        statusIndicator.innerHTML = '';
        
        // Update status indicator and icon
        if (data.status === 'open') {
            statusIndicator.className = 'status-indicator open';
            statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
            statusHeading.textContent = 'COURTS ARE OPEN';
        } else if (data.status === 'closed') {
            statusIndicator.className = 'status-indicator closed';
            statusIndicator.innerHTML = '<i class="fas fa-times-circle"></i>';
            statusHeading.textContent = 'COURTS ARE CLOSED';
        } else {
            statusIndicator.className = 'status-indicator unknown';
            statusIndicator.innerHTML = '<i class="fas fa-question-circle"></i>';
            statusHeading.textContent = 'STATUS UNKNOWN';
        }
        
        // Update status message and details
        statusMessage.textContent = data.message || '';
        statusDetails.textContent = data.details || '';
        
    // Update last updated timestamp if available
        if (data.last_updated) {
            const timestamp = data.last_updated;
            const recordingTime = data.recording_time || '';
            const recordingDate = data.recording_date || '';
            
            // Format the date from YYYY-MM-DD to a more readable format
            let formattedDate = '';
            if (recordingDate) {
                const dateParts = recordingDate.split('-');
                if (dateParts.length === 3) {
                    const year = dateParts[0];
                    const month = new Date(recordingDate).toLocaleString('en-US', { month: 'short' });
                    const day = parseInt(dateParts[2], 10);
                    formattedDate = `${month} ${day}, ${year}`;
                }
            }
            
            // Format the complete last updated string
            if (recordingTime && formattedDate) {
                lastUpdated.textContent = `Last status update: ${formattedDate} at ${recordingTime} AM ET`;
            } else if (recordingTime) {
                // Fallback to just time if no date
                lastUpdated.textContent = `Last status update: ${recordingTime} AM ET`;
            } else {
                // Fallback to timestamp if neither recording_time nor recording_date is available
                const date = new Date(timestamp * 1000);
                lastUpdated.textContent = `Last status update: ${formatDate(date)}`;
            }
        } else {
            lastUpdated.textContent = '';
        }
    }
    
    // Function to show error state
    function showErrorState() {
        statusIndicator.className = 'status-indicator unknown';
        statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        statusHeading.textContent = 'UNABLE TO CHECK STATUS';
        statusMessage.textContent = 'There was a problem connecting to the tennis court status service.';
        statusDetails.textContent = 'Please try again later or check the Central Park Tennis Center website directly.';
        lastUpdated.textContent = '';
    }
    
    // Function to update the "last checked" time
    function updateLastCheckedTime() {
        const now = new Date();
        pageUpdatedTime.textContent = formatDate(now);
    }
    
    // Format date to a readable string in Eastern Time
    function formatDate(date) {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'America/New_York' // Force Eastern Time
        });
    }
    
    // Auto-refresh every 30 minutes (1800000 ms)
    // This ensures users who leave the page open get updates
    setInterval(fetchCourtStatus, 1800000);
});