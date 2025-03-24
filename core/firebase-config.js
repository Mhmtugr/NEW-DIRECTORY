/**
 * @file firebase-config.js
 * @description Firebase yapılandırma ve başlatma işlemleri.
 * Tüm uygulamanın Firebase bağlantısını ve servislerini yönetir.
 */

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAFQdnF6RGFuQmrtjB3rCo_fkoQNk0QPJ4",
    authDomain: "mehmentendustriyeltakip.firebaseapp.com",
    projectId: "mehmentendustriyeltakip",
    storageBucket: "mehmentendustriyeltakip.appspot.com",
    messagingSenderId: "100391457932",
    appId: "1:100391457932:web:0fe2f9aab2835220a56466",
    measurementId: "G-L4TMML2WR2"
};

/**
 * Firebase servis durumu
 * @type {Object}
 */
const firebaseState = {
    isInitialized: false,        // Firebase başlatıldı mı
    isDemo: false,               // Demo modunda mı
    services: {                  // Servis durumları
        auth: false,              
        firestore: false,
        storage: false,
        analytics: false,
        functions: false
    },
    persistenceEnabled: false,   // Çevrimdışı persistance etkinleştirildi mi
    lastError: null              // Son hata
};

// Servis referansları için global değişkenler 
let app, auth, db, analytics, storage, functions;

/**
 * Demo modu kontrolü
 * @returns {boolean} Demo modunda mı
 */
function isDemoMode() {
    return window.CONFIG?.isDemo || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('netlify.app') ||
           window.location.search.includes('demo=true');
}

/**
 * Firebase'i başlat
 * @returns {Promise<boolean>} Başarılı mı
 */
async function initializeFirebase() {
    try {
        console.log('Firebase başlatılıyor...');
        
        // Demo modu kontrolü
        firebaseState.isDemo = isDemoMode();
        
        // Firebase tanımlı mı kontrol et
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK yüklenemedi. Demo moda geçiliyor...');
            enableDemoMode();
            return false;
        }
        
        // Firebase uygulamasını başlat
        if (!firebase.apps.length) {
            try {
                app = firebase.initializeApp(firebaseConfig);
                console.log("Firebase başlatıldı");
            } catch (initError) {
                console.warn("Firebase başlatılamadı, demo moda geçiliyor", initError);
                enableDemoMode();
                return false;
            }
        } else {
            app = firebase.app();
        }
        
        // Firebase servislerini başlat
        try {
            const result = await initializeFirebaseServices();
            
            if (result) {
                console.log("Firebase servisleri başarıyla başlatıldı");
                
                // Demo modda olduğumuzu kontrol et ve bildirimi göster
                if (firebaseState.isDemo) {
                    console.log("Demo modu aktif");
                    showDemoModeNotification();
                }
                
                // İlk veri seti kontrolü
                try {
                    await checkInitialDataset();
                } catch (datasetError) {
                    console.warn("İlk veri seti kontrolünde hata:", datasetError);
                    // Yine de devam ediyoruz
                }
                
                // Firebase başarıyla başlatıldı
                firebaseState.isInitialized = true;
                return true;
            } else {
                console.error("Firebase servisleri başlatılamadı");
                enableDemoMode();
                return false;
            }
        } catch (serviceError) {
            console.warn("Firebase servisleri alınamadı, demo moda geçiliyor", serviceError);
            enableDemoMode();
            return false;
        }
    } catch (error) {
        console.error("Firebase başlatma hatası:", error);
        firebaseState.lastError = error;
        enableDemoMode();
        return false;
    }
}

/**
 * Firebase servislerini başlat
 * @returns {Promise<boolean>} Başarılı mı
 */
