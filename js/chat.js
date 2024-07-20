let lastMessageTime = 0;
let messageCountInLastTenSeconds = 0;
let canSendMessage = true;

const discordWebhookUrl = 'https://discord.com/api/webhooks/1264351699649171506/pGKdmAaiW5WGaDHE-yryzNq4plD9xjWRuXAcZIxK9EzIfEUZElAgo7-MPeXNGhdeWcTf';

document.addEventListener('DOMContentLoaded', (event) => {
    loadMessages();
    fetchDiscordMessages();

    document.getElementById('chat-icon').addEventListener('click', () => {
        const chatboxContainer = document.getElementById('chatbox-container');
        chatboxContainer.classList.add('open');
        chatboxContainer.style.display = 'flex';
    });

    document.getElementById('close-chatbox').addEventListener('click', () => {
        const chatboxContainer = document.getElementById('chatbox-container');
        chatboxContainer.classList.remove('open');
        setTimeout(() => {
            chatboxContainer.style.display = 'none';
        }, 300);  // Match this to the duration of the animation
    });

    document.getElementById('message-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleSendMessage(); // Appel handleSendMessage() lorsque "Enter" est pressé
        }
    });

    // Récupérer l'état de canSendMessage depuis le localStorage
    const sendMessageStatus = localStorage.getItem('canSendMessage');
    if (sendMessageStatus !== null) {
        canSendMessage = JSON.parse(sendMessageStatus);
    }

    // Vérifier et prolonger la sanction si nécessaire
    checkAndExtendSanction();
});

function handleSendMessage() {
    if (canSendMessage = true) {
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

    // Vérification du spam
    if (now - lastMessageTime < 10000) { // Si moins de 10 secondes se sont écoulées depuis le dernier message
        messageCountInLastTenSeconds++;
        if (messageCountInLastTenSeconds > 5) {
            canSendMessage = false; // Désactive l'envoi de messages
            localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Sauvegarder dans le localStorage
            setTimeout(() => {
                canSendMessage = true; // Réactive l'envoi de messages après 5 secondes
                localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Mettre à jour dans le localStorage
            }, 5000); // Délai de 5 secondes avant de pouvoir envoyer à nouveau un message
            alert("Vous avez envoyé trop de messages en peu de temps. Attendez 5 secondes avant d'envoyer un autre message.");
            return;
        }
    } else {
        lastMessageTime = now;
        messageCountInLastTenSeconds = 1;
    }

    // Vérification des mots insultants
    const insultingWords = ['Gredin', 'insulte2', 'insulte3']; // Liste des mots insultants (à remplacer par une liste réelle)
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

function blockUserForTwoHours(insultingMessage) {
    canSendMessage = false;
    localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Sauvegarder dans le localStorage

    setTimeout(() => {
        canSendMessage = true;
        localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Mettre à jour dans le localStorage
    }, 7200000); // 2 heures en millisecondes

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
    const discordWebhookUrl = 'https://discord.com/api/webhooks/1253662106251821076/jPim_rPaIAdMGXWZSKrrgC6wjG0upGFcMdKfCR52F_uBeFd-J1kU85yCUoynnhomgQK8';

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
    const discordChannelMessagesUrl = 'https://discord.com/channels/1056728046171848714/1253269087081992244';

    // Fetch messages from your server that stores Discord messages
    fetch(discordChannelMessagesUrl)
        .then(response => response.json())
        .then(messages => {
            messages.forEach(message => {
                appendMessage('Discord: ' + message.content);
                saveMessage('Discord: ' + message.content);
            });
        })
        .catch(error => console.error('Error fetching messages from Discord:', error));
}

function getUserIPAddress() {
    // Fonction fictive pour récupérer l'adresse IP de l'utilisateur
    return '127.0.0.1';
}

function getUserLocation() {
    // Fonction fictive pour récupérer la localisation de l'adresse IP de l'utilisateur
    return 'Localisation fictive';
}

function checkAndExtendSanction() {
    const blockExpiration = localStorage.getItem('blockExpiration');
    if (blockExpiration) {
        const now = new Date().getTime();
        const extendedExpiration = parseInt(blockExpiration, 10) + 10000; // Ajoute 10 secondes (en millisecondes)

        if (extendedExpiration > now) {
            const additionalSeconds = Math.ceil((extendedExpiration - now) / 1000);
            alert(`Suite à une déconnexion de la page, 10 secondes ont été ajoutées à votre sanction existante. Vous ne pouvez pas envoyer de messages pendant encore ${additionalSeconds} secondes.`);
            setTimeout(() => {
                localStorage.removeItem('blockExpiration');
            }, extendedExpiration - now);
            canSendMessage = false;
            localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage)); // Sauvegarder dans le localStorage
        }
    }
}
