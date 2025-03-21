const AppConfig = {
    apiEndpoints: {
        production: '/api/production',
        purchasing: '/api/purchasing',
        orders: '/api/orders'
    },
    firebase: {
        // Firebase config
    },
    modules: {
        dashboard: true,
        production: true,
        purchasing: true,
        ai: true
    }
};

export default AppConfig;
