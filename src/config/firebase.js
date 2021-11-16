const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

const serviceAccount = require('./food-delivery-26eb2-firebase-adminsdk-2qyqi-1098df74b5.json');

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});


const uploadImageToStorage = async (path, destination) => {
    const bucket = getStorage().bucket();

    const result = await bucket.upload(path, { destination, });

    return result[0].name;
};

const deleteImage = async (filename) => {
    await getStorage().bucket().file(filename).delete();
};

module.exports = {
    uploadImageToStorage,
    deleteImage,
};
