// KRİTİK: BURAYA SADECE WEB SİTESİ İÇİN OLUŞTURULAN YENİ N8N WEBHOOK ADRESİNİ YAZIN
const N8N_WEBHOOK_URL_DEMO = "http://13.49.240.114:5678/webhook/18f2d60f-60d9-46f3-8bdf-10c3464d2b7f"; // HTTP/HTTPS kontrolü yapın!

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

            // JSON.parse() kaldırıldı. N8N'den gelen metin doğrudan alınıyor.
            let replyText = data.reply ? data.reply : "⚠️ N8N'den geçerli yanıt gelmedi.";

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
    
    let contentHTML = '';

    // BOT MESAJI ise ikonu ekle
    if (className.includes('bot-message')) {
        // Font Awesome Robot İkonu
        const botIcon = '<div class="bot-icon"><i class="fas fa-robot"></i></div>';
        const messageContent = `<div class="bot-message-content">${text}</div>`;
        contentHTML = botIcon + messageContent;
        
        // İlk mesajın (hoş geldiniz mesajının) içeriğini doğru ayarlamak için
        if(className.includes('initial-message')){
             messageDiv.innerHTML = botIcon + `<div class="bot-message-content">${text}</div>`;
             messagesArea.appendChild(messageDiv);
             messagesArea.scrollTop = messagesArea.scrollHeight;
             return messageDiv;
        }

    } else {
        // KULLANICI MESAJI ise sadece metni kullan
        contentHTML = text;
    }
    
    // Mesaj içeriğini yerleştir
    messageDiv.innerHTML = contentHTML;
    messagesArea.appendChild(messageDiv);
    
    // En alta kaydır
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return messageDiv;
}

// Mesaj içeriğini güncelleyen yardımcı fonksiyon
function updateMessageInChat(div, newText) {
    // İYİLEŞTİRME: Botun yanıtındaki **bold** metinleri HTML olarak işler.
    const htmlContent = newText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Eğer bot mesajıysa, ikonu koruyarak sadece içeriği güncelleriz
    if (div.classList.contains('bot-message')) {
        // İkonu al
        const botIcon = '<div class="bot-icon"><i class="fas fa-robot"></i></div>';
        
        // İçerik kısmını güncelle
        div.innerHTML = botIcon + `<div class="bot-message-content">${htmlContent}</div>`;
    } else {
        // Kullanıcı mesajıysa direkt metni koyar
        div.innerHTML = htmlContent;
    }

    div.classList.remove('loading');
    messagesArea.scrollTop = messagesArea.scrollHeight;
}