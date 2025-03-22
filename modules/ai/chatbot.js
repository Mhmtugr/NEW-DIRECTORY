/**
 * chatbot.js
 * Yapay zeka asistanı işlevleri
 */

// Chatbot penceresini göster/gizle
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbot-window');
    if (chatbotWindow.style.display === 'flex') {
        chatbotWindow.style.display = 'none';
    } else {
        chatbotWindow.style.display = 'flex';
        document.getElementById('chatbot-input').focus();
    }
}

// Mesaj gönderme
async function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Kullanıcı mesajını ekle
    const chatBody = document.getElementById('chatbot-body');
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'chat-message user';
    userMessageElement.textContent = message;
    chatBody.appendChild(userMessageElement);
    
    // Input'u temizle
    input.value = '';
    
    // Yanıt oluşturma (yapay zeka ile entegrasyon)
    await generateBotResponse(message, chatBody);
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Yapay zeka yanıtı oluşturma
async function generateBotResponse(message, chatBody) {
    // Yükleniyor göster
    const loadingElement = document.createElement('div');
    loadingElement.className = 'chat-message bot';
    loadingElement.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Yanıt hazırlanıyor...';
    chatBody.appendChild(loadingElement);
    
    try {
        // Demo yanıt mantığı
        let botResponse = '';
        
        if (message.toLowerCase().includes('merhaba') || message.toLowerCase().includes('selam')) {
            botResponse = 'Merhaba! Size nasıl yardımcı olabilirim?';
        } else if (message.toLowerCase().includes('sipariş') && message.toLowerCase().includes('durum')) {
            botResponse = 'Aktif siparişlerinizi kontrol ediyorum... AYEDAŞ siparişi (24-03-A001) üretim aşamasında, BAŞKENT EDAŞ siparişi (24-03-B002) için malzeme tedarik sorunu bulunuyor.';
        } else if (message.toLowerCase().includes('malzeme') || message.toLowerCase().includes('stok')) {
            botResponse = 'Stok durumunu kontrol ediyorum... Kablo başlıkları ve gerilim gösterge malzemelerinde eksiklik var. Satın alma departmanı tedarik işlemlerini yürütüyor.';
        } else if (message.toLowerCase().includes('gecikme') || message.toLowerCase().includes('risk')) {
            botResponse = 'BAŞKENT EDAŞ siparişi (24-03-B002) için kablo başlıkları tedarikinde gecikme riski yüksek. Tedarikçiden gelen bilgilere göre, planlanan teslimat üretim planından daha geç. Alternatif tedarikçilerle iletişime geçmenizi öneririm.';
        } else if (message.toLowerCase().includes('üretim') || message.toLowerCase().includes('plan')) {
            botResponse = 'Mevcut üretim planına göre, Mayıs ayında 3 siparişin üretimi devam ediyor. AYEDAŞ siparişi 8 Mayıs\'da, BAŞKENT EDAŞ siparişi 15 Mayıs\'da, ENERJİSA siparişi 10 Haziran\'da teslim edilecek şekilde planlandı.';
        } else if (message.toLowerCase().includes('öneri') || message.toLowerCase().includes('optimizasyon')) {
            botResponse = 'Mayıs ayı siparişleri için üretim optimizasyonu öneriyorum. RM 36 LB tipi hücreler için üretim süreçlerini paralel planlayarak yaklaşık 5 iş günü kazanç sağlayabilirsiniz. Detaylı planı görmek ister misiniz?';
        } else if (message.toLowerCase().includes('tedarikçi') || message.toLowerCase().includes('satın')) {
            botResponse = 'Gerilim gösterge malzemesi için alternatif tedarikçi önerilerim: Elektra (2 gün teslimat, %5 daha pahalı), Siemens (5 gün teslimat, standart fiyat), ABB (acil teslimat mümkün, %10 daha pahalı). Hangisiyle iletişime geçmek istersiniz?';
        } else if (message.toLowerCase().includes('müşteri') || message.toLowerCase().includes('iletişim')) {
            botResponse = 'Müşteri bilgilerini getiriyorum... AYEDAŞ: Ahmet Yılmaz (0212 555 11 22), ENERJİSA: Mehmet Kaya (0216 333 44 55), BAŞKENT EDAŞ: Ayşe Demir (0312 444 77 88), TOROSLAR EDAŞ: Fatma Şahin (0322 666 99 00)';
        } else if (message.toLowerCase().includes('yardım') || message.toLowerCase().includes('ne yapabilir')) {
            botResponse = 'Size şu konularda yardımcı olabilirim: sipariş durumlarını kontrol etme, stok/malzeme durumunu sorgulama, üretim planlarını görüntüleme, optimizasyon önerileri sunma, tedarikçi bilgilerini getirme ve müşteri iletişim bilgilerini sağlama.';
        } else {
            botResponse = 'Özür dilerim, sorunuzu tam olarak anlayamadım. Siparişler, üretim planı, malzeme durumu veya optimizasyon önerileri hakkında bilgi almak için daha açık bir soru sorabilir misiniz?';
        }
        
        // Gerçek entegrasyon için buraya API çağrısı eklenebilir
        // const response = await callChatbotAPI(message);
        // botResponse = response.text;
        
        // Gecikme simülasyonu (gerçekçi yanıt süresi için)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Yükleniyor mesajını kaldır
        chatBody.removeChild(loadingElement);
        
        // Gerçek yanıtı ekle
        const botMessageElement = document.createElement('div');
        botMessageElement.className = 'chat-message bot';
        botMessageElement.textContent = botResponse;
        chatBody.appendChild(botMessageElement);
        
    } catch (error) {
        console.error("Chatbot yanıt hatası:", error);
        
        // Hata durumunda
        chatBody.removeChild(loadingElement);
        const errorElement = document.createElement('div');
        errorElement.className = 'chat-message bot';
        errorElement.textContent = 'Üzgünüm, yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
        chatBody.appendChild(errorElement);
    }
}

// Sayfa yüklendiğinde eventleri bağla
document.addEventListener('DOMContentLoaded', function() {
    // Chatbot trigger butonu için tıklama olayı
    const chatbotTrigger = document.querySelector('.chatbot-trigger');
    if (chatbotTrigger) {
        chatbotTrigger.addEventListener('click', toggleChatbot);
    }
    
    // Chatbot kapatma butonu için tıklama olayı
    const chatbotClose = document.querySelector('.chatbot-close');
    if (chatbotClose) {
        chatbotClose.addEventListener('click', toggleChatbot);
    }
    
    // Mesaj gönderme butonu için tıklama olayı
    const chatbotSend = document.querySelector('.chatbot-send');
    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendChatMessage);
    }
    
    // Enter tuşu ile mesaj gönderme
    const chatbotInput = document.getElementById('chatbot-input');
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}); 
