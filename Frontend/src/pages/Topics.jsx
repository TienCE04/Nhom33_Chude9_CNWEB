import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Library, Plus, Loader, Calendar, Hash, MoreVertical, Edit, Trash2 } from "lucide-react";
import { GameButton } from "../components/GameButton";
import { topicApi } from "@/lib/api";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";
import { Dropdown } from "antd";
import { ConfirmModal } from "../components/ConfirmModal";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const MaterialIcon = ({ iconName, className = "" }) => (
  <span className={`material-symbols-rounded ${className}`}>
    {iconName}
  </span>
);

const Topics = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("system");
  const [systemTopics, setSystemTopics] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, topicId: null });

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

  const handleEditTopic = (topic, e) => {
    if (e) e.stopPropagation();
    navigate("/create/theme", { state: { topic } });
  };

  const handleDeleteTopic = (topicId, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({ isOpen: true, topicId });
  };

  const confirmDeleteTopic = async () => {
    const topicId = deleteModal.topicId;
    if (!topicId) return;

    try {
      const result = await topicApi.deleteTopic(topicId);
      if (result.success) {
        toast({
          title: t('topics.deleteSuccess'),
          variant: "success",
        });
        const updatedTopics = userTopics.filter(t => (t._id || t.idTopic) !== topicId);
        setUserTopics(updatedTopics);
        setDeleteModal({ isOpen: false, topicId: null });
      } else {
        toast({
          title: t('topics.deleteFail'),
          description: result.message,
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({
        title: t('topics.deleteErrorTitle'),
        description: t('topics.deleteErrorMessage'),
        variant: "error",
      });
    }
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
                {t('topics.createdBy')}: {topic.createdBy === user?.username ? t('topics.you') : topic.createdBy}
              </p>
            )}
          </div>
        </div>
      </div>

      {isCustom && (
        <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Số lượng từ khóa">
            <Hash className="w-4 h-4" />
            <span>{topic.keyWord?.length || 0} {t('topics.words')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Ngày tạo">
            <Calendar className="w-4 h-4" />
            <span>{topic.timeStamp ? format(new Date(topic.timeStamp), "dd/MM/yyyy") : "N/A"}</span>
          </div>
        </div>
      )}
      
      {isCustom && topic.createdBy === user?.username && (
         <div className="absolute top-2 right-2 z-10">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: t('topics.edit'),
                    icon: <Edit className="w-4 h-4" />,
                    onClick: ({ domEvent }) => handleEditTopic(topic, domEvent)
                  },
                  {
                    key: 'delete',
                    label: t('topics.delete'),
                    icon: <Trash2 className="w-4 h-4 text-danger" />,
                    danger: true,
                    onClick: ({ domEvent }) => handleDeleteTopic(topic._id || topic.idTopic, domEvent)
                  }
                ]
              }}
              trigger={['click']}
            >
              <button 
                className="p-1 rounded-full hover:bg-black/10 transition-colors bg-white/50 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-foreground/80" />
              </button>
            </Dropdown>
         </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 md:gap-0">
        <div className="flex items-center gap-3 px-4 md:px-6">
          <Library className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{t('topics.library')}</h1>
        </div>
        <GameButton
          variant="success"
          size="md"
          className="flex items-center gap-2"
          onClick={() => {
             if (user && (user.role === 'guest' || user.isGuest)) {
                 toast({
                    title: t('topics.loginRequired'),
                    description: t('topics.loginToCreate'),
                    variant: "destructive",
                 });
                 return;
             }
             navigate("/create/theme");
          }}
        >
          <Plus className="w-5 h-5" />
          {t('topics.createNew')}
        </GameButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 md:gap-4 mb-6 border-b border-border px-2 md:px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 md:px-6 py-3 font-bold text-base md:text-lg transition-all relative whitespace-nowrap ${
            activeTab === "system"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('topics.systemTopics')}
          {activeTab === "system" && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-4 md:px-6 py-3 font-bold text-base md:text-lg transition-all relative whitespace-nowrap ${
            activeTab === "custom"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('topics.myTopics')}
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
                  {t('topics.noSystemTopics')}
                </div>
              )
            ) : (
              user && (user.role === 'guest' || user.isGuest) ? (
                <div className="col-span-full flex flex-col items-center justify-center py-10 gap-4">
                  <p className="text-muted-foreground text-lg">{t('topics.loginToCreateMsg')}</p>
                  <GameButton variant="primary" onClick={() => navigate("/login")}>
                    {t('topics.loginNow')}
                  </GameButton>
                </div>
              ) : (
                userTopics.length > 0 ? (
                  userTopics.map((topic) => (
                    <TopicCard key={topic._id || topic.idTopic} topic={topic} isCustom={true} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-10 gap-4">
                    <p className="text-muted-foreground text-lg">{t('topics.noUserTopics')}</p>
                    <GameButton variant="primary" onClick={() => navigate("/create/theme")}>
                      {t('topics.createNow')}
                    </GameButton>
                  </div>
                )
              )
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, topicId: null })}
        onConfirm={confirmDeleteTopic}
        title={t('topics.deleteConfirmTitle')}
        message={t('topics.deleteConfirmMessage')}
        confirmText={t('topics.delete')}
        cancelText={t('topics.cancel')}
        variant="danger"
      />
    </div>
  );
};

export default Topics;
