import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Library, Plus, Loader, Calendar, Hash } from "lucide-react";
import { GameButton } from "../components/GameButton";
import { topicApi } from "@/lib/api";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";

const MaterialIcon = ({ iconName, className = "" }) => (
  <span className={`material-symbols-rounded ${className}`}>
    {iconName}
  </span>
);

const Topics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("system");
  const [systemTopics, setSystemTopics] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        // Fetch default topics
        const defaultTopicsRes = await topicApi.getDefaultTopics();
        if (defaultTopicsRes.success) {
          setSystemTopics(defaultTopicsRes.data);
        }

        // Fetch user topics if logged in
        if (user && user.username) {
          const userTopicsRes = await topicApi.getUserTopics(user.username);
          if (userTopicsRes.success) {
            setUserTopics(userTopicsRes.data);
          }
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [user]);

  const handleEditTopic = (topic) => {
    navigate("/create/theme", { state: { topic } });
  };

  const TopicCard = ({ topic, isCustom }) => (
    <div className="bg-card border-2 border-border rounded-xl p-4 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 group relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <MaterialIcon
              iconName={topic.topicIcon || "category"}
              className="text-2xl"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground line-clamp-1">{topic.nameTopic}</h3>
            {isCustom && (
              <p className="text-xs text-muted-foreground">
                Tạo bởi: {topic.createdBy === user?.username ? "Bạn" : topic.createdBy}
              </p>
            )}
          </div>
        </div>
      </div>

      {isCustom && (
        <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Số lượng từ khóa">
            <Hash className="w-4 h-4" />
            <span>{topic.keyWord?.length || 0} từ</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Ngày tạo">
            <Calendar className="w-4 h-4" />
            <span>{topic.timeStamp ? format(new Date(topic.timeStamp), "dd/MM/yyyy") : "N/A"}</span>
          </div>
        </div>
      )}
      
      {isCustom && topic.createdBy === user?.username && (
         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <GameButton 
                variant="secondary" 
                size="sm" 
                onClick={() => handleEditTopic(topic)}
                className="px-3 py-1 text-xs"
            >
                Sửa
            </GameButton>
         </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 px-6">
          <Library className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold text-foreground">Thư viện chủ đề</h1>
        </div>
        <GameButton
          variant="success"
          size="md"
          className="flex items-center gap-2"
          onClick={() => navigate("/create/theme")}
        >
          <Plus className="w-5 h-5" />
          Tạo chủ đề mới
        </GameButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border px-4">
        <button
          onClick={() => setActiveTab("system")}
          className={`px-6 py-3 font-bold text-lg transition-all relative ${
            activeTab === "system"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Chủ đề hệ thống
          {activeTab === "system" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-6 py-3 font-bold text-lg transition-all relative ${
            activeTab === "custom"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Chủ đề của tôi
          {activeTab === "custom" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
            {activeTab === "system" ? (
              systemTopics.length > 0 ? (
                systemTopics.map((topic) => (
                  <TopicCard key={topic._id || topic.idTopic} topic={topic} isCustom={false} />
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  Không có chủ đề hệ thống nào.
                </div>
              )
            ) : (
              userTopics.length > 0 ? (
                userTopics.map((topic) => (
                  <TopicCard key={topic._id || topic.idTopic} topic={topic} isCustom={true} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-10 gap-4">
                  <p className="text-muted-foreground text-lg">Bạn chưa tạo chủ đề nào.</p>
                  <GameButton variant="primary" onClick={() => navigate("/create/theme")}>
                    Tạo ngay
                  </GameButton>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topics;
