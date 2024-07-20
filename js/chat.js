        let lastMessageTime = 0;
        let messageCountInLastTenSeconds = 0;
        let canSendMessage = true;

        const discordWebhookUrl = 'https://discord.com/api/webhooks/1264370458304843796/x33GBVOaOtMIuns0xhANrpTvWmR316XuVm0SGMOyJ3JEbqql5GsZ60ZHRK0EZY-qn2EZ';

        document.addEventListener('DOMContentLoaded', (event) => {
            loadMessages();
            fetchDiscordMessages();

            document.getElementById('chat-icon').addEventListener('click', () => {
                const chatboxContainer = document.getElementById('chatbox-container');
                chatboxContainer.classList.add('open');
                chatboxContainer.style.display = 'flex';
            });

            document.getElementById('message').addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    handleSendMessage();
                }
            });

            const sendMessageStatus = localStorage.getItem('canSendMessage');
            if (sendMessageStatus !== null) {
                canSendMessage = JSON.parse(sendMessageStatus);
            }

            checkAndExtendSanction();
            setInterval(fetchDiscordMessages, 5000); // Fetch new messages every 5 seconds
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
            const messageInput = document.getElementById('message');
            let message = messageInput.value.trim();

            if (message === '') return;

            if (message.toLowerCase() === 'clear_chat_robinou') {
                clearChatbox();
                messageInput.value = '';
                return;
            }

            if (now - lastMessageTime < 10000) {
                messageCountInLastTenSeconds++;
                if (messageCountInLastTenSeconds > 5) {
                    canSendMessage = false;
                    localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage));
                    setTimeout(() => {
                        canSendMessage = true;
                        localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage));
                    }, 5000);
                    alert("Vous avez envoyé trop de messages en peu de temps. Attendez 5 secondes avant d'envoyer un autre message.");
                    return;
                }
            } else {
                lastMessageTime = now;
                messageCountInLastTenSeconds = 1;
            }

            const insultingWords = ['Gredin', 'insulte2', 'insulte3'];
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
            localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage));

            setTimeout(() => {
                canSendMessage = true;
                localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage));
            }, 7200000);

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

        function clearChatbox() {
            localStorage.removeItem('chatMessages');
            const chatBox = document.getElementById('chatbox');
            while (chatBox.firstChild) {
                chatBox.removeChild(chatBox.firstChild);
            }
        }

        function sendToDiscord(message) {
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
            const discordChannelMessagesUrl = 'https://discord.com/api/channels/1253017916119715975/messages';

            fetch(discordChannelMessagesUrl, {
                headers: {
                    'Authorization': 'Bot YOUR_BOT_TOKEN' // Replace with your actual bot token
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
                    localStorage.setItem('canSendMessage', JSON.stringify(canSendMessage));
                }
            }
        }
