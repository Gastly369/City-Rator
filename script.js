function searchCity() {
    var city = document.getElementById("citySearch").value;
    if (!city) {
        alert("Please enter a city name to search.");
        return;
    }

    const OPENWEATHERMAP_API_KEY = 'ee4af6c7d53cf560ffd75f0e48d21885';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`City not found: ${city}`);
            }
            return response.json();
        })
        .then(data => {
            displayCityInfo(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Failed to retrieve weather data for ${city}.`);
        });
}

function displayCityInfo(data) {
    const cityInfoDiv = document.getElementById('cityInfo');
    cityInfoDiv.innerHTML = `
        <h2>Weather in ${data.name}</h2>
        <p><strong>Condition:</strong> ${data.weather[0].main}</p>
        <p><strong>Temperature:</strong> ${(data.main.temp - 273.15).toFixed(2)}°C</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    `;
    cityInfoDiv.style.display = 'block';
}

function openUserProfile() {
    document.getElementById('userProfileModal').style.display = 'block';
}

function closeUserProfile() {
    document.getElementById('userProfileModal').style.display = 'none';
}

async function connectToMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected account:', accounts[0]);
            alert(`Connected account: ${accounts[0]}`);
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            alert('An error occurred while connecting to MetaMask.');
        }
    } else {
        alert('MetaMask is not installed. Please install MetaMask to connect your wallet.');
    }
}

// Open Chat Modal Functionality
function openChat() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.style.display = 'block';
    }
}

// Add Event Listeners after DOM Content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const connectWalletButton = document.getElementById('connectWallet');
    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', connectToMetaMask);
    }

    const chatIcon = document.getElementById('chatIcon');
    if (chatIcon) {
        chatIcon.addEventListener('click', openChat);
    }

    // Assuming you have Socket.io script included in your HTML
    const socket = io(); // Initialize socket.io
    const sendMessageButton = document.getElementById('sendMessage');
    const messageInput = document.getElementById('messageInput');

    // Function to send chat messages
    sendMessageButton.addEventListener('click', function() {
        const message = messageInput.value;
        socket.emit('chatMessage', message); // Adapt based on your server-side socket handling
        messageInput.value = ''; // Clear message input after sending
    });

    // Listening for incoming chat messages
    socket.on('newMessage', function(message) {
        displayMessage(message); // Implement displayMessage to show new messages in chat modal
    });
});

function displayMessage(message) {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
