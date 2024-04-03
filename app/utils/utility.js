const ROLE_IDS = {
  BRAND_COMPANY: "Service Seeker", // service seeker
  AGENCY: "Service Provider", // service provider
  INDIVIDUAL: "Indivisual", // indivisual
  ADMIN: "ADMIN"
};
const deleteFields = {
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
};

module.exports = {ROLE_IDS, deleteFields };
