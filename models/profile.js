const { mongoose, redis } = require("./index");

const profileSchema = new mongoose.Schema({
  idProfile: { type: mongoose.Schema.Types.ObjectId, auto: true },
  nickname: { type: String, default: "Your Name" },
  avatar: { type: String },
  email: { type: String },
  username: { type: String, ref: "Account", required: true },
});

const ProfileModel = mongoose.model("Profile", profileSchema);

module.exports = class Profile {
  static async getProfileByUsername(username) {
    const profile = await ProfileModel.findOne({ username }).lean();

    if (!profile) {
      return {
        message: "Profile not found",
        success: false,
      };
    }
    return profile;
  }
 static async createProfile(atts) {
    const newProfile = new ProfileModel(atts); // bỏ {}
    await newProfile.save();
    return {
      message: "Create profile successfully",
      success: true,
      profile: newProfile
    };
}
};
