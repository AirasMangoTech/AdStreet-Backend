const Ad = require("../models/ad");

const batchSize = 100;
const delayBetweenBatches = 2000;

async function adManager() {
  const ads = await Ad.find({
    $and: [{ isApproved: true }, { isExpired: false }],
  });

  for (let i = 0; i < ads.length; i += batchSize) {
    const batch = ads.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (ad) => {
        const now = new Date();
        if (ad.valid_till < now) {
          ad.isExpired = true;
          await ad.save();
        }
      })
    );

    if (i + batchSize < ads.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }
}
module.exports = adManager;
