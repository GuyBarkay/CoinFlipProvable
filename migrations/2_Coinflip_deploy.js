const Coinflip = artifacts.require("Coinflip");

module.exports = function(deployer) {
  deployer.deploy(Coinflip).then(function() { console.log("CONTRACT ADDRESS IS "+Coinflip.address)});
};
