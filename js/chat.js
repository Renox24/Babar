let lastMessageTime = 0;
let messageCountInLastTenSeconds = 0;
let canSendMessage = true;

const discordWebhookUrl = 'https://discord.com/api/webhooks/1264370458304843796/x33GBVOaOtMIuns0xhANrpTvWmR316XuVm0SGMOyJ3JEbqql5GsZ60ZHRK0EZY-qn2EZ';
const discordAlertUrl = 'https://discord.com/api/webhooks/1259260391498977311/YOUR_ALERT_WEBHOOK';

document.addEventListener('DOMContentLoaded', (event) => {
    loadMessages();
    fetchDiscordMessages();

    document.getElementById('chat-icon').addEventListener('click', () => {
        console.log('Chat icon clicked'); // Debug log
        const chatboxContainer = document.getElementById('chatbox-container');
        if (chatboxContainer) {
            chatboxContainer.classList.add('open');
            chatboxContainer.style.display = 'flex';
        } else {
            console.error('Chatbox container not found');
        }
    });

    document.getElementById('close-chatbox').addEventListener('click', () => {
        console.log('Close chatbox clicked'); // Debug log
        const chatboxContainer = document.getElementById('chatbox-container');
        if (chatboxContainer) {
            chatboxContainer.classList.remove('open');
            setTimeout(() => {
                chatboxContainer.style.display = 'none';
            }, 300);  // Match this to the duration of the animation
        } else {
            console.error('Chatbox container not found');
        }
    });

    document.getElementById('message-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSendMessage(); // Call handleSendMessage() when "Enter" is pressed
        }
    });

    // Retrieve the state of canSendMessage from localStorage
    const sendMessageStatus = localStorage.getItem('canSendMessage');
    if (sendMessageStatus !== null) {
        canSendMessage = JSON.parse(sendMessageStatus);
    }

    // Check and extend the sanction if necessary
    checkAndExtendSanction();
});

function handleSendMessage() {
    if (canSendMessage) {
        sendMessage();
    } else {
        alert("Envoi de messages désactivé pour le moment.");
    }
}

function sendMessage() {
    const now = new Date().getTime();
    const messageInput = document.getElementById('message-input');
    let message = messageInput.value.trim();

    if (message === '') return;

    // Check for the "clear_chat_robinou" command
    if (message.toLowerCase() === "clear_chat_robinou") {
        clearChat();
        messageInput.value = '';
        return;
    }

    // Spam check
    if (now - lastMessageTime < 10000) { // Less than 10 seconds since the last message
        messageCountInLastTenSeconds++;
        if (messageCountInLastTenSeconds > 5) {
            canSendMessage = false; // Disable sending messages
            localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Save in localStorage
            setTimeout(() => {
                canSendMessage = true; // Re-enable sending messages after 5 seconds
                localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Update in localStorage
            }, 5000); // 5 second delay before sending another message
            alert("Vous avez envoyé trop de messages en peu de temps. Attendez 5 secondes avant d'envoyer un autre message.");
            return;
        }
        if (messageCountInLastTenSeconds > 30) {
            sendSpamAlert();
        }
    } else {
        lastMessageTime = now;
        messageCountInLastTenSeconds = 1;
    }

    // Insulting words check
    const insultingWords = ['Gredin', 'insulte2', 'insulte3']; // List of insulting words (replace with an actual list)
    const foundInsult = insultingWords.some(word => message.toLowerCase().includes(word.toLowerCase()));

    if (foundInsult) {
        blockUserForTwoHours(message);
        sendInsultNotificationToDiscord(message);
        return;
    }

    appendMessage('You: ' + message);
    saveMessage('You: ' + message);
    sendToDiscord('User: ' + message);
    messageInput.value = '';
}

function clearChat() {
    const chatBox = document.getElementById('chatbox');
    while (chatBox.firstChild) {
        chatBox.removeChild(chatBox.firstChild);
    }
    localStorage.removeItem('chatMessages');
}

function blockUserForTwoHours(insultingMessage) {
    canSendMessage = false;
    localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Save in localStorage

    setTimeout(() => {
        canSendMessage = true;
        localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Update in localStorage
    }, 7200000); // 2 hours in milliseconds

    alert("Vous avez envoyé un message contenant des mots insultants. Vous ne pourrez plus envoyer de messages pendant 2 heures.");
}

function sendInsultNotificationToDiscord(insultingMessage) {
    const now = new Date();
    const payload = {
        content: `Message : ${insultingMessage}\nIP : ${getUserIPAddress()}\nLocalisation : ${getUserLocation()}\nDate + heure : ${now.toLocaleString()}`
    };

    fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(error => console.error('Error sending insult notification to Discord:', error));
}

function sendSpamAlert() {
    const now = new Date();
    const payload = {
        content: `[${now.toLocaleString()}] Problème de spam\nIP : ${getUserIPAddress()}`
    };

    fetch(discordAlertUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(error => console.error('Error sending spam alert to Discord:', error));
}

function appendMessage(message) {
    const chatBox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.className = 'chatbox-message';
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessage(message) {
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    messages.forEach(message => appendMessage(message));
}

function sendToDiscord(message) {
    // Check if the message is the clear chat command
    if (message.includes('clear_chat_robinou')) {
        const now = new Date();
        const payload = {
            content: `[${now.toLocaleString()}] Problème dans le chatbox`
        };
        fetch(discordAlertUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(error => console.error('Error sending problem alert to Discord:', error));
        return;
    }

    const payload = {
        content: message
    };

    fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).catch(error => console.error('Error sending message to Discord:', error));
}

function fetchDiscordMessages() {
    const discordChannelMessagesUrl = 'https://discord.com/api/channels/1264351445650636850/messages';

    fetch(discordChannelMessagesUrl, {
        headers: {
            'Authorization': 'YOUR_BOT_TOKEN' // Replace with your actual bot token
        }
    })
    .then(response => response.json())
    .then(messages => {
        messages.forEach(message => {
            if (message.channel_id === '1264351445650636850') {
                appendMessage(`${message.author.username}: ${message.content}`);
                saveMessage(`${message.author.username}: ${message.content}`);
            }
        });
    })
    .catch(error => console.error('Error fetching messages from Discord:', error));
}

function getUserIPAddress() {
    return '127.0.0.1';
}

function getUserLocation() {
    return 'Localisation fictive';
}

function checkAndExtendSanction() {
    const blockExpiration = localStorage.getItem('blockExpiration');
    if (blockExpiration) {
        const now = new Date().getTime();
        const extendedExpiration = parseInt(blockExpiration, 10) + 10000;

        if (extendedExpiration > now) {
            const additionalSeconds = Math.ceil((extendedExpiration - now) / 1000);
            alert(`Suite à une déconnexion de la page, 10 secondes ont été ajoutées à votre sanction existante. Vous ne pouvez pas envoyer de messages pendant encore ${additionalSeconds} secondes.`);
            setTimeout(() => {
                localStorage.removeItem('blockExpiration');
            }, extendedExpiration - now);
            canSendMessage = false;
            localStorage.setItem('Here is the revised JavaScript code with the requested functionalities added')
            }}
}
