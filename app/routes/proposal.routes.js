const express = require("express");
const ctrl = require("../controllers/users.controller");
const verifyToken = require("../middleware/auth");
const proposal_route = express.Router();
const proposal = require('../controllers/proposal.controller');

proposal_route.post('/postProposal',[verifyToken], proposal.postProposal );
proposal_route.get('/getAllProposal',[verifyToken], proposal.getAllProposals );
proposal_route.get('/proposalAdid/:adId',[verifyToken], proposal.getProposalsByAdId );


module.exports = proposal_route;