import mongoose from "mongoose";

// Tạo Schema cho Campaign
const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Tiêu đề chiến dịch (dọn rác, giúp trẻ em nghèo, ...)
  description: { type: String, required: true }, // Mô tả chi tiết chiến dịch
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo chiến dịch (AssistantAdmin hoặc Admin)
  createdAt: { type: Date, default: Date.now }, // Ngày tạo chiến dịch
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người cập nhật chiến dịch

  // Trạng thái chiến dịch (đang diễn ra, hoàn thành)
  status: { 
    type: String, 
    enum: ["ongoing", "completed"], 
    default: "ongoing" 
  },

  // Tiến độ chiến dịch
  progress: { 
    type: Number, 
    default: 0 
  },

  // Mô tả cột mốc chiến dịch
  milestones: [{
    name: { type: String, required: true }, // Tên cột mốc
    description: { type: String, required: true }, // Mô tả chi tiết cột mốc
    completed: { type: Boolean, default: false }, // Trạng thái cột mốc
    percentage: { type: Number, required: true }, // % tiến độ khi cột mốc hoàn thành
  }],

  // Đường dẫn hình ảnh mô tả chiến dịch
  imagePath: { 
    type: String, 
    default: "" 
  },

  // Ngày bắt đầu và kết thúc đăng ký tình nguyện
  registrationStartDate: { 
    type: Date, 
    required: true 
  },
  registrationEndDate: { 
    type: Date, 
    required: true 
  },

  // Số lượng tình nguyện viên hiện tại
  volunteerCount: { 
    type: Number, 
    default: 0 
  },

  // Số lượng tình nguyện viên tối đa
  maxVolunteers: { 
    type: Number, 
    required: true 
  },

  // Địa điểm và thời gian diễn ra chiến dịch
  location: { 
    type: String, 
    required: true 
  },
  campaignStartDate: { 
    type: Date, 
    required: true 
  },
  campaignEndDate: { 
    type: Date, 
    required: true 
  },

}, { timestamps: true });

// Middleware để kiểm tra tiến độ và cột mốc khi cập nhật Campaign
CampaignSchema.pre('save', function (next) {
  const campaign = this;

  // Kiểm tra cột mốc đã hoàn thành và tính toán tổng tiến độ dựa trên các milestones
  let totalProgress = 0;
  campaign.milestones.forEach(milestone => {
    if (milestone.completed) {
      totalProgress += milestone.percentage;
    }
  });
  
  // Cập nhật tiến độ tổng thể (progress)
  campaign.progress = totalProgress;

  // Kiểm tra nếu số lượng tình nguyện viên đã đạt tối đa
  if (campaign.volunteerCount >= campaign.maxVolunteers) {
    // Nếu số lượng tình nguyện viên đã đầy, không cho phép đăng ký thêm
    campaign.status = 'completed';
  }

  // Kiểm tra ngày kết thúc chiến dịch để đánh dấu hoàn thành
  const now = new Date();
  if (now > campaign.campaignEndDate) {
    campaign.status = 'completed'; // Nếu chiến dịch đã kết thúc, đặt trạng thái thành "hoàn thành"
  }

  next();
});

const Campaign = mongoose.model("Campaign", CampaignSchema);
export default Campaign;