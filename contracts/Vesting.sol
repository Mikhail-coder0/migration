// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./interfaces/IERC20.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for vesting schedules with cliff period.
 */
contract Vesting {
    // ERC20 basic token contract being held
    IERC20 private _token;

    // Vesting struct to store address info
    struct VestingStruct {
        uint256 vestedTokens;
        uint256 cliffPeriod;
        uint256 vestingPeriod;
        uint256 vestingStartTime;
        uint256 withdrawalPerDay;
    }

    // Mapping to store Balance and Release Time of Beneficiary
    mapping(address => VestingStruct) public addressInfo;

    mapping(address => uint256) public tokensAlreadyWithdrawn;

    /**
     * @dev Triggers on new deposit call
     */
    event TokenVested(
        address beneficary,
        uint256 amount,
        uint256 cliffPeriod,
        uint256 vestingPeriod,
        uint256 vestingStartTime,
        uint256 withdrawalPerDay
    );

    /**
     * @dev Triggers on every release
     */
    event TokenReleased(address beneficary, uint256 amount);

    /**
     * @dev Sets the token address to be vested.
     *
     * token_ value is immutable: they can only be set once during
     * construction.
     */
    constructor(IERC20 token_) public {
        _token = token_;
    }

    /**
     * @return the token being held.
     */
    function token() external view returns (IERC20) {
        return _token;
    }

    /**
     * @return the total token stored in the contract
     */
    function totalTokensVested() external view returns (uint256) {
        return _token.balanceOf(address(this));
    }

    /**
     * @notice Deposit tokens for vesting.
     * @param beneficiary The address, who can release token after vesting duration.
     * @param amount The amount of token to be locked.
     * @param vestingPeriod Must be in days.
     */
    function deposit(
        address beneficiary,
        uint256 amount,
        uint256 cliffPeriod,
        uint256 vestingPeriod
    ) external returns (bool success) {
        VestingStruct memory result = addressInfo[msg.sender];

        require(
            result.vestedTokens == 0,
            "Vesting: Beneficiary already have vested token. Use another address"
        );

        require(
            _token.transferFrom(msg.sender, address(this), amount),
            "Vesting: Please approve token first"
        );

        addressInfo[beneficiary] = VestingStruct(
            amount,
            cliffPeriod,
            vestingPeriod,
            block.timestamp,
            amount / vestingPeriod
        );

        emit TokenVested(
            beneficiary,
            amount,
            cliffPeriod,
            vestingPeriod,
            block.timestamp,
            amount / vestingPeriod
        );

        return true;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function withdraw() external virtual {
        VestingStruct memory result = addressInfo[msg.sender];

        require(
            result.vestedTokens > 0,
            "Vesting: You don't have any vested token"
        );

        require(
            block.timestamp >=
                (result.vestingStartTime + (result.cliffPeriod * 1 days)),
            "Vesting: Cliff period is not over yet"
        );

        uint256 tokensAvailable = getAvailableTokens(msg.sender);
        uint256 alreadyWithdrawn = tokensAlreadyWithdrawn[msg.sender];

        require(
            tokensAvailable + alreadyWithdrawn <= result.vestedTokens,
            "Vesting: Can't withdraw more than vested token amount"
        );

        if (tokensAvailable + alreadyWithdrawn == result.vestedTokens) {
            tokensAlreadyWithdrawn[msg.sender] = 0;
            addressInfo[msg.sender] = VestingStruct(0, 0, 0, 0, 0);
        } else {
            tokensAlreadyWithdrawn[msg.sender] += tokensAvailable;
        }

        emit TokenReleased(msg.sender, tokensAvailable);

        _token.transfer(msg.sender, tokensAvailable);
    }

    function getAvailableTokens(address beneficiary)
        public
        view
        returns (uint256)
    {
        VestingStruct memory result = addressInfo[beneficiary];

        if (result.vestedTokens > 0) {
            uint256 vestingEndTime =
                (result.vestingStartTime + (result.vestingPeriod * 1 days));

            if (block.timestamp >= vestingEndTime) {
                return
                    result.vestedTokens - tokensAlreadyWithdrawn[beneficiary];
            } else {
                uint256 totalDays =
                    ((
                        block.timestamp > vestingEndTime
                            ? vestingEndTime
                            : block.timestamp
                    ) - result.vestingStartTime) / 1 days;

                return
                    (totalDays * result.withdrawalPerDay) -
                    tokensAlreadyWithdrawn[beneficiary];
            }
        } else {
            return 0;
        }
    }
}
