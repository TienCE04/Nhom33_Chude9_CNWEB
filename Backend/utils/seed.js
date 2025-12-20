const Topic = require("../models/topic");
const Room = require("../models/room");

/* ==================== TOPICS ==================== */
const DEFAULT_TOPICS = [
  { nameTopic: "Động vật", topicIcon: "cruelty_free" },
  { nameTopic: "Công nghệ", topicIcon: "laptop_mac" },
  { nameTopic: "Thiên nhiên", topicIcon: "nature" },
  { nameTopic: "Thực phẩm", topicIcon: "cookie" },
  { nameTopic: "Thể thao", topicIcon: "sports_soccer" },
  { nameTopic: "Điện ảnh", topicIcon: "videocam" },
  { nameTopic: "Âm nhạc", topicIcon: "queue_music" },
  { nameTopic: "Du lịch", topicIcon: "flight" },
  { nameTopic: "Nghệ thuật", topicIcon: "palette" },
  { nameTopic: "Trò chơi", topicIcon: "sports_esports" }
];

/* ==================== KEYWORDS ==================== */
const TOPIC_KEYWORDS = {
  "Động vật": [
    "chó", "mèo", "voi", "hổ", "sư tử", "khỉ", "gấu", "thỏ", "chuột", "ngựa",
    "bò", "lợn", "dê", "cừu", "hươu", "nai", "cá", "cá mập", "cá voi", "cá heo",
    "chim", "đại bàng", "chim sẻ", "cú", "vẹt", "rắn", "trăn", "rùa", "thằn lằn", "ếch",
    "nhện", "ong", "kiến", "bướm", "ruồi", "muỗi", "tôm", "cua", "mực", "ốc",
    "sao biển", "sứa", "cá ngựa", "báo", "linh cẩu", "chồn", "sóc", "nhím", "hà mã"
  ],

  "Công nghệ": [
    "máy tính", "laptop", "điện thoại", "tablet", "server", "cloud", "AI", "machine learning",
    "blockchain", "internet", "wifi", "bluetooth", "mạng", "phần mềm", "phần cứng",
    "CPU", "GPU", "RAM", "ổ cứng", "SSD", "USB", "API", "database", "SQL", "NoSQL",
    "backend", "frontend", "fullstack", "React", "Angular", "Vue", "NodeJS",
    "Java", "Python", "C++", "Git", "Docker", "Kubernetes", "Linux",
    "Windows", "macOS", "Android", "iOS", "debug", "deploy", "microservice"
  ],

  "Thiên nhiên": [
    "núi", "biển", "sông", "suối", "rừng", "đồi", "thung lũng", "đồng bằng",
    "sa mạc", "băng tuyết", "mưa", "nắng", "gió", "bão", "sấm", "chớp",
    "mây", "cầu vồng", "mặt trời", "mặt trăng", "sao", "vũ trụ", "đất",
    "nước", "lửa", "không khí", "động đất", "núi lửa", "sóng thần",
    "thủy triều", "sương mù", "băng", "tuyết", "rừng nhiệt đới",
    "san hô", "đại dương", "hồ", "thác nước", "hang động",
    "đồng cỏ", "đầm lầy", "khí hậu", "môi trường", "sinh thái", "thiên tai"
  ],

  "Thực phẩm": [
    "cơm", "phở", "bún", "mì", "bánh mì", "pizza", "hamburger", "sushi",
    "cá kho", "thịt nướng", "gà rán", "lẩu", "canh", "rau", "củ", "quả",
    "trái cây", "chuối", "táo", "cam", "xoài", "dưa hấu", "nho",
    "sữa", "trà", "cà phê", "nước ngọt", "bia", "rượu",
    "bánh ngọt", "kẹo", "socola", "kem", "bánh quy",
    "trứng", "sữa chua", "phô mai", "bơ",
    "gia vị", "muối", "đường", "tiêu", "ớt", "hành", "tỏi"
  ],

  "Thể thao": [
    "bóng đá", "bóng rổ", "bóng chuyền", "tennis", "cầu lông", "bơi lội",
    "chạy bộ", "điền kinh", "gym", "thể hình", "boxing", "võ thuật",
    "karate", "taekwondo", "judo", "wushu", "bóng bàn", "bi-a",
    "golf", "đua xe", "F1", "xe đạp", "leo núi", "trượt tuyết",
    "lướt sóng", "bóng chày", "bóng bầu dục", "cricket",
    "cờ vua", "eSports", "bắn cung", "đấu kiếm",
    "marathon", "thể dục dụng cụ", "yoga", "aerobic",
    "kéo co", "nhảy cao", "nhảy xa", "ném lao",
    "bóng ném", "bóng nước", "thể thao điện tử"
  ],

  "Điện ảnh": [
    "phim", "diễn viên", "đạo diễn", "kịch bản", "rạp chiếu", "máy quay",
    "hậu trường", "vai chính", "vai phụ", "phim hài",
    "phim hành động", "phim kinh dị", "phim tình cảm", "phim hoạt hình", "phim tài liệu",
    "giải Oscar", "liên hoan phim", "trailer", "poster", "bom tấn",
    "siêu anh hùng", "phản diện", "nhân vật", "cảnh quay", "kỹ xảo",
    "âm thanh", "ánh sáng", "dựng phim", "biên tập", "lồng tiếng",
    "phim 3D", "phim chiếu mạng", "phim cổ trang", "phim viễn tưởng", "phim trinh thám",
    "phim chiến tranh", "phim học đường", "phim gia đình", "phim ngắn", "phim dài",
    "điện ảnh Việt", "Hollywood", "Bollywood", "Netflix", "CGV"
  ],
  "Âm nhạc": [
    "âm nhạc", "bài hát", "ca sĩ", "nhạc sĩ", "ban nhạc", "giai điệu",
    "lời bài hát", "album", "đĩa nhạc", "buổi hòa nhạc",
    "nhạc pop", "nhạc rock", "nhạc jazz", "nhạc cổ điển", "nhạc điện tử",
    "nhạc rap", "nhạc ballad", "nhạc thiếu nhi", "nhạc dân gian", "nhạc trẻ",
    "micro", "loa", "tai nghe", "guitar", "piano",
    "trống", "violin", "sáo", "kèn", "bass",
    "phòng thu", "thu âm", "phối nhạc", "beat", "remix",
    "MV", "playlist", "bảng xếp hạng", "hit", "cover"
  ],

  "Du lịch": [
    "du lịch", "khách sạn", "nhà nghỉ", "homestay", "resort",
    "máy bay", "sân bay", "vé máy bay", "hành lý", "vali",
    "tàu hỏa", "xe khách", "xe máy", "bản đồ", "la bàn",
    "hộ chiếu", "visa", "check-in", "check-out", "tour",
    "hướng dẫn viên", "tham quan", "chụp ảnh", "check-in sống ảo", "địa danh",
    "bãi biển", "núi", "đảo", "thác nước", "hang động",
    "thành phố", "làng quê", "chợ đêm", "ẩm thực địa phương", "đặc sản",
    "leo núi", "cắm trại", "lặn biển", "du lịch bụi", "phượt",
    "kỷ niệm", "hành trình", "kỳ nghỉ", "khu du lịch", "điểm đến"
  ],
  "Nghệ thuật": [
    "nghệ thuật", "hội họa", "điêu khắc", "kiến trúc", "mỹ thuật",
    "bức tranh", "màu sắc", "cọ vẽ", "sơn dầu", "sơn nước",
    "tranh sơn mài", "tranh trừu tượng", "tranh phong cảnh", "tranh chân dung", "tranh tĩnh vật",
    "tác phẩm", "nghệ sĩ", "triển lãm", "bảo tàng", "phòng tranh",
    "sáng tạo", "ý tưởng", "cảm hứng", "thẩm mỹ", "bố cục",
    "đường nét", "hình khối", "ánh sáng", "bóng tối", "chất liệu",
    "gốm", "lụa", "gỗ", "đá", "kim loại",
    "nghệ thuật dân gian", "nghệ thuật hiện đại", "nghệ thuật cổ điển", "nghệ thuật đương đại", "trình diễn"
  ],
  "Trò chơi": [
    "trò chơi", "game", "người chơi", "nhân vật", "cấp độ",
    "nhiệm vụ", "bản đồ", "vũ khí", "kỹ năng", "điểm số",
    "thắng", "thua", "đội nhóm", "đối thủ", "chiến thuật",
    "trò chơi điện tử", "trò chơi dân gian", "cờ vua", "cờ tướng", "cờ caro",
    "xếp hình", "giải đố", "trò chơi trí tuệ", "trò chơi hành động", "trò chơi phiêu lưu",
    "trò chơi chiến thuật", "trò chơi nhập vai", "trò chơi thể thao", "trò chơi mô phỏng", "trò chơi trực tuyến",
    "máy chơi game", "tay cầm", "console", "PC", "mobile",
    "esports", "thi đấu", "giải đấu", "bảng xếp hạng", "phần thưởng"
  ]
};

