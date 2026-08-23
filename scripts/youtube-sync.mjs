import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const API_KEY=process.env.YOUTUBE_API_KEY;
const CHANNEL_ID='UC9uS0YlUrGT3jzyd-iylO_A';
if(!API_KEY) throw new Error('YOUTUBE_API_KEY is required');
async function api(endpoint,params){const u=new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);for(const [k,v] of Object.entries({...params,key:API_KEY}))u.searchParams.set(k,v);const r=await fetch(u);if(!r.ok)throw new Error(`${endpoint}: ${r.status} ${await r.text()}`);return r.json();}
const channel=await api('channels',{part:'snippet,contentDetails,statistics',id:CHANNEL_ID});
if(!channel.items?.[0])throw new Error('Channel not found');
const c=channel.items[0]; const uploadPlaylistId=c.contentDetails.relatedPlaylists.uploads;
let pageToken=''; const ids=[];
do{const pl=await api('playlistItems',{part:'snippet,contentDetails',playlistId:uploadPlaylistId,maxResults:50,pageToken});for(const it of pl.items||[]){const id=it.contentDetails.videoId;if(id)ids.push(id);}pageToken=pl.nextPageToken||'';}while(pageToken);
const videos=[];for(let i=0;i<ids.length;i+=50){const batch=ids.slice(i,i+50);const v=await api('videos',{part:'snippet,contentDetails,statistics',id:batch.join(',')});for(const x of v.items||[]){videos.push({videoId:x.id,title:x.snippet.title,publishedAt:x.snippet.publishedAt,thumbnail:x.snippet.thumbnails?.high?.url||x.snippet.thumbnails?.medium?.url||x.snippet.thumbnails?.default?.url||'',viewCount:Number(x.statistics?.viewCount||0),likeCount:x.statistics?.likeCount!=null?Number(x.statistics.likeCount):null,commentCount:x.statistics?.commentCount!=null?Number(x.statistics.commentCount):null,duration:x.contentDetails?.duration||null,channelId:x.snippet.channelId});}}
const file={channelId:CHANNEL_ID,syncedAt:new Date().toISOString(),channel:{channelId:CHANNEL_ID,title:c.snippet.title,description:c.snippet.description,thumbnail:c.snippet.thumbnails?.high?.url||c.snippet.thumbnails?.default?.url||'',subscriberCount:Number(c.statistics?.subscriberCount||0),viewCount:Number(c.statistics?.viewCount||0),videoCount:Number(c.statistics?.videoCount||0)},videos:videos.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)),history:[]};
const out=path.join(root,'data/youtube-stats.json');let old={};if(fs.existsSync(out))old=JSON.parse(fs.readFileSync(out,'utf8'));file.history=Array.isArray(old.history)?old.history:[];file.history.push({date:new Date().toISOString().slice(0,10),views:videos.reduce((a,v)=>a+Number(v.viewCount||0),0),likes:videos.reduce((a,v)=>a+Number(v.likeCount||0),0),comments:videos.reduce((a,v)=>a+Number(v.commentCount||0),0)});file.history=file.history.slice(-365);fs.writeFileSync(out,JSON.stringify(file,null,2));
if(process.env.FIREBASE_SERVICE_ACCOUNT_JSON){const {initializeApp,cert}=await import('firebase-admin/app');const {getFirestore}=await import('firebase-admin/firestore');initializeApp({credential:cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))});await getFirestore().doc('youtubeStats/public').set(file);}
console.log(`Synced ${videos.length} videos.`);
