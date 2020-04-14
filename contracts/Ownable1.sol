pragma solidity 0.5.8;

contract Ownable1 {
  address public owner;

  modifier onlyOwner (){
    require (msg.sender == owner);
    _;
}

  constructor () public {
    owner = msg.sender;
  }

}
