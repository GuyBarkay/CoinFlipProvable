  const Coinflip = artifacts.require("Coinflip");
  const truffleAssert = require("truffle-assertions");

  contract("Coinflip", async function(accounts){

    let instance;

    before(async function(){
      instance = await Coinflip.deployed()
    });

      it("should allow the owner to deposit", async function(){
      let instance = await Coinflip.new();
      await truffleAssert.passes(instance.deposit({from: accounts[0],value: web3.utils.toWei("1", "ether")}));
      });

      it("should not allow a nonOwner to deposit", async function(){
      let instance = await Coinflip.new();
      await truffleAssert.fails(instance.deposit({from: accounts[2],value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);
      });

      it("should allow a flip equal to 0.1 ether", async function(){
       let instance = await Coinflip.new();
       await instance.deposit({from: accounts[0], value: web3.utils.toWei("0.11", "ether")});
       //await instance.flip({from: accounts[2], value: web3.utils.toWei("0.1", "ether")});
       await truffleAssert.passes(instance.flip({from: accounts[2],value: web3.utils.toWei("0.11", "ether")}));
        });


        it("should not allow a flip less than 0.1 ether", async function(){
         let instance = await Coinflip.new();
         await instance.deposit({from: accounts[0], value: web3.utils.toWei("1", "ether")});
         //await instance.flip({from: accounts[2], value: web3.utils.toWei("0.1", "ether")});
         await truffleAssert.fails(instance.flip({from: accounts[0],value: web3.utils.toWei("0.09", "ether")}),truffleAssert.ErrorType.REVERT);
          });

  /*  it("After fliping, Contruct acountBalance == blockchain Contract address Balance", async function(){
      let instance = await Coinflip.new();
      await instance.deposit({from: accounts[0], value: web3.utils.toWei("1", "ether")});
      await instance.flip({from: accounts[1], value: web3.utils.toWei("0.1", "ether")});
      let acountBalance = await instance.acountBalance();
      let floatAcountBalance = acountBalance;
      let blockchainBalance = await web3.eth.getBalance(instance.address);
      assert(floatAcountBalance == blockchainBalance)
    });*/

      it("should allow the owner to withdraw balance", async function(){
      let instance = await Coinflip.new();
      await instance.deposit({from: accounts[0], value: web3.utils.toWei("0.5", "ether")});
      await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
    });

    it("should not allow a non-owner to withdraw balance", async function(){
      //let instance = await People.new();
      //await instance.deposit({from: accounts[0], value: web3.utils.toWei("0.5", "ether")});
      await truffleAssert.fails(instance.withdrawAll({from: accounts[2]}), truffleAssert.ErrorType.REVERT);
    });

    it("owners balance should increase after withdrawal", async function(){
      let instance = await Coinflip.new();
      await instance.deposit({from: accounts[0], value: web3.utils.toWei("0.3", "ether")});
      let balanceBefore = parseFloat(await web3.eth.getBalance(accounts[0]));
      await instance.withdrawAll();
      let balanceAfter = parseFloat(await web3.eth.getBalance(accounts[0]));
      assert(balanceBefore < balanceAfter, "Owners balance was not increased after withdrawal");

    });
    it("should reset balances to 0 after withdrawal", async function(){
    //  let instance = await Coinflip.new();
    //  await instance.deposit({from: accounts[0], value: web3.utils.toWei("0.5", "ether")});
      await instance.withdrawAll();

      let balance = await instance.acountBalance();
      let floatBalance = parseFloat(balance);

      let realBalance = await web3.eth.getBalance(instance.address);

      assert(floatBalance == web3.utils.toWei("0", "ether") && floatBalance == realBalance, "Contract balance was not 0 after withdrawal or did not match")

    })
  });
