const { Click } = require('../models');
const { v4: uuidv4 } = require('uuid');

const generateClickId = async (req, res) => {
  const { user_id, campaign_id, base_url } = req.body;

  if (!user_id || !campaign_id || !base_url) {
    return res.status(400).json({ message: 'User ID, Campaign ID, and Base URL are required' });
  }

  try {
    // Log when the endpoint is hit
    console.log('generateClickId endpoint hit');

    // Check if a click already exists for this user and campaign
    const existingClick = await Click.findOne({ where: { user_id, campaign_id } });
    if (existingClick) {
      // If a click already exists, generate the URL using the existing click_id
      let campaignUrl = decodeURIComponent(base_url)
        .replace('{AFF_CLICK_ID}', existingClick.click_id)
        .replace('{SUB_AFFID}', 'default_sub_affid')
        .replace('{DEVICE_ID}', 'default_device_id');

      return res.status(200).json({ click_id: existingClick.click_id, campaignUrl });
    }

    // Generate a new click ID
    const click_id = uuidv4();

    // Save the click in the database
    const newClick = await Click.create({
      click_id,
      user_id,
      campaign_id,
    });

    // Generate the campaign URL
    let campaignUrl = decodeURIComponent(base_url)
      .replace('{AFF_CLICK_ID}', click_id)
      .replace('{SUB_AFFID}', 'default_sub_affid')
      .replace('{DEVICE_ID}', 'default_device_id');

    console.log('Generated Campaign URL:', campaignUrl);

    return res.status(201).json({ click_id, campaignUrl });
  } catch (error) {
    console.error('Error generating click ID:', error);
    return res.status(500).json({ message: 'Error generating click ID', error: error.message });
  }
};


module.exports = { generateClickId };