/* ==================== SEED ==================== */
const seedDefaultTopics = async () => {
  try {
    console.log("🌱 Seeding default topics...");

    for (const topic of DEFAULT_TOPICS) {
      const keyWord = TOPIC_KEYWORDS[topic.nameTopic];

      const exists = await Topic.findOne({
        nameTopic: topic.nameTopic,
        createdBy: "system",
      });

      if (!exists) {
        await Topic.createTopic({
          ...topic,
          createdBy: "system",
          keyWord,
        });
        console.log(`Created topic: ${topic.nameTopic}`);
      } else {
        await Topic.updateTopic(exists.idTopic, {
          topicIcon: topic.topicIcon,
          keyWord,
        });
        console.log(`   Updated topic: ${topic.nameTopic}`);
      }
    }

    console.log("✅ Default topics seeding completed.");
  } catch (error) {
    console.error("❌ Error seeding default topics:", error);
  }
};

/* ==================== SEED ROOM ==================== */
const seedDefaultRoom = async () => {
  try {
    const ROOM_NAME = "Sảnh Chung";
    
    // 1. Tìm Topic
    const topic = await Topic.findOne({ nameTopic: "Động vật" });
    if (!topic) {
        console.log("⚠️ Chưa có topic 'Động vật', bỏ qua tạo phòng.");
        return;
    }

    // 2. Kiểm tra/Tạo trong MongoDB (Dùng biến persistentRoom xuyên suốt)
    let persistentRoom = await Room.findOne({ roomName: ROOM_NAME });
    
    if (!persistentRoom) {
      console.log("🌱 Creating persistent room in Mongo...");
      // Lưu kết quả tạo mới vào biến persistentRoom
      persistentRoom = await Room.create({
        roomName: ROOM_NAME,
        hostUser: "system",
        maxPlayer: 20,
        maxScore: 100,
        topicId: topic._id, // Lưu ID topic
        roomPass: "",
        status: "WAITING",
        room_type: "Public",
        isPlaying: false,
        currentPlayers: 0,
        round: 1,
        timePerRound: 60
      });
      console.log("✅ Created Mongo Room: Sảnh Chung");
    }

    // 3. Kiểm tra/Tái tạo trong Redis
    if (persistentRoom) {
        const roomId = persistentRoom._id.toString(); // Bây giờ biến này đã tồn tại an toàn
        const redisCheck = await Room.getRoomById(roomId);

        if (!redisCheck.success) {
            console.log("🔄 Syncing 'Sảnh Chung' to Redis...");
            await Room.createRoom({
                id: roomId, // Quan trọng: Dùng ID của Mongo
                roomName: ROOM_NAME,
                username: "system",
                hostUser: "system",
                idTopic: topic._id,
                nameTopic: topic.nameTopic,
                topicIcon: topic.topicIcon,
                maxPlayer: 20,
                maxScore: 100,
                currentPlayers: 0,
                roomPass: "",
                status: "WAITING",
                roomType: "Public",
                isPlaying: false
            });
            console.log("✅ 'Sảnh Chung' is ready in Redis!");
        } else {
            console.log("✅ 'Sảnh Chung' already exists in Redis.");
        }
    }
  } catch (error) {
    console.error("❌ Error seeding default room:", error);
  }
};

module.exports = { seedDefaultTopics, seedDefaultRoom };