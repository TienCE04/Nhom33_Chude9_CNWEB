// /service/gamePlayService.js
import * as playerRedisService from "./playerRedisService.js";
import * as Topic from "../models/topic.js"; 

export async function handler(room_id, topic_id, tmpPlayers, tmpKeywords, topic_type) {
    // người vẽ
    let drawer_username = tmpPlayers.length > 0 ? tmpPlayers[0] : null;

    if (!drawer_username) {
        // Nếu hết người vẽ tạm thời, lấy lại toàn bộ người chơi hiện tại trong phòng
        const allPlayers = await playerRedisService.getPlayersByRoomId(room_id); 
        await playerRedisService.setTmpPlayers(room_id, allPlayers);
        drawer_username = allPlayers[0];
    }

    // Chọn từ khóa
    // Lấy danh sách tất cả từ khóa từ MongoDB
    const topicData = await Topic.TopicModel.findById(topic_id).lean(); 
    let availableKeywords = topicData.keyWord.filter(kw => !tmpKeywords.includes(kw));

    // Nếu hết từ khóa tạm thời, reset danh sách từ khóa đã dùng
    if (availableKeywords.length === 0) {
        availableKeywords = topicData.keyWord;
        await playerRedisService.resetTmpKeywords(room_id); 
    }

    // Chọn ngẫu nhiên 1 từ khóa
    const keyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];

    // Cap nhật danh sách tạm thời
    // Xóa người vẽ này khỏi danh sách tạm thời
    await playerRedisService.removeTmpPlayer(room_id, drawer_username); 
    // Thêm từ khóa vào danh sách từ khóa đã dùng
    await playerRedisService.addTmpKeyword(room_id, keyword); 

    return { drawer_username, keyword };
}