async function initializeFirebaseServices() {
    try {
        // Auth servisi
        if (firebase.auth) {
            auth = firebase.auth();
            
            // Auth persistance modunu ayarla
            try {
                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                console.log("Firebase Auth başlatıldı ve persistance ayarlandı");
                firebaseState.services.auth = true;
            } catch (authError) {
                console.warn("Auth persistance ayarlanamadı:", authError);
                firebaseState.services.auth = false;
            }
        } else {
            console.warn("Firebase Auth modülü bulunamadı");
            firebaseState.services.auth = false;
        }
        
        // Firestore servisi
        if (firebase.firestore) {
            db = firebase.firestore();
            
            // Çevrimdışı persistance'ı etkinleştir
            try {
                await db.enablePersistence({
                    synchronizeTabs: true
                });
                console.log("Firestore çevrimdışı persistance etkinleştirildi");
                firebaseState.persistenceEnabled = true;
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn("Birden fazla sekme açık, çevrimdışı persistance devre dışı");
                } else if (err.code === 'unimplemented') {
                    console.warn("Tarayıcı Firestore çevrimdışı persistance desteklemiyor");
                } else {
                    console.error("Firestore persistance hatası:", err);
                }
                firebaseState.persistenceEnabled = false;
            }
            
            console.log("Firestore başlatıldı");
            firebaseState.services.firestore = true;
        } else {
            console.warn("Firestore modülü bulunamadı");
            firebaseState.services.firestore = false;
        }
        
        // Storage servisi (varsa)
        if (firebase.storage) {
            storage = firebase.storage();
            console.log("Firebase Storage başlatıldı");
            firebaseState.services.storage = true;
        } else {
            firebaseState.services.storage = false;
        }
        
        // Cloud Functions servisi (varsa)
        if (firebase.functions) {
            functions = firebase.functions();
            console.log("Firebase Functions başlatıldı");
            firebaseState.services.functions = true;
        } else {
            firebaseState.services.functions = false;
        }
        
        // Analytics servisi (varsa)
        if (firebase.analytics) {
            analytics = firebase.analytics();
            console.log("Firebase Analytics başlatıldı");
            firebaseState.services.analytics = true;
            
            // Demo modu takibi için özel event
            if (firebaseState.isDemo) {
                analytics.logEvent('demo_mode_enabled');
            }
        } else {
            firebaseState.services.analytics = false;
        }
        
        // Global değişkenlere ata (bazı eski kodlar için gerekli olabilir)
        window.firebase = firebase;
        window.auth = auth;
        window.db = db;
        window.storage = storage;
        window.functions = functions;
        window.analytics = analytics;
        
        return true;
    } catch (error) {
        console.error("Firebase servisleri başlatılamadı:", error);
        firebaseState.lastError = error;
        throw error;
    }
}

/**
 * İlk veri seti kontrolü (demo veriler için)
 * @returns {Promise<boolean>} Başarılı mı
 */
async function checkInitialDataset() {
    try {
        // Eğer demo modda değilsek atla
        if (!firebaseState.isDemo) {
            return true;
        }
        
        console.log("Demo modu için veri seti kontrolü yapılıyor...");
        
        // Koleksiyon var mı kontrol et
        const collections = ['users', 'orders', 'materials', 'customers', 'notes'];
        let dataExists = true;
        
        if (!db) {
            console.warn("Firestore bağlantısı olmadığı için veri seti kontrolü atlanıyor");
            return false;
        }
        
        for (const collection of collections) {
            try {
                const snapshot = await db.collection(collection).limit(1).get();
                if (snapshot.empty) {
                    console.log(`'${collection}' koleksiyonu boş, veriler yüklenecek`);
                    dataExists = false;
                    break;
                }
            } catch (e) {
                console.warn(`'${collection}' koleksiyonu kontrol edilirken hata:`, e);
                dataExists = false;
                break;
            }
        }
        
        // Eğer veriler yoksa, demo verilerini yükle
        if (!dataExists) {
            console.log("Demo veriler yükleniyor...");
            try {
                if (typeof seedSampleData === 'function') {
                    await seedSampleData();
                    console.log("Demo veriler başarıyla yüklendi");
                } else {
                    console.warn("seedSampleData fonksiyonu bulunamadığı için demo veriler yüklenemedi");
                    
                    // Alternatif olarak, gerektiğinde örnek verileri yüklemek için bir mock-data.js dosyası ekleyebiliriz
                    await loadMockData();
                }
            } catch (error) {
                console.error("Demo verileri yüklenirken hata:", error);
            }
        }
        
        return true;
    } catch (error) {
        console.error("Veri seti kontrolünde hata:", error);
        return false;
    }
}

/**
 * Mock veri yükleme
 * @returns {Promise<boolean>} Başarılı mı
 */
