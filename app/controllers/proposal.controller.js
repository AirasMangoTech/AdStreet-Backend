const Proposal = require('../models/proposals');
const response = require('../utils/responseHelpers');

const postProposal = async (req, res) => {
  try {
    if (!req.body.content || !req.body.budget || !req.body.jobDuration) {
        return response.error(res, 'Missing required fields', 400);     
      
    }
    console.log(req.user);
    const proposal = new Proposal({
      content: req.body.content,
      budget: req.body.budget,
      jobDuration: req.body.jobDuration,
      submittedBy: req.user.id 
    });

    await proposal.save();

    // Send a success response
    return response.success(res, "Proposal submitted successfully", {proposal});
    
  } catch (error) {
       console.log(error.message);
        return response.serverError(res, "An error has been occurred");
        
  }
};

module.exports = {
  postProposal
};
