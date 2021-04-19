const express = require('express');
const router = express.Router();

const libKakaoWork= require('../libs/kakaoWork');

router.get('/', async (req, res, next) => {
    // 유저 목록 검색(1)
    
    const users = await libKakaoWork.getUserList();

    // 검색된 모든 유저에게 각각 채팅방 생성
    const conversations = await Promise.all(
        users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
    );
    
    // 생성된 채팅방에 메세지 전송
    const messages = await Promise.all([
        conversations.map((conversation) => libKakaoWork.sendMessage({
            conversationId: conversation.id,
            text: '설문조사 이벤트',
            blocks: [

            {
              "type": "header",
              "text": "설문 조사 당첨을 축하합니다 ㅎㅎ",
              "style": "blue"
            },
            {
              "type": "text",
              "text": "당신에게 주어지는 행운의 기회!\n당장 설문에 참여하여 놀라운 기회를 가져가세요!",
              "markdown": true
            },
            {
              "type": "button",
              "action_type": "call_modal",
              "text": "설문하러가기",
              "value": "cafe_survey",
              "style": "default"
            }
        ] // 블록 끝
     }
))
    ]);
    console.log(messages);
    res.json({
        users,
        conversations,
        messages,
    });
});


router.post('/request', async (req, res, next) => {
    const {message, value} = req.body;
    
    switch (value) {
        case 'cafe_survey':
            // 설문조사용 모달 전송
            return res.json({
                view: {
                  "title": "modal title",
                  "accept": "확인",
                  "decline": "취소",
                  "value": "cafe_survey_results",
                  "blocks": [
                    {
                      "type": "label",
                      "text": "당신의 점수는!",
                      "markdown": true
                    },
                    {
                      "type": "select",
                      "name": "rating",
                      "options": [
                        {
                          "text": "1점",
                          "value": "1"
                        },
                        {
                          "text": "2점",
                          "value": "2"
                        },
                        {
                          "text": "3점",
                          "value": "3"
                        },
                        {
                          "text": "4점",
                          "value": "4"
                        },
                        {
                          "text": "5점",
                          "value": "5"
                        },
                      ],
                      "required": true,
                      "placeholder": "당신의 식당 점수는!"
                    }
                  ]
                }
            }); // return 종료
            break;
        default:
    } //switch 종료
    
    res.json({});
})


router.post('/callback', async (req, res, next) => {
    const {message, actions, action_type, value} = req.body;
    
    switch(value){
        case 'cafe_survey_results':
            await libKakaoWork.sendMessage({
                conversationId: message.conversation_id,
                 "text": "Thanks",
                  "blocks": [
                    {
                      "type": "header",
                      "text": "감사합니다!",
                      "style": "blue"
                    },
                    {
                      "type": "text",
                      "text": "설문조사에 응해주셔서 감사합니다!\n\n답변 내용",
                      "markdown": true
                    },
                    {
                      "type": "description",
                      "term": "점수",
                      "content": {
                        "type": "text",
                        "text": actions.rating,
                        "markdown": false
                      },
                      "accent": true
                    }
                  ]
            });
            
            break;
            
        default:
    }
    
    res.json({result: "success"});
});

module.exports = router;