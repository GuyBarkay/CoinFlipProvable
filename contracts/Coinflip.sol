import "./Ownable1.sol";
import"./provableAPI.sol";
//import "github.com/provable-things/ethereum-api/provableAPI.sol";

pragma solidity ^0.5.8;

contract Coinflip is Ownable1, usingProvable {

  uint public accountBalance;
  uint public ownerObligoToPlayers= 0;
  uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
  bytes32 queryId;

  modifier costs(uint cost){
  require(msg.value >= cost, "please send the required amount");
      _;
  }

  modifier maxCosts(uint cost){
  require(msg.value <= cost, "please send smaller amount");
      _;
  }

  struct Bet{
   bytes32 betId;
    uint betAmount;
   uint betResult;
   address creator;
  }

 Bet newBet;
 Bet[] public betList;

 mapping (address => Bet ) private betByPlayer;
 //mapping (bytes32 => Bet)  private betById;

 mapping (address => uint ) public playerBalance;
 mapping (address => bool)  public awaitTo;


 event Deposit(address indexed _from, uint _value);
 event LogNewProvableQuery(string description);
 event GeneratedRandomNumber(uint playerBalance ,uint256 randomNumber);

 constructor() public  {
    provable_setProof(proofType_Ledger);
 }


 function random() private view returns (uint){
    return now % 2;
 }

 function flip () public  payable costs (0.05 ether ) maxCosts (0.2 ether)  {
   uint a = address(this).balance-msg.value; // according to checks it seems that address(this).balance is the sum inc msg.value therefore we deduct the msg.sender for assert test
   uint b = ownerObligoToPlayers;
   assert (b+210000000000000000 <= a );// make sure positive cashier required by adding max cost + p.01 ether for assurance
   accountBalance =a-b;
   //acountBalance will be updated after every event that may change the balances/ the address(this).balance
   //require ((msg.value + ownerObligoToPlayers)<= address(this).balance);
   require(awaitTo[msg.sender]== false,"please wait");



   newBet.creator = msg.sender;
   newBet.betAmount = msg.value;
   newBet.betId = 0; // to be updated on update()
   newBet.betResult = 10; //to be updated on update() __call function
   //Bet(0, msg.value, 10, msg.sender);

   mappingBet (newBet); // to be updated on update() __call function

   awaitTo[msg.sender]=true;


   update ();

   //if(random() == 1 ){
    //  newBet.betResult = = 1};
 }

 function mappingBet(Bet  storage _newBet) private {
        betByPlayer[msg.sender] = newBet;
 }

 function __callback (bytes32 _queryId, string memory _result, bytes memory _proof) public {
   require (msg.sender== provable_cbAddress());
   uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2; //was 100 originally
   newBet.betResult = randomNumber;
   betList.push(newBet);
   betByPlayer[newBet.creator].betResult= randomNumber;

   if(randomNumber==1){
   playerBalance[newBet.creator] += (newBet.betAmount)*2;
   ownerObligoToPlayers += (newBet.betAmount)*2;
   }

   getOwnerNetBalance();// updating accountBalance as address(this).balance decreases as result of  callback gas costs and cost of bet (if winning) .
  //accountBalance = address(this).balance - ownerObligoToPlayers;

   awaitTo[newBet.creator] = false;

   emit GeneratedRandomNumber (playerBalance[newBet.creator], randomNumber);
 }

 function update() private {
  uint256 QUERY_EXECUTION_DELAY = 0;
  uint256 GAS_FOR_CALLBACK = 300000;
   // the provable_newRandomDSQuery will return unic id for every call to the oracle (that is also goes to the callback function argument):
  queryId = provable_newRandomDSQuery (QUERY_EXECUTION_DELAY, NUM_RANDOM_BYTES_REQUESTED, GAS_FOR_CALLBACK); //testRandom();
  newBet.betId = queryId;
  betByPlayer[msg.sender].betId=queryId;
  getOwnerNetBalance();// updating accountBalance
  //accountBalance = address(this).balance - ownerObligoToPlayers;
  emit LogNewProvableQuery ("provable was sent, standing by for answer..");
 }

/*function testRandom() public returns (bytes32){
  queryId=bytes32(keccak256("test"));
  __callback(queryId,"1",bytes("test"));
  return queryId;
}*/


 function getBalance() public view returns (uint){
    return address(this).balance;
 }

 function getOwnerNetBalance() public returns (uint){
     uint a = address(this).balance;
     uint b = ownerObligoToPlayers;
     assert(b <= a);
     accountBalance = a-b;
     return accountBalance;
    //uint accountBalance = address(this).balance - ownerObligoToPlayers;
  //  return accountBalance;
 }

//function sub(uint256 a, uint256 b) internal constant returns (uint256) {
      //  assert(b <= a);
    //    return a - b;
  //    }

 function ObligoToPlayers() public view returns (uint){
        return ownerObligoToPlayers;
 }

 function numberOfGames () public view returns (uint){
          return (betList.length);
  }

 function getLastFlip () public view returns (bytes32 betId,uint betAmount, uint betResult,address creator) {
    return (betByPlayer[msg.sender].betId, betByPlayer[msg.sender].betAmount, betByPlayer[msg.sender].betResult,betByPlayer[msg.sender].creator);
 }

 function getPlayerBalance() public view returns (uint){
    return (playerBalance[msg.sender]);
 }

 function reset() public onlyOwner returns (bool ){
      awaitTo[msg.sender]=false;
 }

 function toTransferBet( ) public returns(uint) {
     require (awaitTo[msg.sender]== false);
     //require  (msg.sender == newBet.creator);
     require ((address(this).balance - ownerObligoToPlayers)>=0);

     uint  w = playerBalance[msg.sender];
     playerBalance[msg.sender]= 0;
    msg.sender.transfer(w);
    ownerObligoToPlayers -= w;
    return w;
 }

 function deposit() public onlyOwner payable  {
    accountBalance += msg.value;

   //accountBalance = address(this).balance-playerBalance[msg.sender];
   emit Deposit(msg.sender, msg.value);
 }

 function withdrawAll() public onlyOwner returns(uint) {
//require (address(this).balance >= ownerObligoToPlayers);
       uint toTransfer = accountBalance;
        accountBalance = 0;
        msg.sender.transfer(toTransfer);
        return toTransfer;
 }
}
