const { initializeApp, cert } = await import('firebase-admin/app');
const { getFirestore } = await import('firebase-admin/firestore');
if(!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required');
initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))});
const db=getFirestore();
const now=new Date(); const snap=await db.collection('scheduledPosts').where('status','==','scheduled').get(); let due=0;
for(const d of snap.docs){const x=d.data(); if(!x.publishAt)continue; if(new Date(x.publishAt)<=now){await d.ref.update({status:'published',publishedAt:now.toISOString()});due++;}}
if(due){await db.doc('siteBuildRequests/latest').set({type:'scheduled-publish',requestedAt:now.toISOString(),status:'requested',due});}
console.log(`${due} scheduled publication(s) processed.`);
