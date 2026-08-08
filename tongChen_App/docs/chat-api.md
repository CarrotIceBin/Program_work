# 聊天功能接口文档

> 基础地址：`http://47.106.118.22:8081`
> 请求方式：`POST`
> Content-Type：`application/json`
> Headers：`rangeID: 1`、`projectName: beizen`
> 响应 code 为字符串类型，`"0"` 表示成功
> 分页参数 `pg` 统一规则：`"0"` 为第一页，`"1"` 为第二页，依此类推

---

## 一、会话管理

### 1.1 获取会话列表

**接口：** `chatListClient`

**请求参数：**
```json
{
    "token": "用户token",
    "pg": "0",
    "typeId": "1"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| pg | string | 是 | 页码，从 "0" 开始 |
| typeId | string | 是 | 会话类型（1=聊天消息、2=访客记录、3=系统通知） |

**响应示例：**
```json
{
    "code": "0",
    "msg": "成功",
    "success": true,
    "chatList": {
        "datas": [
            {
                "chatID": "1001",
                "targetUserID": "user_002",
                "targetUserName": "小红",
                "targetUserAvatar": "http://47.106.118.22:8081/upload/avatar/002.jpg",
                "lastMsg": "你好，在吗？",
                "lastMsgType": "1",
                "lastTime": "2026-08-04 15:30:00",
                "unreadCount": "3",
                "isOnline": "1",
                "isTop": "0",
                "isMute": "0"
            }
        ],
        "pgInfo": {
            "cur_pg": "1",
            "next_pg": "0",
            "per_num": "20",
            "total_num": "1",
            "total_pg": "1"
        }
    }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| chatID | string | 会话ID |
| targetUserID | string | 对方用户ID |
| targetUserName | string | 对方昵称 |
| targetUserAvatar | string | 对方头像URL |
| lastMsg | string | 最后一条消息内容 |
| lastMsgType | string | 最后一条消息类型（1文本/2图片/3语音/4视频/5商品） |
| lastTime | string | 最后消息时间 |
| unreadCount | string | 未读消息数 |
| isOnline | string | 对方在线状态（1在线/0离线） |
| isTop | string | 是否置顶（1是/0否） |
| isMute | string | 是否免打扰（1是/0否） |

---

### 1.2 创建会话

**接口：** `chatCreateClient`

**说明：** 用户从交友列表点击"打招呼"时调用，获取或创建与目标用户的会话ID。

**请求参数：**
```json
{
    "token": "用户token",
    "targetUserID": "user_002"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| targetUserID | string | 是 | 对方用户ID |

**响应示例：**
```json
{
    "code": "0",
    "msg": "成功",
    "success": true,
    "chatInfo": {
        "chatID": "1001",
        "targetUserID": "user_002",
        "targetUserName": "小红",
        "targetUserAvatar": "http://47.106.118.22:8081/upload/avatar/002.jpg",
        "isExisted": "1"
    }
}
```

| 字段 | 说明 |
|------|------|
| chatID | 会话ID（新创建或已有的） |
| isExisted | "1"=会话已存在，"0"=新建会话 |

**说明：** 若已有会话则返回已有 `chatID`，否则新建并返回。前端可缓存 `chatID` 避免重复调用。

---

### 1.3 删除会话

**接口：** `chatDeleteClient`

**请求参数：**
```json
{
    "token": "用户token",
    "chatID": "1001",
    "targetUserID": "user_002"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| chatID | string | 是 | 会话ID |
| targetUserID | string | 是 | 对方用户ID（用于权限校验） |

**响应示例：**
```json
{
    "code": "0",
    "msg": "删除成功",
    "success": true,
    "data": ""
}
```

**说明：** 仅删除当前用户视角的会话，对方会话不受影响。

---

### 1.4 标记会话已读

**接口：** `chatReadClient`

**请求参数：**
```json
{
    "token": "用户token",
    "chatID": "1001"
}
```

**响应示例：**
```json
{
    "code": "0",
    "msg": "操作成功",
    "success": true,
    "data": ""
}
```

**说明：** 调用后将会话的 `unreadCount` 清零，并将该会话所有消息标记为已读。

---

### 1.5 置顶/取消置顶会话

**接口：** `chatTopClient`

**请求参数：**
```json
{
    "token": "用户token",
    "chatID": "1001",
    "isTop": "1"
}
```

| 参数 | 说明 |
|------|------|
| isTop | "1"=置顶，"0"=取消置顶 |

---

### 1.6 免打扰设置

**接口：** `chatMuteClient`

**请求参数：**
```json
{
    "token": "用户token",
    "chatID": "1001",
    "isMute": "1"
}
```

| 参数 | 说明 |
|------|------|
| isMute | "1"=开启免打扰，"0"=关闭 |

---

## 二、消息管理

### 2.1 获取历史消息

**接口：** `chatMsgListClient`

**请求参数：**
```json
{
    "token": "用户token",
    "chatID": "1001",
    "pg": "0"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| chatID | string | 是 | 会话ID |
| pg | string | 是 | 页码，从 "0" 开始 |

**响应示例：**
```json
{
    "code": "0",
    "msg": "成功",
    "success": true,
    "msgList": {
        "datas": [
            {
                "msgID": "m_001",
                "chatID": "1001",
                "fromUserID": "user_002",
                "toUserID": "user_001",
                "msgType": "1",
                "content": "你好，在吗？",
                "sendTime": "2026-08-04 15:30:00",
                "isRead": "1",
                "isRecalled": "0"
            },
            {
                "msgID": "m_002",
                "chatID": "1001",
                "fromUserID": "user_001",
                "toUserID": "user_002",
                "msgType": "1",
                "content": "在的，有什么事？",
                "sendTime": "2026-08-04 15:31:00",
                "isRead": "1",
                "isRecalled": "0"
            }
        ],
        "pgInfo": {
            "cur_pg": "1",
            "next_pg": "0",
            "per_num": "20",
            "total_num": "2",
            "total_pg": "1"
        }
    }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| msgID | string | 消息ID |
| chatID | string | 会话ID |
| fromUserID | string | 发送者ID |
| toUserID | string | 接收者ID |
| msgType | string | 消息类型（见下方类型表） |
| content | string | 消息内容 |
| sendTime | string | 发送时间（格式：yyyy-MM-dd HH:mm:ss） |
| isRead | string | 是否已读（1已读/0未读） |
| isRecalled | string | 是否已撤回（1已撤回/0正常） |

**消息类型说明：**

| msgType | 类型 | content 内容 |
|---------|------|--------------|
| 1 | 文本 | 文本内容 |
| 2 | 图片 | 图片URL |
| 3 | 语音 | 语音文件URL + 时长（格式：`url|duration`） |
| 4 | 视频 | 视频URL + 封面URL（格式：`videoUrl|coverUrl`） |
| 5 | 商品卡片 | 商品ID（前端通过ID调商品详情接口） |
| 6 | 系统消息 | 系统提示文本 |

---

### 2.2 发送消息

**接口：** `chatSendClient`

**请求参数：**
```json
{
    "token": "用户token",
    "chatID": "1001",
    "toUserID": "user_002",
    "msgType": "1",
    "content": "你好，在吗？"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 发送者token |
| chatID | string | 否 | 会话ID。已有会话时必填；新会话可不传，后端自动创建 |
| toUserID | string | 是 | 接收者用户ID |
| msgType | string | 是 | 消息类型（见 2.1 类型表） |
| content | string | 是 | 消息内容 |

**响应示例：**
```json
{
    "code": "0",
    "msg": "发送成功",
    "success": true,
    "msgInfo": {
        "msgID": "m_003",
        "chatID": "1001",
        "fromUserID": "user_001",
        "toUserID": "user_002",
        "msgType": "1",
        "content": "你好，在吗？",
        "sendTime": "2026-08-04 15:32:00",
        "isRead": "0",
        "isRecalled": "0"
    }
}
```

**说明：**
- 发送成功后返回完整消息对象，前端用于渲染
- 若 `chatID` 为空，后端自动创建新会话并在 `msgInfo.chatID` 中返回新生成的 `chatID`
- 前端应缓存返回的 `chatID`，后续消息发送时传入
- 若接收者在线，后端应通过 WebSocket 实时推送（见第四节）
- 若接收者离线，后端应存入离线消息表，并可通过 UniPush 推送通知

---

### 2.3 撤回消息

**接口：** `chatRecallClient`

**请求参数：**
```json
{
    "token": "用户token",
    "msgID": "m_003",
    "chatID": "1001"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| msgID | string | 是 | 消息ID |
| chatID | string | 是 | 会话ID（用于权限校验，确认消息属于该用户的会话） |

**响应示例：**
```json
{
    "code": "0",
    "msg": "撤回成功",
    "success": true,
    "data": ""
}
```

**说明：**
- 仅允许撤回 2 分钟内发送的消息
- 后端需校验 `msgID` 属于 `chatID` 对应的会话，且发送者是当前用户
- 撤回后通过 WebSocket 推送 `recall_msg` 通知对方（见 4.3.2）

---

### 2.4 删除消息

**接口：** `chatMsgDeleteClient`

**请求参数：**
```json
{
    "token": "用户token",
    "msgID": "m_003",
    "chatID": "1001"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| msgID | string | 是 | 消息ID |
| chatID | string | 是 | 会话ID（用于权限校验） |

**说明：** 仅删除当前用户视角的消息，对方仍可见。

---

### 2.5 文件上传

**接口：** `chatFileUploadClient`

**说明：** 上传图片/语音/视频文件，返回URL后通过 `chatSendClient` 发送消息。

**请求参数：**

使用 `multipart/form-data` 格式上传：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| file | file | 是 | 文件流 |
| fileType | string | 是 | 文件类型（1=图片、2=语音、3=视频） |

**响应示例：**
```json
{
    "code": "0",
    "msg": "上传成功",
    "success": true,
    "fileInfo": {
        "fileUrl": "http://47.106.118.22:8081/upload/chat/img_20260804_153200.jpg",
        "fileType": "1",
        "fileSize": "102400"
    }
}
```

**说明：**
- 图片支持 jpg/png/gif，最大 5MB
- 语音支持 amr/mp3，最大 2MB，时长限制 60 秒
- 视频支持 mp4，最大 20MB，时长限制 60 秒
- 上传成功后，将 `fileUrl` 作为 `content` 传入 `chatSendClient`

---

## 三、未读消息统计

### 3.1 获取总未读数

**接口：** `chatUnreadClient`

**请求参数：**
```json
{
    "token": "用户token"
}
```

**响应示例：**
```json
{
    "code": "0",
    "msg": "成功",
    "success": true,
    "unreadInfo": {
        "totalUnread": "5",
        "chatUnread": [
            {
                "chatID": "1001",
                "unreadCount": "3"
            },
            {
                "chatID": "1002",
                "unreadCount": "2"
            }
        ]
    }
}
```

**用途：** 前端用于底部导航栏消息红点显示。

---

### 3.2 轮询接口（无 WebSocket 时的备选方案）

**接口：** `chatPollClient`

**请求参数：**
```json
{
    "token": "用户token",
    "lastMsgTime": "2026-08-04 15:30:00",
    "chatID": ""
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| lastMsgTime | string | 是 | 前端记录的最后一条消息时间，返回此时间之后的新消息 |
| chatID | string | 否 | 指定会话ID。不传则返回所有会话的新消息 |

**响应示例：**
```json
{
    "code": "0",
    "msg": "成功",
    "success": true,
    "newMsgs": [
        {
            "msgID": "m_004",
            "chatID": "1001",
            "fromUserID": "user_002",
            "toUserID": "user_001",
            "msgType": "1",
            "content": "好的，明天见",
            "sendTime": "2026-08-04 15:35:00",
            "isRead": "0",
            "isRecalled": "0"
        }
    ],
    "unreadTotal": "3"
}
```

**说明：** 前端每 3-5 秒轮询一次。建议优先使用 WebSocket，轮询作为降级方案。

---

## 四、WebSocket 实时通信

### 4.1 连接地址

```
ws://47.106.118.22:8081/ws/chat?token=用户token&userID=user_001
```

| 参数 | 说明 |
|------|------|
| token | 用户登录令牌 |
| userID | 当前用户ID（方便后端直接绑定，无需从 token 解析） |

### 4.2 连接流程

1. 用户打开 App 或进入聊天页面时建立 WebSocket 连接
2. 连接成功后发送上线消息
3. 后端将 userID 与 WebSocket 连接绑定（存 Redis）
4. 后端检查离线消息，推送 `offline_msg` 通知
5. 收到消息时通过 WebSocket 推送给在线用户
6. 用户退出 App 或关闭页面时断开连接

### 4.3 消息格式

所有 WebSocket 消息均使用 JSON 格式。

#### 4.3.1 客户端 → 服务端

**上线通知：**
```json
{
    "type": "online",
    "userID": "user_001"
}
```

**心跳保活（每 30 秒一次）：**
```json
{
    "type": "ping"
}
```

**输入状态通知（可选）：**
```json
{
    "type": "typing",
    "toUserID": "user_002",
    "isTyping": true
}
```

#### 4.3.2 服务端 → 客户端

**心跳响应：**
```json
{
    "type": "pong"
}
```

**离线消息通知（上线时推送）：**
```json
{
    "type": "offline_msg",
    "totalUnread": "5",
    "chatCount": "2"
}
```

| 字段 | 说明 |
|------|------|
| totalUnread | 离线期间总未读消息数 |
| chatCount | 有新消息的会话数 |

**说明：** 收到此通知后，前端应调用 `chatListClient` 刷新会话列表，或调用 `chatUnreadClient` 更新红点。

**新消息推送：**
```json
{
    "type": "new_msg",
    "msgInfo": {
        "msgID": "m_005",
        "chatID": "1001",
        "fromUserID": "user_002",
        "toUserID": "user_001",
        "msgType": "1",
        "content": "新消息内容",
        "sendTime": "2026-08-04 15:40:00",
        "isRead": "0",
        "isRecalled": "0"
    }
}
```

**消息撤回通知：**
```json
{
    "type": "recall_msg",
    "msgID": "m_005",
    "chatID": "1001"
}
```

**输入状态推送（可选）：**
```json
{
    "type": "typing",
    "fromUserID": "user_002",
    "isTyping": true
}
```

**未读数更新：**
```json
{
    "type": "unread_update",
    "totalUnread": "3"
}
```

---

## 五、用户状态

### 5.1 查询用户在线状态

**接口：** `userOnlineClient`

**请求参数：**
```json
{
    "token": "用户token",
    "userIDs": "user_002,user_003"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| token | string | 是 | 用户登录令牌 |
| userIDs | string | 是 | 目标用户ID列表，多个用英文逗号分隔 |

**响应示例：**
```json
{
    "code": "0",
    "msg": "成功",
    "success": true,
    "onlineList": [
        {
            "userID": "user_002",
            "isOnline": "1",
            "lastLoginTime": "2026-08-04 15:30:00"
        },
        {
            "userID": "user_003",
            "isOnline": "0",
            "lastLoginTime": "2026-08-04 10:00:00"
        }
    ]
}
```

**用途：** 批量查询会话列表中对方的在线状态。

---

## 六、数据库表设计参考

### 6.1 会话表 `chat_list`

| 字段 | 类型 | 说明 |
|------|------|------|
| chatID | varchar(32) | 会话ID（主键） |
| userID | varchar(32) | 当前用户ID |
| targetUserID | varchar(32) | 对方用户ID |
| typeId | varchar(2) | 会话类型（1=聊天消息、2=访客记录、3=系统通知） |
| lastMsg | text | 最后一条消息内容 |
| lastMsgType | varchar(2) | 最后消息类型 |
| lastTime | datetime | 最后消息时间 |
| unreadCount | int | 未读消息数 |
| isTop | tinyint | 是否置顶 |
| isMute | tinyint | 是否免打扰 |
| status | tinyint | 状态（1正常/0已删除） |
| inputTime | datetime | 创建时间 |

**说明：** 每对用户生成两条记录（A→B 和 B→A），通过 `userID + targetUserID` 联合查询。

### 6.2 消息表 `chat_msg`

| 字段 | 类型 | 说明 |
|------|------|------|
| msgID | varchar(32) | 消息ID（主键） |
| chatID | varchar(32) | 会话ID |
| fromUserID | varchar(32) | 发送者ID |
| toUserID | varchar(32) | 接收者ID |
| msgType | varchar(2) | 消息类型 |
| content | text | 消息内容 |
| sendTime | datetime | 发送时间 |
| isRead | tinyint | 是否已读 |
| isRecalled | tinyint | 是否已撤回 |
| inputTime | datetime | 创建时间 |

### 6.3 离线消息表 `chat_offline_msg`（可选）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 自增主键 |
| userID | varchar(32) | 离线用户ID |
| msgID | varchar(32) | 消息ID |
| createTime | datetime | 创建时间 |

---

## 七、Redis 缓存设计

### 7.1 在线状态

```
key: online:user:{userID}
value: 1
TTL: 60秒（客户端每 30 秒发送心跳续期）
```

### 7.2 WebSocket 连接映射

```
key: ws:user:{userID}
value: connectionId
```

### 7.3 未读消息数缓存

```
key: unread:user:{userID}
value: 总未读数
TTL: 无（持久化）
```

---

## 八、接口调用流程

### 8.1 进入会话列表页

```
1. 调用 chatListClient 获取会话列表
2. 建立 WebSocket 连接
3. 收到 offline_msg 时刷新会话列表和红点
4. 每次收到 new_msg 推送时，更新对应会话的 lastMsg 和 unreadCount
5. 收到 unread_update 时更新底部导航栏红点
```

### 8.2 从交友列表发起聊天

```
1. 调用 chatCreateClient 创建或获取会话（得到 chatID）
2. 跳转到聊天页面，传入 chatID
3. 调用 chatMsgListClient 获取历史消息
4. 调用 chatReadClient 标记已读
5. 发送消息时调用 chatSendClient（传入 chatID）
```

### 8.3 进入聊天窗口

```
1. 调用 chatMsgListClient 获取历史消息
2. 调用 chatReadClient 标记已读
3. 发送消息时调用 chatSendClient
4. 监听 WebSocket 的 new_msg 接收实时消息
5. 收到 recall_msg 时更新消息状态为"已撤回"
```

### 8.4 退出聊天窗口

```
1. 保持 WebSocket 连接（App 在前台时）
2. 收到新消息时更新会话列表的 lastMsg 和 unreadCount
```

### 8.5 App 退出

```
1. 断开 WebSocket 连接
2. 后端检测连接断开后，清除 Redis 中的在线状态
3. 后续消息存入数据库，用户下次上线时通过 chatListClient 获取
```

---

## 九、错误码说明

| code | 说明 |
|------|------|
| "0" | 成功 |
| "1" | 参数错误 |
| "2" | token无效或已过期 |
| "3" | 权限不足 |
| "4" | 目标用户不存在 |
| "5" | 消息内容违规 |
| "6" | 文件大小超限 |
| "7" | 文件格式不支持 |
| "8" | 撤回超时（超过2分钟） |
| "9" | 消息不存在 |
| "11" | 业务逻辑错误（详见 msg 字段） |

---

## 十、安全要求

1. **Token 校验**：所有接口必须校验 token 有效性
2. **消息加密**：建议消息内容使用 AES 加密传输
3. **频率限制**：发送消息接口限制每秒最多 5 条
4. **内容过滤**：对文本消息进行敏感词过滤
5. **文件上传**：图片/语音/视频通过 `chatFileUploadClient` 上传，聊天接口只传 URL
6. **权限校验**：撤回/删除消息时校验 `chatID` 与 `msgID` 的归属关系
7. **文件校验**：上传文件需校验类型和大小（见 2.5 说明）

---

## 十一、接口清单汇总

| 序号 | 接口名 | 用途 | 必填参数 |
|------|--------|------|----------|
| 1.1 | chatListClient | 获取会话列表 | token, pg, typeId |
| 1.2 | chatCreateClient | 创建/获取会话 | token, targetUserID |
| 1.3 | chatDeleteClient | 删除会话 | token, chatID, targetUserID |
| 1.4 | chatReadClient | 标记已读 | token, chatID |
| 1.5 | chatTopClient | 置顶设置 | token, chatID, isTop |
| 1.6 | chatMuteClient | 免打扰设置 | token, chatID, isMute |
| 2.1 | chatMsgListClient | 历史消息 | token, chatID, pg |
| 2.2 | chatSendClient | 发送消息 | token, toUserID, msgType, content |
| 2.3 | chatRecallClient | 撤回消息 | token, msgID, chatID |
| 2.4 | chatMsgDeleteClient | 删除消息 | token, msgID, chatID |
| 2.5 | chatFileUploadClient | 文件上传 | token, file, fileType |
| 3.1 | chatUnreadClient | 总未读数 | token |
| 3.2 | chatPollClient | 轮询新消息 | token, lastMsgTime |
| 5.1 | userOnlineClient | 在线状态 | token, userIDs |
| - | WebSocket | 实时通信 | token, userID（URL参数） |
