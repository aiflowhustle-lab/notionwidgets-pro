// Quick test to check Firestore connection and rules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA4W5voLoJOwry7dnkfWRABXtTIyiWodRo",
  authDomain: "content-widget-3b738.firebaseapp.com",
  projectId: "content-widget-3b738",
  storageBucket: "content-widget-3b738.firebasestorage.app",
  messagingSenderId: "147870041291",
  appId: "1:147870041291:web:dcc27abec20191c17b874e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to add a test document
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello Firestore!',
      timestamp: serverTimestamp()
    });
    
    console.log('✅ Firestore connection successful!');
    console.log('Document ID:', docRef.id);
    
  } catch (error) {
    console.error('❌ Firestore error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

testFirestore();
