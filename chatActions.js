import { getFirebaseApp } from '../firebaseHelper';
import { ref,child,push,getDatabase, update, get, set, remove } from 'firebase/database';

export const createChat = async (loggedInUserId,chatData)=>{

	const newChatData = {
		...chatData,
		createdBy: loggedInUserId,
		updatedBy:loggedInUserId,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	const app = getFirebaseApp();
	const dbRef = ref(getDatabase(app));
	const newChat = await push(child(dbRef,'chats'),newChatData);
	const chatUsers = newChatData.users;
	for (let i = 0; i < chatUsers.length; i++) {
		const userId = chatUsers[i];
		await push(child(dbRef,`userChats/${userId}`),newChat.key);
	}

	return newChat.key;
}

export const sendTextMessage = async (chatId,senderId,messageText, replyTo)=>{

	await sendMessage(chatId,senderId,messageText,null,replyTo);	
}

export const sendImage = async (chatId,senderId,imageUrl, replyTo)=>{

	await sendMessage(chatId,senderId,'Image',imageUrl,replyTo);	
}

export const updateChatData = async (chatId, userId, chatData)=>{
		const app = getFirebaseApp();
		const dbRef = ref(getDatabase(app));
		const chatRef = child(dbRef,`chats/${chatId}`);

		await update(chatRef,{
			...chatData,
			updatedAt:new Date().toISOString(),
			updatedBy:userId
		})
		
}


export const sendMessage = async (chatId,senderId,messageText,imageUrl, replyTo)=>{

	const app = getFirebaseApp();
	const dbRef = ref(getDatabase(app));
	const messageRef = child(dbRef,`messages/${chatId}`);

	const messageData = {
		sentBy : senderId,
		sentAt : new Date().toISOString(),
		text : messageText
	}

	if(replyTo){
		messageData.replyTo = replyTo;
	}

	if(imageUrl){
		messageData.imageUrl = imageUrl;
	}

	await push(messageRef,messageData);

	const chatRef = child(dbRef,`chats/${chatId}`);
	await update(chatRef,{
		updatedBy: senderId,
		updatedAt: new Date().toISOString(),
		latestMessageText: messageText
	});
}


export const starMessage= async (messageId,chatId,userId)=>{

try {
	const app = getFirebaseApp();
	const dbRef = ref(getDatabase(app));
	const childRef = child(dbRef,`userStarredMessages/${userId}/${chatId}/${messageId}`);

	const snapShot = await get(childRef);

		if(snapShot.exists()){
			//unstar
			await remove(childRef);
		}
		else{
			const starredMessage = {
				messageId,
				chatId,
				starredAt:new Date().toISOString()
			}	

			await set(childRef,starredMessage);
		}
		
	} catch (error) {
		console.log(error);	
	}
}