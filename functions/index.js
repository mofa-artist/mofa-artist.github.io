const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const {getFirestore}=require('firebase-admin/firestore');
const {initializeApp}=require('firebase-admin/app');
initializeApp();
const GITHUB_DISPATCH_TOKEN=defineSecret('GITHUB_DISPATCH_TOKEN');
async function adminOk(ctx){if(!ctx.auth)return false;const snap=await getFirestore().doc(`admins/${ctx.auth.uid}`).get();return snap.exists && snap.data().role==='admin';}
exports.requestBuild=onCall({secrets:[GITHUB_DISPATCH_TOKEN]},async request=>{
  if(!(await adminOk(request))) throw new HttpsError('permission-denied','Admin role required.');
  const owner=process.env.GITHUB_OWNER||'mofa-artist'; const repo=process.env.GITHUB_REPO||'mofa-artist.github.io';
  const r=await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`,{method:'POST',headers:{Authorization:`Bearer ${GITHUB_DISPATCH_TOKEN.value()}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:JSON.stringify({event_type:'mofa-build',client_payload:{requestedBy:request.auth.uid}})});
  if(!r.ok)throw new HttpsError('internal','GitHub dispatch failed.');
  await getFirestore().doc('siteBuildRequests/latest').set({type:'cloud-function-dispatch',requestedBy:request.auth.uid,requestedAt:new Date().toISOString(),status:'dispatched'});
  return {ok:true};
});
