const Config = require('config');
const axios = require('axios');


const kakaoInstance = axios.create({
    baseURL: "https://api.kakaowork.com",
    headers: {
        Authorization: `Bearer ${Config.keys.kakaoWork.bot}`,
    },
});

// kakaoInstance.get('/v1/users.list'); // 이 방법으로 API호출이 가능해진다.

// 유저 목록 검색
exports.getUserList = async () => {
    const res = await kakaoInstance.get('/v1/users.list');
    return res.data.users;
};

// 채팅방 생성
exports.openConversations = async ({userId}) => {
    const data = {
        user_id : userId,
    };
    const res = await kakaoInstance.post("/v1/conversations.open", data);
    return res.data.conversation;
};

// 메시지 전송
exports.sendMessage = async ({conversationId, text, blocks}) => {
    const data = {
        conversation_id: conversationId,
        text,
        ... blocks && {blocks},
    };
    
    const res = await kakaoInstance.post('/v1/messages.send', data);
    console.log(res);
    return res.data.message;
};