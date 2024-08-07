const AppConfig = {
    APP_NAME: 'NullShip',
    CLIENT_URL: process.env.CLIENT_URL,
    ROLES: {
        1: 'ADMIN',
        2: 'USER',
        3: 'SUB_USER',
        4: 'BLOGGER'
    },
    ROUTE_PREFIX: {
        'images': '/images',
        'pdf': '/pdf',
        'auth': '/api/auth',
        'otp': '/api/otp',
        'user': '/api/user',
        'admin': '/api/admin',
        'stores': '/api/stores',
        'carriers': '/api/carriers',
        'orders': '/api/orders',
        'user_discount': '/api/user/discounts',
        'v1': '/api/v1',
        INTEGRATIONS: {
            'shopify': '/api/integration/shopify',
            'ebay': '/api/integration/ebay',
            'walmart': '/api/integration/walmart',
            'sellercloud': '/api/integration/sellercloud',
            'shipstation': '/api/integration/shipstation',
            'zenventory': '/api/integration/zenventory',
        }
    }
}

module.exports = AppConfig;