async function loadMockData() {
    try {
        console.log("Mock veriler yükleniyor...");
        
        // Mock veriler için script yükle
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'js/mock-data.js';
            script.onload = () => {
                console.log("Mock veriler script'i yüklendi");
                
                // Mock veri fonksiyonu varsa çağır
                if (typeof initMockData === 'function') {
                    initMockData()
                        .then(() => resolve(true))
                        .catch(err => {
                            console.error("Mock veri yükleme hatası:", err);
                            resolve(false);
                        });
                } else {
                    console.warn("initMockData fonksiyonu bulunamadı");
                    resolve(false);
                }
            };
            script.onerror = (err) => {
                console.error("Mock veriler script'i yüklenemedi:", err);
                reject(err);
            };
            
            document.body.appendChild(script);
        });
    } catch (error) {
        console.error("Mock veri yükleme hatası:", error);
        return false;
    }
}

/**
 * Demo modunu etkinleştir
 */
function enableDemoMode() {
    console.log("Demo modu etkinleştiriliyor...");
    
    // Demo modunda olduğumuzu işaretle
    firebaseState.isDemo = true;
    window.CONFIG = window.CONFIG || {};
    window.CONFIG.isDemo = true;
    
    // URL'e demo parametresini ekle
    const currentUrl = new URL(window.location.href);
    if (!currentUrl.searchParams.has('demo')) {
        currentUrl.searchParams.set('demo', 'true');
        
        // Sayfa yeniden yüklemesi olmadan URL'i güncelle
        window.history.replaceState({}, document.title, currentUrl.toString());
    }
    
    // Mock Firebase yükle (eğer normal Firebase yüklenemezse)
    if (typeof firebase === 'undefined') {
        console.log("Mock Firebase yükleniyor...");
        loadMockFirebase();
    }
    
    // Demo modu bildirimi göster
    showDemoModeNotification();
}

/**
 * Mock Firebase yükle
 * @returns {Promise<boolean>} Başarılı mı
 */
function loadMockFirebase() {
    return new Promise((resolve, reject) => {
        const scriptElement = document.createElement('script');
        scriptElement.src = 'js/mock-firebase.js';
        scriptElement.async = true;
        
        scriptElement.onload = () => {
            console.log("Mock Firebase yüklendi");
            
            // Firebase yoksa Mock Firebase'i global firebase değişkenine ata
            if (typeof firebase === 'undefined' && typeof mockFirebase !== 'undefined') {
                window.firebase = mockFirebase;
                
                // Başlatmayı yeniden dene
                setTimeout(() => {
                    initializeFirebase()
                        .then(result => resolve(result))
                        .catch(err => reject(err));
                }, 500);
            } else {
                resolve(false);
            }
        };
        
        scriptElement.onerror = (error) => {
            console.error("Mock Firebase yüklenemedi:", error);
            reject(error);
        };
        
        document.body.appendChild(scriptElement);
    });
}

/**
 * Demo modu bildirimini göster
 */
function showDemoModeNotification() {
    const demoModeNotification = document.getElementById('demo-mode-notification');
    if (demoModeNotification) {
        demoModeNotification.style.display = 'block';
    } else {
        // Demo modu bildirimi oluştur
        setTimeout(() => {
            const container = document.createElement('div');
            container.id = 'demo-mode-notification';
            container.className = 'info-box warning';
            container.style.position = 'fixed';
            container.style.bottom = '10px';
            container.style.left = '10px';
            container.style.width = 'auto';
            container.style.zIndex = '1000';
            container.style.display = 'block';
            
            container.innerHTML = `
                <div class="info-box-title">Demo Modu</div>
                <div class="info-box-content">
                    <p>Uygulama şu anda demo modunda çalışıyor. Firebase kimlik doğrulaması atlanıyor.</p>
                    <button class="btn btn-sm btn-warning" onclick="document.getElementById('demo-mode-notification').style.display = 'none';">
                        <i class="fas fa-times"></i> Kapat
                    </button>
                </div>
            `;
            
            document.body.appendChild(container);
        }, 1000);
    }
}

/**
 * Firebase servislerine erişim sağla
 * @returns {Object} Firebase servisleri
 */
