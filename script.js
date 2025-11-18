// KRİTİK: BURAYA SADECE WEB SİTESİ İÇİN OLUŞTURULAN YENİ N8N WEBHOOK ADRESİNİ YAZIN
const N8N_WEBHOOK_URL_DEMO = "http://13.49.240.114:5678/webhook/18f2d60f-60d9-46f3-8bdf-10c3464d2b7f"; 

const TEST_PHONE_WEB = "WEB_VISITOR_999@c.us"; // N8N'in beklediği format
const customerNameWeb = "Web Ziyaretçisi"; 

const messagesArea = document.getElementById('messages-area');
const userInput = document.getElementById('user-input');

// Enter tuşuna basıldığında sendMessage fonksiyonunu çağırır
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
        e.preventDefault(); // Varsayılan formu gönderme işlemini engeller
    }
});

// Sayfa yüklendiğinde en alta kaydır
window.onload = function() {
    messagesArea.scrollTop = messagesArea.scrollHeight; 
};

// Mesajı gönderme ve ekranda gösterme fonksiyonu
async function sendMessage() {
    const messageText = userInput.value.trim();

    if (messageText === "") return;

    // 1. Kullanıcı Mesajını Ekrana Ekle
    addMessageToChat(messageText, 'user-message');
    userInput.value = ''; // Giriş alanını temizle

    // 2. Botun Düşünme Göstergesini Ekle
    const botResponseDiv = addMessageToChat("Bot düşünüyor...", 'bot-message loading');

    try {
        // N8N'e gönderilecek JSON yükü
        const payload = {
            body: {
                from: TEST_PHONE_WEB,
                message: messageText,
                businessName: customerNameWeb 
            },
        };
        
        // Webhook POST isteğini gönderme
        const response = await fetch(N8N_WEBHOOK_URL_DEMO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // 3. N8N'den Gelen Yanıtı İşleme
        if (response.ok) {
            const data = await response.json();
            
            // N8N'den gelen yanıt (muhtemelen JSON.stringified)
            let replyText = data.reply ? JSON.parse(data.reply) : "⚠️ N8N'den geçerli yanıt gelmedi.";
            
            // Yanıtı ekranda göster
            updateMessageInChat(botResponseDiv, replyText);

        } else {
            // Webhook başarısız olursa (Örn: N8N 500 hatası verirse)
            updateMessageInChat(botResponseDiv, `❌ Sunucu Hatası: N8N yanıt veremiyor. Kod: ${response.status}`);
        }

    } catch (error) {
        // Ağ bağlantısı veya CORS hatası
        updateMessageInChat(botResponseDiv, `⚠️ Ağ Bağlantı Hatası: ${error.message}. Sunucuya ulaşılamıyor.`);
        console.error("Webhook Gönderim Hatası:", error);
    }
}

// Yeni mesaj div'i oluşturan yardımcı fonksiyon
function addMessageToChat(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + className;
    messageDiv.textContent = text;
    messagesArea.appendChild(messageDiv);
    // En alta kaydır
    messagesArea.scrollTop = messagesArea.scrollHeight; 
    return messageDiv;
}

// Mesaj içeriğini güncelleyen yardımcı fonksiyon
function updateMessageInChat(div, newText) {
    div.textContent = newText;
    div.classList.remove('loading');
    messagesArea.scrollTop = messagesArea.scrollHeight;
}