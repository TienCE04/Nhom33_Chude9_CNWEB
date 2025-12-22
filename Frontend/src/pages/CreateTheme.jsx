import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Palette, X } from "lucide-react";
import { GameButton } from "../components/GameButton";
import { Input } from "antd";
import { topicApi } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const CreateTheme = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const editingTopic = location.state?.topic;
  
  const { user } = useAuth();
  const [themeName, setThemeName] = useState(editingTopic?.nameTopic || "");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState(editingTopic?.keyWord || []);
  const [duplicateMessage, setDuplicateMessage] = useState("");

  const handleAddKeyword = (e) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
        setKeywordInput("");
        setDuplicateMessage("");
      } else {
        setDuplicateMessage(t('createTheme.duplicateKeyword'));
        setTimeout(() => setDuplicateMessage(""), 3000);
      }
    }
  };

  const isDuplicate =
    keywordInput.trim() && keywords.includes(keywordInput.trim());

  const handleRemoveKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleCreateTheme = async () => {
    if (!themeName.trim()) {
      toast({
        title: t('createTheme.missingNameTitle'),
        description: t('createTheme.missingNameDesc'),
        variant: "error",
      });
      return;
    }
    if (keywords.length < 20) {
      toast({
        title: t('createTheme.notEnoughKeywordsTitle'),
        description: t('createTheme.notEnoughKeywordsDesc'),
        variant: "error",
      });
      return;
    }
    
    try {
      let result;
      if (editingTopic) {
        result = await topicApi.updateTopic(editingTopic._id || editingTopic.idTopic, {
          nameTopic: themeName,
          keyWord: keywords,
        });
      } else {
        result = await topicApi.createTopic({
          nameTopic: themeName,
          keyWord: keywords,
          createdBy: user?.username || "system",
          topicIcon: "extension"
        });
      }

      if (result.success) {
        toast({
          title: editingTopic ? t('createTheme.updateSuccess') : t('createTheme.createSuccess'),
          variant: "success",
        });
        navigate("/create/room");
      } else {
        toast({
          title: editingTopic ? t('createTheme.updateFail') : t('createTheme.createFail'),
          description: result.message,
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        title: t('createTheme.errorTitle'),
        description: t('createTheme.errorDesc'),
        variant: "error",
      });
    }
  };

  return (
    <div className="p-4 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
        <div className="flex items-center gap-3 px-4 md:px-6">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-extrabold">{editingTopic ? t('createTheme.editTitle') : t('createTheme.title')}</h1>
        </div>
        <GameButton variant="secondary" size="md" onClick={() => navigate("/create/room")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('createTheme.back')}
        </GameButton>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 sm:h-0">
        {/* Left Column - Theme Configuration (1/3 width) */}
        <div className="sm:col-span-1 bg-card game-card flex flex-col min-h-0">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {t('createTheme.configTitle')}
          </h2>

          {/* Theme Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('createTheme.themeName')}
            </label>
            <Input
              placeholder={t('createTheme.themeNamePlaceholder')}
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="h-[45px]"
            />
          </div>

          {/* Keyword Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('createTheme.keywords')}
            </label>
            <Input
              placeholder={t('createTheme.keywordsPlaceholder')}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={handleAddKeyword}
              className={`h-[45px] ${
                isDuplicate ? "!border-[2px] !border-danger" : ""
              }`}
              status={isDuplicate ? "error" : ""}
            />
            {duplicateMessage && (
              <p className="text-xs text-danger mt-2 font-semibold">
                {duplicateMessage}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              {t('createTheme.minKeywords')}
            </p>
          </div>

          {/* Display Settings Summary */}
          <div className="mt-auto pt-6 border-t border-border">
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">{t('createTheme.themeLabel')}</span>{" "}
                {themeName || t('createTheme.notEntered')}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{t('createTheme.keywordsLabel')}</span>{" "}
                {keywords.length}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Keywords List (2/3 width) */}
        <div className="sm:col-span-2 bg-card game-card flex flex-col min-h-0">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {t('createTheme.keywordsListTitle')}
            </h2>
          </div>

          {/* Keywords List with Internal Scroll */}
          <div className="flex-1 overflow-y-auto pr-4 mb-6">
            {keywords.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-muted-foreground">
                  {t('createTheme.noKeywords')}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-[0_4px_12px_hsl(210_60%_70%_/_0.15)] hover:shadow-[0_8px_24px_hsl(210_60%_70%_/_0.2)] transition-all duration-200"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(index)}
                      className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Xóa từ khóa"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="pt-4 border-t border-border flex gap-3">
            <GameButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/create/room")}
              className="flex-1"
            >
              {t('createTheme.cancel')}
            </GameButton>
            <GameButton
              variant="success"
              size="lg"
              onClick={handleCreateTheme}
              disabled={!themeName.trim() || keywords.length < 20}
              className="flex-1"
            >
              {editingTopic ? t('createTheme.save') : t('createTheme.create')}
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTheme;