function getFirebaseServices() {
    return {
        app,
        auth,
        db,
        storage,
        functions,
        analytics,
        isDemo: firebaseState.isDemo,
        isInitialized: firebaseState.isInitialized
    };
}

/**
 * Firebase durum bilgisini al
 * @returns {Object} Firebase durum bilgisi
 */
function getFirebaseState() {
    return { ...firebaseState };
}

// Sayfa yüklendiğinde Firebase'i başlat
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Firebase'i başlatmayı dene
        const firebaseInitialized = await initializeFirebase();
        
        // App State güncelle (window.appState app.js'de oluşturulmuş olabilir)
        if (window.appState) {
            window.appState.firebaseInitialized = firebaseInitialized;
        }
        
        // InitApp fonksiyonu varsa çağır
        if (typeof initApp === 'function') {
            console.log("initApp fonksiyonu çağrılıyor...");
            initApp();
        } else {
            console.warn("initApp fonksiyonu bulunamadı.");
            
            // Oturum kontrolü için auth state değişikliklerini dinle
            if (auth) {
                auth.onAuthStateChanged(user => {
                    if (user) {
                        console.log("Kullanıcı oturum açmış:", user.email);
                        
                        // Kullanıcı bilgisini global değişkene ata
                        window.currentUser = user;
                        
                        // Ana uygulamayı göster
                        if (typeof showMainApp === 'function') {
                            showMainApp();
                        } else {
                            // Manuel olarak göster
                            const mainApp = document.getElementById('main-app');
                            const loginPage = document.getElementById('login-page');
                            
                            if (mainApp) mainApp.style.display = 'block';
                            if (loginPage) loginPage.style.display = 'none';
                        }
                        
                        // Dashboard verilerini yükle
                        if (typeof loadDashboardData === 'function') {
                            loadDashboardData();
                        }
                    } else {
                        console.log("Kullanıcı oturum açmamış");
                        
                        // Demo modunda otomatik giriş yap
                        if (firebaseState.isDemo) {
                            console.log("Demo modu için otomatik giriş yapılıyor...");
                            
                            if (typeof demoLogin === 'function') {
                                demoLogin();
                            } else {
                                // Manuel demo giriş
                                window.currentUser = {
                                    uid: 'demo-user-1',
                                    email: 'demo@elektrotrack.com',
                                    displayName: 'Demo Kullanıcı'
                                };
                                
                                // Ana uygulamayı göster
                                const mainApp = document.getElementById('main-app');
                                const loginPage = document.getElementById('login-page');
                                
                                if (mainApp) mainApp.style.display = 'block';
                                if (loginPage) loginPage.style.display = 'none';
                                
                                // Dashboard verilerini yükle
                                if (typeof loadDashboardData === 'function') {
                                    loadDashboardData();
                                }
                            }
                        } else {
                            // Login sayfasını göster
                            const mainApp = document.getElementById('main-app');
                            const loginPage = document.getElementById('login-page');
                            
                            if (mainApp) mainApp.style.display = 'none';
                            if (loginPage) loginPage.style.display = 'flex';
                        }
                    }
                });
            } else if (firebaseState.isDemo) {
                console.log("Firebase Auth yok, demo modunda doğrudan giriş yapılıyor");
                
                // Demo kullanıcısı oluştur
                window.currentUser = {
                    uid: 'demo-user-1',
                    email: 'demo@elektrotrack.com',
                    displayName: 'Demo Kullanıcı'
                };
                
                // Ana uygulamayı göster
                const mainApp = document.getElementById('main-app');
                const loginPage = document.getElementById('login-page');
                
                if (mainApp) mainApp.style.display = 'block';
                if (loginPage) loginPage.style.display = 'none';
                
                // Dashboard verilerini yükle
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            }
        }
    } catch (error) {
        console.error("Uygulama başlatma hatası:", error);
        enableDemoMode();
    }
});

// Firebase erişilemezse ya da hata oluşursa demo moda geçiş için timeout
setTimeout(() => {
    // Hala login sayfasındaysak ve demo modunda değilsek
    if (document.getElementById('login-page') && 
        document.getElementById('login-page').style.display !== 'none' && 
        !firebaseState.isDemo) {
        
        console.warn("Firebase bağlantı zaman aşımı, demo moduna geçiliyor");
        enableDemoMode();
        
        //
