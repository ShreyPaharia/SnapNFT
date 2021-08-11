// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CashflowTokens.sol";


/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWallet {

    /*
     *  Events
     */
    event Confirmation(address indexed sender, uint indexed transactionId);
    event Rejection(address indexed sender, uint indexed transactionId);

    event Revocation(address indexed sender, uint indexed transactionId);
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
    event Deposit(address indexed sender, uint value);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event SupplierAddition(address indexed supplier);
    event SupplierRemoval(address indexed supplier);
    event RequirementChange(uint required);

    /*
     *  Constants
     */
    uint constant public MAX_OWNER_COUNT = 50;

    /*
     *  Storage
     */
    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => decision)) public decisions;
    mapping (address => bool) public isOwner;
    mapping (address => bool) public isSupplier;
    address[] public owners;
    address[] public suppliers;
    uint public required;
    uint public transactionCount;
    CashflowTokens private cashflowTokens;


    enum decision {
        PENDING,
        CONFIRM,
        REJECT
    }
    struct Transaction {
        string invoiceHash;
        string legalContractHash;
        address anchor;
        address supplier;
        uint256 invoiceAmount;
        uint256 paymentDate;
        decision status;
    }

    /*
     *  Modifiers
     */
    modifier onlyWallet() {
        require(msg.sender == address(this));
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner], "Owner Exists");
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner],"Only owner can confirm");
        _;
    }

    modifier supplierDoesNotExist(address supplier) {
        require(!isSupplier[supplier],"Address is already a supplier");
        _;
    }

    modifier supplierExists(address supplier) {
        require(isSupplier[supplier],"Address is not a supplier");
        _;
    }

    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].supplier != address(0),"Txn does not exist");
        _;
    }

    modifier decided(uint transactionId, address owner) {
        require(decisions[transactionId][owner]!=decision.PENDING,'No decision taken');
        _;
    }

    modifier notDecided(uint transactionId, address owner) {
        require(decisions[transactionId][owner]==decision.PENDING,'Decision Already taken');
        _;
    }


    modifier confirmed(uint transactionId, address owner) {
        require(decisions[transactionId][owner]==decision.CONFIRM,'The txn is not confirmed');
        _;
    }

    modifier rejected(uint transactionId, address owner) {
        require(decisions[transactionId][owner]==decision.REJECT,'The txn is not rejected');
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(decisions[transactionId][owner]!=decision.CONFIRM,"Txn is confirmed");
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(transactions[transactionId].status==decision.PENDING,"Txn already Executed");
        _;
    }

    modifier notNull(address _address) {
        require(_address != address(0),"Address is null");
        _;
    }

    modifier validRequirement(uint ownerCount, uint _required) {
        require(ownerCount <= MAX_OWNER_COUNT
        && _required <= ownerCount
        && _required != 0
            && ownerCount != 0);
        _;
    }

    /// @dev Fallback function allows to deposit ether.
    receive() external payable
    {
        if (msg.value > 0)
            emit Deposit(msg.sender, msg.value);
    }

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial owners and required number of decisions.
    /// @param _owners List of initial owners.
    /// @param _required Number of required decisions.
    constructor(address[] memory _owners, uint _required, CashflowTokens _cashflowTokens)
    validRequirement(_owners.length, _required)
    {
        for (uint i=0; i<_owners.length; i++) {
            require(!isOwner[_owners[i]] && _owners[i] != address(0));
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _required;
        cashflowTokens = _cashflowTokens;
    }

    /// @dev Allows to add a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of new owner.
    function addOwner(address owner)
    public
    onlyWallet
    ownerDoesNotExist(owner)
    notNull(owner)
    validRequirement(owners.length + 1, required)
    {
        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAddition(owner);
    }

    /// @dev Allows to remove an owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner.
    function removeOwner(address owner)
    public
    onlyWallet
    ownerExists(owner)
    {
        isOwner[owner] = false;
        for (uint i=0; i<owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        owners.pop();
        if (required > owners.length)
            changeRequirement(owners.length);
        emit OwnerRemoval(owner);
    }

    function addSupplier(address supplier)
    public
    supplierDoesNotExist(supplier)
    notNull(supplier)
    validRequirement(suppliers.length + 1, required)
    {
        isSupplier[supplier] = true;
        suppliers.push(supplier);
        emit SupplierAddition(supplier);
    }

    /// @dev Allows to remove an supplier. Transaction has to be sent by wallet.
    /// @param supplier Address of supplier.
    function removeSupplier(address supplier)
    public
    supplierExists(supplier)
    {
        isSupplier[supplier] = false;
        for (uint i=0; i<suppliers.length - 1; i++)
            if (suppliers[i] == supplier) {
                suppliers[i] = suppliers[suppliers.length - 1];
                break;
            }
        suppliers.pop();
        if (required > suppliers.length)
            changeRequirement(suppliers.length);
        emit SupplierRemoval(supplier);
    }

    /// @dev Allows to replace an owner with a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner to be replaced.
    /// @param newOwner Address of new owner.
    function replaceOwner(address owner, address newOwner)
    public
    onlyWallet
    ownerExists(owner)
    ownerDoesNotExist(newOwner)
    {
        for (uint i=0; i<owners.length; i++)
            if (owners[i] == owner) {
                owners[i] = newOwner;
                break;
            }
        isOwner[owner] = false;
        isOwner[newOwner] = true;
        emit OwnerRemoval(owner);
        emit OwnerAddition(newOwner);
    }

    /// @dev Allows to change the number of required decisions. Transaction has to be sent by wallet.
    /// @param _required Number of required decisions.
    function changeRequirement(uint _required)
    public
    onlyWallet
    validRequirement(owners.length, _required)
    {
        required = _required;
        emit RequirementChange(_required);
    }


    function submitTransaction(string memory invoiceHash, string memory legalContractHash, address anchor, uint256 invoiceAmount, uint256 paymentDate)
    public
    supplierExists(msg.sender)
    returns (uint transactionId)
    {
        transactionId = addTransaction(invoiceHash, legalContractHash, anchor, msg.sender, invoiceAmount, paymentDate);
//        confirmTransaction(transactionId);
//        return transactionId;
    }

    /// @dev Allows an owner to confirm a transaction.
    /// @param transactionId Transaction ID.
    function confirmTransaction(uint transactionId)
    public
    {
        decisions[transactionId][msg.sender] = decision.CONFIRM;
        emit Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    /// @dev Allows an owner to reject a transaction.
    /// @param transactionId Transaction ID.
    function rejectTransaction(uint transactionId)
    public
    {
        decisions[transactionId][msg.sender] = decision.REJECT;
        emit Rejection(msg.sender, transactionId);
        executeRejection(transactionId);
    }


    /// @dev Allows an owner to revoke a confirmation for a transaction.
    /// @param transactionId Transaction ID.
    function revokeDecision(uint transactionId)
    public
    ownerExists(msg.sender)
    decided(transactionId, msg.sender)
    notExecuted(transactionId)
    {
        decisions[transactionId][msg.sender] = decision.PENDING;
        emit Revocation(msg.sender, transactionId);
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionId Transaction ID.
    function executeTransaction(uint transactionId)
    public
    confirmed(transactionId, msg.sender)
    notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Transaction storage txn = transactions[transactionId];
            txn.status = decision.CONFIRM;
            if (external_call(txn.invoiceHash, txn.legalContractHash, txn.anchor, txn.supplier, txn.invoiceAmount, txn.paymentDate))
                emit Execution(transactionId);
            else {
                emit ExecutionFailure(transactionId);
                txn.status = decision.PENDING;
            }
        }
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionId Transaction ID.
    function executeRejection(uint transactionId)
    public
    rejected(transactionId, msg.sender)
    notExecuted(transactionId)
    {
        if (isRejected(transactionId)) {
            Transaction storage txn = transactions[transactionId];
            txn.status = decision.REJECT;
        }
    }

    // call has been separated into its own function in order to take advantage
    // of the Solidity's code generator to produce a loop that copies tx.data into memory.
    function external_call(string memory invoiceHash, string memory legalContractHash, address anchor, address supplier, uint256 totalSupply, uint256 paymentDate) internal returns (bool) {
        bool result;
        result = cashflowTokens.mint(invoiceHash, legalContractHash, anchor, supplier, totalSupply, paymentDate);
//        assembly {
//            let x := mload(0x40)   // "Allocate" memory for output (0x40 is where "free memory" pointer is stored by convention)
//            let d := add(data, 32) // First 32 bytes are the padded length of data, so exclude that
//            result := call(
//            sub(gas(), 34710),   // 34710 is the value that solidity is currently emitting
//            // It includes callGas (700) + callVeryLow (3, to pay for SUB) + callValueTransferGas (9000) +
//            // callNewAccountGas (25000, in case the destination address does not exist and needs creating)
//            destination,
//            value,
//            d,
//            dataLength,        // Size of the input (in bytes) - this is what fixes the padding problem
//            x,
//            0                  // Output is ignored, therefore the output size is zero
//            )
//        }
        return result;
    }

    function isConfirmed(uint transactionId)
    public
    view
    returns (bool)
    {
        uint count = 0;
        for (uint i=0; i<owners.length; i++) {
            if (decisions[transactionId][owners[i]]==decision.CONFIRM)
                count += 1;
            if (count == required)
                return true;
        }
        return false;
    }

    function isRejected(uint transactionId)
    public
    view
    returns (bool)
    {
        uint count = 0;
        for (uint i=0; i<owners.length; i++) {
            if (decisions[transactionId][owners[i]]==decision.REJECT)
                count += 1;
            if (count == required)
                return true;
        }
        return false;
    }

    /*
     * Internal functions
     */
    function addTransaction(string memory invoiceHash, string memory legalContractHash, address anchor, address supplier, uint256 invoiceAmount, uint256 paymentDate)
    internal
    returns (uint transactionId)
    {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            invoiceHash: invoiceHash,
            legalContractHash: legalContractHash,
            anchor: anchor,
            supplier: supplier,
            invoiceAmount: invoiceAmount,
            paymentDate: paymentDate,
            status: decision.PENDING
        });
        transactionCount += 1;
        emit Submission(transactionId);
    }

    /*
     * Web3 call functions
     */
    function getConfirmationCount(uint transactionId)
    public
    view
    returns (uint count)
    {
        for (uint i=0; i<owners.length; i++)
            if (decisions[transactionId][owners[i]]==decision.CONFIRM)
                count += 1;
    }

    function getTransactionCount(decision status)
    public
    view
    returns (uint count)
    {
        for (uint i=0; i<transactionCount; i++)
            if (transactions[i].status == status)
                count += 1;

    }

    /// @dev Returns list of owners.
    /// @return List of owner addresses.
    function getOwners()
    public
    view
    returns (address[] memory)
    {
        return owners;
    }

    function getSuppliers()
    public
    view
    returns (address[] memory)
    {
        return suppliers;
    }

    function getConfirmations(uint transactionId)
    public
    view
    returns (address[] memory _decisions)
    {
        address[] memory decisionsTemp = new address[](owners.length);
        uint count = 0;
        uint i;
        for (i=0; i<owners.length; i++)
            if (decisions[transactionId][owners[i]]==decision.CONFIRM) {
                decisionsTemp[count] = owners[i];
                count += 1;
            }
        _decisions = new address[](count);
        for (i=0; i<count; i++)
            _decisions[i] = decisionsTemp[i];
    }

    function getTransactionIds(uint from, uint to, decision status)
    public
    view
    returns (uint[] memory _transactionIds)
    {
        uint[] memory transactionIdsTemp = new uint[](transactionCount);
        uint count = 0;
        uint i;
        for (i=0; i<transactionCount; i++)
            if (transactions[i].status == status)
            {
                transactionIdsTemp[count] = i;
                count += 1;
            }
        _transactionIds = new uint[](to - from);
        for (i=from; i<to; i++)
            _transactionIds[i - from] = transactionIdsTemp[i];
    }

    function getAllTransactions()
    public
    view
    returns (Transaction[] memory)
    {
        Transaction[] memory _transactions = new Transaction[](transactionCount);
        for (uint i=0; i<transactionCount; i++) {
            _transactions[i] = transactions[i];
        }
        return _transactions;
    }
}
