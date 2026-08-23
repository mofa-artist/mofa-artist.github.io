const { initializeApp, cert } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required');
initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))});
const db=getFirestore(); const uids=[process.env.ADMIN_UID_1,process.env.ADMIN_UID_2].filter(Boolean); if(uids.length!==2) throw new Error('Provide ADMIN_UID_1 and ADMIN_UID_2');
for(const uid of uids) await db.doc(`admins/${uid}`).set({role:'admin',updatedAt:new Date().toISOString()},{merge:true}); console.log('Seeded 2 admin UIDs.');
