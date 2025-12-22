import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Edit2, Save, X, User, Mail, Lock, Calendar, Trophy, Award, Medal, Camera, Gamepad2, Brush, MessageSquare, Target, Loader } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { playerApi, authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = authApi.getUser();
      console.log("fetchProfile - current user:", user);
      if (!user || !user.username) {
        navigate("/login");
        return;
      }

      if (user.role === 'guest' || user.isGuest) {
          setIsLoading(false);
          return;
      }

      try {
        const result = await playerApi.getPlayer(user.username);
        
        if (result.success) {
          const { data } = result;
          const profile = data.profile || {};
          
          // Update Personal Info
          setFullName(profile.nickname || user.username);
          setAvatar(profile.avatar || "");
          
          // Update Account Info
          setUsername(user.username);
          setEmail(profile.email || "");
          
          // Update Achievements
          setRanking(data.rank || 0);
          setGoldMedals(data.first || 0);
          setSilverMedals(data.second || 0);
          setBronzeMedals(data.third || 0);
          
          // Update Game Statistics
          setTotalGames(data.totalGames || 0);
          setWordsDrawn(data.wordsDrawn || 0);
          setWordsGuessed(data.wordsGuessed || 0);
          
          const accuracy = data.totalGuesses > 0 
            ? ((data.totalGuesses / data.wordsGuessed) * 100).toFixed(1) 
            : 0;
          setGuessAccuracy(accuracy);
        } else {
          toast({ title: result.message || t('profile.loadFail'), variant: "destructive" });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({ title: t('profile.loadError'), variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);
  
  // Editing states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  
  // Avatar modal state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [tempAvatar, setTempAvatar] = useState("");
  
  // Change Password Modal state
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState(""); // Avatar URL or base64
  
  // Account Information
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Achievement Information
  const [ranking, setRanking] = useState(0);
  const [goldMedals, setGoldMedals] = useState(0);
  const [silverMedals, setSilverMedals] = useState(0);
  const [bronzeMedals, setBronzeMedals] = useState(0);

  // Game Statistics
  const [totalGames, setTotalGames] = useState(0);
  const [wordsDrawn, setWordsDrawn] = useState(0);
  const [wordsGuessed, setWordsGuessed] = useState(0);
  const [guessAccuracy, setGuessAccuracy] = useState(0);
  
  // Original values for cancel - separate for each block
  const [originalPersonalValues, setOriginalPersonalValues] = useState({
    fullName: "",
    dateOfBirth: "",
    avatar: ""
  });

  const [originalAccountValues, setOriginalAccountValues] = useState({
    username: "",
    email: "",
    password: ""
  });

  // Personal Information handlers
  const handleEditPersonal = () => {
    setOriginalPersonalValues({
      fullName,
      dateOfBirth,
      avatar
    });
    setIsEditingPersonal(true);
  };

  const handleSavePersonal = () => {
    setIsEditingPersonal(false);
    setOriginalPersonalValues({
      fullName,
      dateOfBirth,
      avatar
    });
  };

  const handleCancelPersonal = () => {
    setFullName(originalPersonalValues.fullName);
    setDateOfBirth(originalPersonalValues.dateOfBirth);
    setAvatar(originalPersonalValues.avatar);
    setIsEditingPersonal(false);
  };

  // Account Information handlers
  const handleEditAccount = () => {
    setOriginalAccountValues({
      username,
      email,
      password
    });
    setIsEditingAccount(true);
  };

  const handleSaveAccount = () => {
    setIsEditingAccount(false);
    setOriginalAccountValues({
      username,
      email,
      password
    });
  };

  const handleCancelAccount = () => {
    setUsername(originalAccountValues.username);
    setEmail(originalAccountValues.email);
    setPassword(originalAccountValues.password);
    setIsEditingAccount(false);
  };

  // Avatar modal handlers
  const handleAvatarClick = () => {
    setTempAvatar(avatar);
    setIsEditingAvatar(false);
    setIsAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setIsEditingAvatar(false);
    setTempAvatar("");
  };

  const handleEditAvatar = () => {
    setTempAvatar(avatar);
    setIsEditingAvatar(true);
  };

  const handleSaveAvatar = () => {
    setAvatar(tempAvatar);
    setIsEditingAvatar(false);
    setIsAvatarModalOpen(false);
    setTempAvatar("");
  };

  const handleCancelAvatarEdit = () => {
    setTempAvatar(avatar);
    setIsEditingAvatar(false);
  };

  // Avatar upload handler
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Change Password Handlers
  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const user = authApi.getUser();
  if (user && (user.role === 'guest' || user.isGuest)) {
      return (
        <div className="h-[300px] flex flex-col items-center justify-center p-4 gap-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">{t('profile.playerProfile')}</h2>
                <p className="text-muted-foreground">{t('profile.loginToView')}</p>
            </div>
            <GameButton variant="primary" onClick={() => navigate("/login")}>
                {t('profile.loginNow')}
            </GameButton>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full">
        <div className="game-card mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleAvatarClick}
                className="cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              >
                {avatar ? (
                  <div className="relative">
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary hover:bg-primary/30 transition-colors">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                )}
              </button>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold truncate">{fullName}</h2>
                <p className="text-sm text-muted-foreground truncate">@{username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="text-right mr-4">
                <p className="text-sm text-muted-foreground">{t('profile.rank')}</p>
                <p className="text-xl font-bold text-primary">#{ranking}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="game-card space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">{t('profile.personalInfo')}</h2>
              </div>
              {!isEditingPersonal ? (
                <GameButton
                  variant="primary"
                  size="sm"
                  onClick={handleEditPersonal}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                </GameButton>
              ) : (
                <div className="flex gap-2">
                  <GameButton
                    variant="success"
                    size="sm"
                    onClick={handleSavePersonal}
                  >
                    <Save className="w-4 h-4 mr-1" />
                  </GameButton>
                  <GameButton
                    variant="danger"
                    size="sm"
                    onClick={handleCancelPersonal}
                  >
                    <X className="w-4 h-4 mr-1" />
                  </GameButton>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 text-sm text-muted-foreground">
                {t('profile.fullName')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditingPersonal}
                className={`input-rounded w-full ${!isEditingPersonal ? 'bg-muted cursor-not-allowed opacity-75' : ''}`}
                placeholder={t('profile.enterFullName')}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('profile.dob')}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={!isEditingPersonal}
                className={`input-rounded w-full ${!isEditingPersonal ? 'bg-muted cursor-not-allowed opacity-75' : ''}`}
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="game-card space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">{t('profile.accountInfo')}</h2>
              </div>
              {!isEditingAccount ? (
                <GameButton
                  variant="primary"
                  size="sm"
                  onClick={handleEditAccount}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                </GameButton>
              ) : (
                <div className="flex gap-2">
                  <GameButton
                    variant="success"
                    size="sm"
                    onClick={handleSaveAccount}
                  >
                    <Save className="w-4 h-4 mr-1" />
                  </GameButton>
                  <GameButton
                    variant="danger"
                    size="sm"
                    onClick={handleCancelAccount}
                  >
                    <X className="w-4 h-4 mr-1" />
                  </GameButton>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2 text-sm text-muted-foreground">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditingAccount}
                className={`input-rounded w-full ${!isEditingAccount ? 'bg-muted cursor-not-allowed opacity-75' : ''}`}
                placeholder={t('profile.enterUsername')}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('profile.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditingAccount}
                className={`input-rounded w-full ${!isEditingAccount ? 'bg-muted cursor-not-allowed opacity-75' : ''}`}
                placeholder={t('profile.enterEmail')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t('profile.password')}
                </label>
                <GameButton 
                  variant="secondary" 
                  size="sm"
                  onClick={handleOpenChangePasswordModal}
                  className="whitespace-nowrap"
                >
                  {t('profile.changePassword')}
                </GameButton>
              </div>
            </div>
          </div>

          {/* Game Statistics */}
          <div className="game-card space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">{t('profile.gameStats')}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{t('profile.totalGames')}</span>
                </div>
                <span className="text-xl font-bold">{totalGames}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Brush className="w-5 h-5 text-success" />
                  </div>
                  <span className="font-medium">{t('profile.wordsDrawn')}</span>
                </div>
                <span className="text-xl font-bold">{wordsDrawn}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-medium">{t('profile.wordsGuessed')}</span>
                </div>
                <span className="text-xl font-bold">{wordsGuessed}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="font-medium">{t('profile.accuracy')}</span>
                </div>
                <span className="text-xl font-bold">{guessAccuracy}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Information */}
        <div className="game-card mt-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{t('profile.achievements')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Ranking */}
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t('profile.rankPosition')}</p>
              <p className="text-3xl font-bold text-primary">#{ranking}</p>
            </div>

            {/* Gold Medals */}
            <div className="text-center p-4 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl border-2 border-yellow-400/30">
              <div className="flex items-center justify-center mb-2">
                <Medal className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t('profile.goldMedal')}</p>
              <p className="text-3xl font-bold text-yellow-600">{goldMedals}</p>
            </div>

            {/* Silver Medals */}
            <div className="text-center p-4 bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded-xl border-2 border-gray-400/30">
              <div className="flex items-center justify-center mb-2">
                <Medal className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t('profile.silverMedal')}</p>
              <p className="text-3xl font-bold text-gray-600">{silverMedals}</p>
            </div>

            {/* Bronze Medals */}
            <div className="text-center p-4 bg-gradient-to-br from-amber-600/20 to-amber-800/20 rounded-xl border-2 border-amber-700/30">
              <div className="flex items-center justify-center mb-2">
                <Medal className="w-8 h-8 text-amber-700" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">{t('profile.bronzeMedal')}</p>
              <p className="text-3xl font-bold text-amber-700">{bronzeMedals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      {isAvatarModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCloseAvatarModal}
        >
          <div 
            className="game-card max-w-md w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseAvatarModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-6 p-6">
              <h2 className="text-2xl font-bold">{t('profile.avatar')}</h2>
              
              {/* Avatar display */}
              <div className="flex justify-center">
                {tempAvatar ? (
                  <img 
                    src={tempAvatar} 
                    alt="Avatar" 
                    className="w-48 h-48 rounded-full object-cover border-4 border-primary shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
                    <User className="w-24 h-24 text-primary" />
                  </div>
                )}
              </div>

              {/* Edit controls */}
              {!isEditingAvatar ? (
                <GameButton
                  variant="primary"
                  size="md"
                  onClick={handleEditAvatar}
                >
                  <Edit2 className="w-5 h-5 mr-2" />
                  {t('profile.edit')}
                </GameButton>
              ) : (
                <div className="w-full space-y-4">
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <div className="input-rounded w-full flex items-center justify-center gap-2 hover:bg-muted transition-colors py-3">
                      <Camera className="w-5 h-5 text-primary" />
                      <span>{t('profile.chooseAvatar')}</span>
                    </div>
                  </label>
                  <div className="flex gap-3">
                    <GameButton
                      variant="success"
                      size="md"
                      onClick={handleSaveAvatar}
                      className="flex-1"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {t('profile.save')}
                    </GameButton>
                    <GameButton
                      variant="danger"
                      size="md"
                      onClick={handleCancelAvatarEdit}
                      className="flex-1"
                    >
                      <X className="w-5 h-5 mr-2" />
                      {t('profile.cancel')}
                    </GameButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={handleCloseChangePasswordModal} 
      />
    </div>
  );
};

export default Profile;

