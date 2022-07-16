// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title OrderBook
 * @author Ghadi Mhawej
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OrderBook is ReentrancyGuard {
    using SafeMath for uint256;

    /// @notice using a counter to increment next Id to be created
    using Counters for Counters.Counter;

    /// @notice order id to be created next
    Counters.Counter public _orderId;

    uint256 public currentBlockNumber = block.number;

    /// @notice general structure of Orders

    struct Order {
        address maker;
        address makeAsset;
        uint256 makeAmount;
        address[] taker;
        address takeAsset;
        uint256 takeAmount;
        uint256 salt;
        uint256 startBlock;
        uint256 endBlock;
    }

    /// @notice mapping of orders by id
    mapping(uint256 => Order) orders;

    /**
     * @notice event fired on creation of an order
     * @param orderId Id of Order
     * @param maker address of creator of the order
     * @param makeAsset address of ERC20 token to be sold by maker
     * @param makeAmount amount of ERC20 token to be sold by maker
     * @param takeAsset address of ERC20 token to be bought by maker
     * @param takeAmount amount of ERC20 token to be bought by maker
     * @param startBlock block number of order creation
     **/

    event MakeOrderEvent(
        uint256 indexed orderId,
        address indexed maker,
        address makeAsset,
        uint256 makeAmount,
        address takeAsset,
        uint256 takeAmount,
        uint256 startBlock
    );

    /**
     * @notice event fired on cancellation of order
     * @param orderId Id of Order
     * @param maker address of creator of the order
     * @param makeAsset address of ERC20 token to be sold by maker
     * @param makeAmount amount of ERC20 token to be sold by maker
     * @param takeAsset address of ERC20 token to be bought by maker
     * @param takeAmount amount of ERC20 token to be bought by maker
     * @param startBlock block number of order creation
     **/
    event CancelOrderEvent(
        uint256 indexed orderId,
        address indexed maker,
        address makeAsset,
        uint256 makeAmount,
        address takeAsset,
        uint256 takeAmount,
        uint256 startBlock
    );

    /**
     * @notice event fired on fill of  order
     * @param orderId Id of Order
     * @param maker address of creator of the order
     * @param makeAsset address of ERC20 token to be sold by maker
     * @param taker address person that fills the order
     * @param takeAsset address of ERC20 token to be bought by maker
     * @param quantity amount of ERC20 token being sold by maker
     * @param fulfilledQuantity amount of ERC20 token bought by taker
     **/
    event TakeOrderEvent(
        uint256 indexed orderId,
        address indexed maker,
        address makeAsset,
        address indexed taker,
        address takeAsset,
        uint256 quantity,
        uint256 fulfilledQuantity
    );

    /**
     * @notice creating an order
     * @param makeAsset_ address of ERC20 token to be sold by maker
     * @param makeAmount_ amount of ERC20 token to be sold by maker
     * @param takeAsset_ address of ERC20 token to be bought by maker
     * @param takeAmount_ amount of ERC20 token to be bought by maker
     * @param endBlock_ last block number for order to be filled
     **/

    function MakeOrder(
        address makeAsset_,
        uint256 makeAmount_,
        address takeAsset_,
        uint256 takeAmount_,
        uint256 endBlock_
    ) public nonReentrant {
        require(makeAsset_ != address(0), "Make ERC20 address is invalid");
        require(takeAsset_ != address(0), "Take ERC20 address is invalid");
        require(makeAmount_ > 0, "Make asset amount should be higher than 0");
        require(takeAmount_ > 0, "Take asset amount should be higher than 0");
        require(
            endBlock_ > block.number + 1,
            "End block should be higher than start block"
        );

        require(
            ERC20(makeAsset_).transferFrom(
                msg.sender,
                address(this),
                makeAmount_
            )
        );

        Order memory order;

        order.maker = msg.sender;
        order.makeAmount = makeAmount_;
        order.makeAsset = makeAsset_;
        order.takeAsset = takeAsset_;
        order.takeAmount = takeAmount_;
        order.startBlock = block.number;
        order.endBlock = endBlock_;

        orders[_orderId.current()] = order;
        emit MakeOrderEvent(
            _orderId.current(),
            msg.sender,
            makeAsset_,
            makeAmount_,
            takeAsset_,
            takeAmount_,
            block.timestamp
        );
        _orderId.increment();
    }

    /**
     * @notice get order details
     * @param id id of order to get details for
     **/

    function getOrderById(uint256 id) public view returns (Order memory order) {
        order = orders[id];
    }

    /**
     * @notice filling of order
     * @param id id of order to be filled
     * @param amount amount to be filled
     **/

    function takeOrder(uint256 id, uint256 amount) public nonReentrant {
        require(amount > 0, "Amount must be higher than 0");
        require(orders[id].startBlock > 0, "Invalid order");
        require(
            orders[id].takeAmount >= amount,
            "Amount cannot be higher than take amount"
        );
        require(orders[id].endBlock > block.number, "Order has expired");

        bool isPartialFill = orders[id].takeAmount != amount;
        uint256 amountToTransfer = isPartialFill
            ? (orders[id].makeAmount * amount) / orders[id].takeAmount
            : orders[id].makeAmount;
        require(
            ERC20(orders[id].takeAsset).transferFrom(
                msg.sender,
                orders[id].maker,
                amount
            )
        );
        require(
            ERC20(orders[id].makeAsset).transfer(msg.sender, amountToTransfer)
        );
        orders[id].taker.push(msg.sender);
        emit TakeOrderEvent(
            id,
            orders[id].maker,
            orders[id].makeAsset,
            msg.sender,
            orders[id].takeAsset,
            orders[id].takeAmount,
            amount
        );
    }

    /**
     * @notice cancellation of order
     * @param id id of order to be cancelled
     **/
    function cancelOrder(uint256 id) external nonReentrant {
        require(
            orders[id].maker == msg.sender,
            "Caller must be the order creator"
        );
        require(orders[id].startBlock > 0, "Invalid Order");

        require(orders[id].endBlock > block.number, "Order has expired");

        require(
            ERC20(orders[id].makeAsset).transfer(
                orders[id].maker,
                orders[id].makeAmount
            )
        );

        orders[id].endBlock = block.number;

        emit CancelOrderEvent(
            id,
            orders[id].maker,
            orders[id].makeAsset,
            orders[id].makeAmount,
            orders[id].takeAsset,
            orders[id].takeAmount,
            block.number
        );
    }
}
