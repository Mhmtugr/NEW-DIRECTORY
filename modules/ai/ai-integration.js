/**
 * ai-integration.js
 * Yapay zeka modüllerini sistem ile entegre eden kod
 */

// Yapay Zeka Entegrasyon Modülü
const AIIntegrationModule = (function() {
    // Özel değişkenler
    let initialized = false;
    let aiModels = {};
    let predictionCache = {};
    
    // Yapay zeka modüllerini yükle
    async function loadAIModels() {
        console.log("Yapay Zeka modülleri yükleniyor...");
        
        try {
            // Gelişmiş AI asistanı yükle
            await loadScript('js/advanced-ai.js');
            console.log("Gelişmiş AI asistanı yüklendi");
            
            // Tam entegrasyon için diğer gerekli modülleri yükle
            await Promise.all([
                loadDependencies()
            ]);
            
            return true;
        } catch (error) {
            console.error("Yapay Zeka modülleri yüklenirken hata:", error);
            return false;
        }
    }
    
    // Yapay zeka bağımlılıklarını yükle
    async function loadDependencies() {
        // Burada gerekli bağımlılıklar yüklenebilir (örn. LLM modelleri için gerekli kütüphaneler)
        return true;
    }
    
    // Yapay zeka yeteneklerini sistemle entegre et
    function integrateAICapabilities() {
        console.log("Yapay Zeka yetenekleri entegre ediliyor...");
        
        // Dashboard entegrasyonu
        if (typeof window.loadDashboardData === 'function') {
            const originalLoadDashboard = window.loadDashboardData;
            
            // Fonksiyonu güçlendir
            window.loadDashboardData = async function() {
                const result = await originalLoadDashboard();
                
                // Yapay zeka önerileri ekle
                try {
                    const aiInsights = await generateAIInsights();
                    updateDashboardWithAIInsights(aiInsights);
                } catch (error) {
                    console.warn("AI önerileri yüklenirken hata:", error);
                }
                
                return result;
            };
        }
        
        // Sipariş entegrasyonu
        if (typeof window.showOrderDetail === 'function') {
            const originalShowOrderDetail = window.showOrderDetail;
            
            // Fonksiyonu güçlendir
            window.showOrderDetail = function(orderId) {
                // Orijinal fonksiyonu çağır
                originalShowOrderDetail(orderId);
                
                // Yapay zeka analizini ekle
                enhanceOrderDetailWithAI(orderId);
            };
        }
        
        // Üretim entegrasyonu
        if (typeof window.showProductionPlan === 'function') {
            const originalShowProductionPlan = window.showProductionPlan;
            
            // Fonksiyonu güçlendir
            window.showProductionPlan = function() {
                // Orijinal fonksiyonu çağır
                originalShowProductionPlan();
                
                // Yapay zeka optimizasyonunu ekle
                enhanceProductionPlanWithAI();
            };
        }
        
        // Malzeme entegrasyonu
        if (typeof window.loadStockData === 'function') {
            const originalLoadStockData = window.loadStockData;
            
            // Fonksiyonu güçlendir
            window.loadStockData = async function() {
                const result = await originalLoadStockData();
                
                // Yapay zeka önerilerini ekle
                try {
                    const materialInsights = await generateMaterialAIInsights();
                    updateStockWithAIInsights(materialInsights);
                } catch (error) {
                    console.warn("Malzeme AI önerileri yüklenirken hata:", error);
                }
                
                return result;
            };
        }
        
        // Diğer entegrasyonlar...
        
        console.log("Yapay Zeka yetenekleri başarıyla entegre edildi");
        return true;
    }
    
    // Dashboard'a yapay zeka önerilerini ekle
    function updateDashboardWithAIInsights(insights) {
        const aiRecommendations = document.getElementById('ai-recommendations');
        if (!aiRecommendations) return;
        
        // Eğer içerik varsa güncelle
        if (insights && insights.recommendation) {
            aiRecommendations.innerHTML = insights.recommendation;
        }
    }
    
    // Sipariş detayını yapay zeka ile zenginleştir
    function enhanceOrderDetailWithAI(orderId) {
        // Sipariş detay modülünü bul
        const orderDetailModal = document.getElementById('order-detail-modal');
        if (!orderDetailModal) return;
        
        // AI tab'ı yoksa ekle
        const orderTabs = orderDetailModal.querySelector('.tabs');
        
        if (orderTabs && !orderTabs.querySelector(`[data-tab="ai-analysis"]`)) {
            // AI analizi tab'ı ekle
            const aiTab = document.createElement('div');
            aiTab.className = 'tab';
            aiTab.setAttribute('data-tab', 'ai-analysis');
            aiTab.textContent = 'Yapay Zeka Analizi';
            orderTabs.appendChild(aiTab);
            
            // AI analizi içerik alanı ekle
            const tabContents = orderDetailModal.querySelector('.modal-body');
            
            if (tabContents) {
                const aiContent = document.createElement('div');
                aiContent.className = 'tab-content';
                aiContent.id = 'ai-analysis-content';
                aiContent.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Yapay zeka analizi yükleniyor...</div>';
                tabContents.appendChild(aiContent);
                
                // Tab olay dinleyicisini ekle
                aiTab.addEventListener('click', function() {
                    // Tüm tab ve içerikleri deaktif et
                    orderTabs.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                    tabContents.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    
                    // Bu tab'ı aktif et
                    aiTab.classList.add('active');
                    aiContent.classList.add('active');
                    
                    // AI analizini yükle
                    loadOrderAIAnalysis(orderId, aiContent);
                });
            }
        }
    }
    
    // Sipariş için yapay zeka analizi yükle
    async function loadOrderAIAnalysis(orderId, container) {
        try {
            // Sipariş verilerini al
            const order = await getOrderDetails(orderId);
            
            if (!order) {
                container.innerHTML = `<div class="error-box">Sipariş bilgileri alınamadı.</div>`;
                return;
            }
            
            // Gecikme riski analizi
            const delayRisk = await analyzeDelayRisk(order);
            
            // Optimizasyon önerileri
            const optimizations = await analyzeOrderOptimizations(order);
            
            // Container'a analiz sonuçlarını ekle
            container.innerHTML = `
                <div class="ai-analysis-container">
                    <div class="ai-section" style="margin-bottom: 20px;">
                        <h3 style="margin-bottom: 10px;">Gecikme Riski Analizi</h3>
                        <div class="risk-meter" style="margin-bottom: 15px;">
                            <div class="risk-bar" style="height: 8px; background-color: #e2e8f0; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${delayRisk.riskPercentage}%; background-color: ${delayRisk.riskColor};"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px;">
                                <span>Düşük Risk</span>
                                <span>Orta Risk</span>
                                <span>Yüksek Risk</span>
                            </div>
                        </div>
                        <div class="risk-details" style="margin-bottom: 15px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                            <p style="margin-bottom: 10px;"><strong>Risk Seviyesi:</strong> <span style="color: ${delayRisk.riskColor};">${delayRisk.riskLevel}</span></p>
                            <p style="margin-bottom: 10px;"><strong>Risk Faktörleri:</strong></p>
                            <ul style="margin-left: 20px;">
                                ${delayRisk.riskFactors.map(factor => `<li>${factor}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="ai-section" style="margin-bottom: 20px;">
                        <h3 style="margin-bottom: 10px;">Optimizasyon Önerileri</h3>
                        <div class="optimizations" style="margin-bottom: 15px;">
                            ${optimizations.map(opt => `
                                <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${opt.priorityColor};">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                        <strong>${opt.title}</strong>
                                        <span style="font-size: 12px; color: ${opt.priorityColor};">${opt.priority} Öncelik</span>
                                    </div>
                                    <p>${opt.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="ai-section" style="margin-bottom: 20px;">
                        <h3 style="margin-bottom: 10px;">Tahmini Teslim Analizi</h3>
                        <div style="padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Planlanan Teslim:</strong></td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${formatDate(order.deliveryDate)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Tahmini Teslim:</strong></td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; ${delayRisk.estimatedDeliveryDate > new Date(order.deliveryDate) ? 'color: #ef4444;' : 'color: #10b981;'}">
                                        ${formatDate(delayRisk.estimatedDeliveryDate)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Sapma:</strong></td>
                                    <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; ${delayRisk.deliveryDeviation > 0 ? 'color: #ef4444;' : 'color: #10b981;'}">
                                        ${delayRisk.deliveryDeviation > 0 ? '+' : ''}${delayRisk.deliveryDeviation} gün
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0;"><strong>Başarı Olasılığı:</strong></td>
                                    <td style="padding: 8px 0;">${delayRisk.successProbability}%</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error("Sipariş AI analizi yüklenirken hata:", error);
            container.innerHTML = `<div class="error-box">Yapay zeka analizi yüklenirken bir hata oluştu: ${error.message}</div>`;
        }
    }
    
    // Üretim planını yapay zeka ile zenginleştir
    function enhanceProductionPlanWithAI() {
        // Üretim planı yüklendikten sonra yapay zeka önerilerini ekle
        setTimeout(async () => {
            try {
                // Üretim optimizasyonu
                const optimizations = await generateProductionOptimizations();
                
                // Optimizasyon önerilerini ekle
                const productionContainer = document.getElementById('production-page');
                if (!productionContainer) return;
                
                // Optimizasyon paneli için yer var mı kontrol et
                let aiPanel = productionContainer.querySelector('.ai-optimization-panel');
                
                if (!aiPanel) {
                    // Yeni panel oluştur
                    aiPanel = document.createElement('div');
                    aiPanel.className = 'ai-optimization-panel card';
                    aiPanel.innerHTML = `
                        <div class="card-header">
                            <div class="card-title">Yapay Zeka Optimizasyon Önerileri</div>
                        </div>
                        <div class="card-body" id="ai-production-recommendations">
                            <div class="loading"><i class="fas fa-spinner fa-spin"></i> Yapay zeka önerileri yükleniyor...</div>
                        </div>
                    `;
                    
                    // Sayfaya ekle
                    const insertPoint = productionContainer.querySelector('.card');
                    if (insertPoint && insertPoint.parentNode) {
                        insertPoint.parentNode.insertBefore(aiPanel, insertPoint.nextSibling);
                    } else {