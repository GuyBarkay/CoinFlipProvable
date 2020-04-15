var web3 = new Web3(Web3.givenProvider);
var contractInstance;
$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(window.abi,"0x2b4548679973e85D21B44a77E398bc40282C271d", {from: accounts[0]});
      console.log(contractInstance);
          });

          $("#flip_button").click(coinFlip);
          $("#deposit_button").click(deposit);
          $("#withdrawAll_button").click(withdrawAll);
          $("#reset_button").click(resetFlip);
          $("#playerBalance_button").click(playerBalance);
          $("#getBalance_button").click(getBalance);
          $("#getBalance_button").click(TotalPlayersBalance);
          $("#getBalance_button").click(getBalanceNet);
          $("#withdraw_player_balance").click(WithdrawPBalance);
          $("#getLastFlip_button").click(getLastFlip);

  });

function deposit(){
  var amount = $("#amount_deposit").val() ;
  var config = {
    value:web3.utils.toWei( amount, "ether")
  }
 contractInstance.methods.deposit().send(config)
 .on ("transactionHash", function( hash) {
  console.log (hash);
 })
.on("receipt" ,function(receipt){
  console.log(receipt);
  getBalance();
  alert("success deposit");
})
}

//parseFloat(await web3.eth.getBalance(accounts[0]))


function coinFlip(){
  getBalanceNetBegin();
 $("#result_output").text("  Please Wait for Result");
  var gambleAmount = $("#amount_input").val() ;
  var config2 = {
    value:web3.utils.toWei(gambleAmount, 'ether')
  }
 contractInstance.methods.flip().send(config2)
 .on ("transactionHash", function(x) {
  console.log (x);
 })
//.on("confirmation", function (confirmationNr){
  //console.log(confirmationNr);
//})
.on("receipt" ,function(receipt){
  console.log(receipt);
  alert("received receipt, please wait for callback result")})
//.then(function(){
  //  balanceToTransfer()})
  //.then(function(){
    // fetchAndDisplay()})
//.then(function () {
    // getBalance()})
//.then(function(){
    //playerBalance()})

contractInstance.once('GeneratedRandomNumber', {
        filter: {player:'' /*'0x62C12CF6341C966c729eeAD92bBA52E9A7379425'*/},
        fromBlock: 7638699
    },  function(error, event) {
       let playerBalance1 = web3.utils.fromWei(event.returnValues.playerBalance, 'ether');
       //web3.utils.fromWei(res, 'ether');
       console.log(playerBalance1);
      console.log(event);
      console.log(event.returnValues)
      $("#result_output").html(event.returnValues.randomNumber.toString());
    //  $("#player_balance_output").html(event.returnValues.playerBalance.toString());
      $("#player_balance_output").html(playerBalance1.toString());
    })



/*var generatedRandomNumber = contractInstance.GeneratedRandomNumber();
generatedRandomNumber.watch(function(error, result){
  if (!error){
  //  console.log(result .returnValues);
  //  $("#result_output").html(result .returnValues.randomNumber.toString());
//  }
//  else{
  //  console.log(error);
  //}
//});
*/
}


function getBalance () {
//var  balance = web3.eth.getBalance('0x7a26A6dE20989A1bc13fE9B8F42496eD2Ed6E48f')
//.then(console.log)
//};
  contractInstance.methods.getBalance().call().then(function(res){
    var balance =   web3.utils.fromWei(res, 'ether');//  parseFloat(res/1000000000000000000);

    console.log("balance: " +balance);
    $("#balance_output").text( +balance);
})
}
function getBalanceNet() {
    contractInstance.methods.getOwnerNetBalance().call().then(function(res){
      var balanceNet =   web3.utils.fromWei(res, 'ether');//

    $("#balance_Net_output").text( +balanceNet);
     console.log("balanceNet: " +balanceNet);
    let s;

     if(balanceNet <= 0.21 ) {
       $("#cashier_status").text(s = "  Fliping Forbidden, Owner Deposit Required.");
       alert ("Cashier empty, Please Call Administrator to Deposit")
     } else{
        s= "  Open."};
     $("#cashier_status").text(s);

  })
}

function getBalanceNetBegin() {
    contractInstance.methods.getOwnerNetBalance().call().then(function(res){
      var balanceNet =   web3.utils.fromWei(res, 'ether');//

    $("#balance_Net_output").text( +balanceNet);
     console.log("balanceNet: " +balanceNet);
    let s;

     if(balanceNet <= 0.21 ) {
       $("#cashier_status").text(s = "  Fliping Forbidden, Owner Deposit Required.");
       alert ("Cashier empty, Please Call Administrator to Deposit")
     } else{
        s= "  Open."};
     $("#cashier_status").text(s);

  })
}

function TotalPlayersBalance() {
    contractInstance.methods.ObligoToPlayers().call().then(function(res){
      var TotalObligo =   web3.utils.fromWei(res, 'ether');//

    $("#players_balance").text( +TotalObligo);
     console.log("Total Players balance: " +TotalObligo);
  })
}


function getLastFlip() {
  contractInstance.methods.getLastFlip().call().then(function(res){
 let playerScore = res.betResult;
    console.log(res.betResult);
let j;
if (res.betResult==10){j= "please wait bet in process"} else {j = res};
console.log(j);
//$("#result_output").text(j);
})
}

function playerBalance() {
  contractInstance.methods.getPlayerBalance().call().then(function(res){
       balanceOfPlayer = web3.utils.fromWei(res, 'ether');
      console.log( "player balance " +balanceOfPlayer );   //+res/1000000000000000000);
      $("#player_balance_output").text(+balanceOfPlayer);  //res/1000000000000000000);
  })
}

function resetFlip() {
  contractInstance.methods.reset().send()
  .then(function(){
        console.log( "ready");
        alert("ready");
})
}

function WithdrawPBalance() {
  contractInstance.methods.toTransferBet().send()
  .then(function(){
        playerBalance();
  })
}

function withdrawAll() {
  contractInstance.methods.withdrawAll().send()
  .then(function() {
    getBalance();
    playerBalance();
  })
}
