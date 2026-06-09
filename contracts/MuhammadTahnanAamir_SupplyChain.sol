// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MuhammadTahnanAamir_SupplyChain {

    string public ownerName = "Muhammad Tahnan Aamir";

    enum Role { None, Manufacturer, Distributor, Retailer, Customer }
    enum Status { Manufactured, InTransit, AtRetailer, Delivered }

    struct Product {
        uint id;
        string name;
        string description;
        address currentOwner;
        Status status;
    }

    uint public productCounter = 0;

    mapping(uint => Product) public products;
    mapping(uint => address[]) public productHistory;
    mapping(address => Role) public roles;

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized role");
        _;
    }

    constructor() {
        roles[msg.sender] = Role.Manufacturer;
    }

    // Assign roles (only Manufacturer)
    function assignRole(address _user, Role _role) public onlyRole(Role.Manufacturer) {
        require(_role != Role.None, "Invalid role");
        roles[_user] = _role;
    }

    // Register product
    function registerProduct(string memory _name, string memory _desc)
        public
        onlyRole(Role.Manufacturer)
    {
        productCounter++;

        products[productCounter] = Product({
            id: productCounter,
            name: _name,
            description: _desc,
            currentOwner: msg.sender,
            status: Status.Manufactured
        });

        productHistory[productCounter].push(msg.sender);
    }

    // Transfer product
    function transferProduct(uint _id, address _to) public {
        Product storage prod = products[_id];

        require(msg.sender == prod.currentOwner, "Not current owner");
        require(_to != address(0), "Invalid address");

        Role receiverRole = roles[_to];
        require(receiverRole != Role.None, "Receiver has no role");

        if (prod.status == Status.Manufactured) {
            require(receiverRole == Role.Distributor, "Next must be Distributor");
            prod.status = Status.InTransit;

        } else if (prod.status == Status.InTransit) {
            require(receiverRole == Role.Retailer, "Next must be Retailer");
            prod.status = Status.AtRetailer;          // ← new status

        } else if (prod.status == Status.AtRetailer) {
            require(receiverRole == Role.Customer, "Next must be Customer");
            prod.status = Status.Delivered;

        } else if (prod.status == Status.Delivered) {
            revert("Already delivered");
        }

        prod.currentOwner = _to;
        productHistory[_id].push(_to);
    }

    // View product history
    function getProductHistory(uint _id) public view returns (address[] memory) {
        return productHistory[_id];
    }

    // View product details
    function getProduct(uint _id) public view returns (Product memory) {
        return products[_id];
    }

    // Get role of user
    function getRole(address _user) public view returns (Role) {
        return roles[_user];
    }
}