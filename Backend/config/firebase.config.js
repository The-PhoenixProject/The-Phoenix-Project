// config/firebase.config.js
const admin = require('firebase-admin');
const path = require('path');

// تحميل ملف المفاتيح من Firebase
const serviceAccount = require(path.join(__dirname, '../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
