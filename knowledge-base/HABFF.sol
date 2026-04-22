// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {IUniswapV2Pair} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ─── Aerodrome Router Interface ─────────────────────────────────────
interface IAerodromeRouter {
    struct Route {
        address from;
        address to;
        bool stable;
        address factory;
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external;

    function getAmountsOut(
        uint256 amountIn,
        Route[] calldata routes
    ) external view returns (uint256[] memory amounts);

    function defaultFactory() external view returns (address);
}

// ─── HABFF: HERO Arb BASE Fee Farm ─────────────────────────────────
// Dual-router arbitrage contract for BASE chain
// Supports: Uniswap V2 (BaseSwap) + Aerodrome Finance
// Handles fee-on-transfer tokens (HERO)
contract HABFF is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Types ──────────────────────────────────────────────────────
    struct Pair {
        address tokenA;
        address tokenB;
        address router;       // Which router this pair is on
        address pairAddress;
        uint256 heroForLp;
        uint256 totalHeroLpAdded;
        bool isAerodrome;     // true = Aerodrome, false = Uniswap V2
        bool isStable;        // Aerodrome: stable or volatile pool
    }

    enum RouterType { UNISWAP_V2, AERODROME }

    // ─── State ──────────────────────────────────────────────────────
    Pair[] public pairs;
    uint256 public heroGained;
    
    address public rewardsAddress;
    address public burnAddress = 0x0000000000000000000000000000000000000000;
    address public heroToken = 0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8;
    IERC20 public weth = IERC20(0x4200000000000000000000000000000000000006);

    // Thresholds
    uint256 public lpAddThreshold = 10000e18;
    uint256 public distributeThreshold = 10000e18;
    uint256 public minGain = 300e18;

    // LP targeting
    bool public targetedLpMode = false;
    address[] public targetLpPairs;

    // Distribution percentages (must sum to 100 minus lpPercent)
    uint256 public rewardsPercent = 50;
    uint256 public burnPercent = 0;
    uint256 public lpPercent = 0;
    uint256 public gasCompPercent = 50;

    // Signer (bot wallet that executes arbs)
    address private signer;

    // Counters
    uint256 public totalHeroBurn;
    uint256 public totalHeroReward;
    uint256 public totalHeroLp;
    uint256 public totalHeroGasComp;
    uint256 public pendingGainsDistribution;

    // ─── Routers ────────────────────────────────────────────────────
    // Uniswap V2 compatible (BaseSwap)
    IUniswapV2Router02 public uniswapRouter = 
        IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24);
    
    // Aerodrome Finance
    IAerodromeRouter public aerodromeRouter = 
        IAerodromeRouter(0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43);

    // ─── Events ─────────────────────────────────────────────────────
    event PairAdded(address tokenA, address tokenB, address router, address pairAddress, bool isAerodrome);
    event ArbitrageExecuted(uint256 amountIn, uint256 amountOut, uint256 gain, uint8 routerUsed);
    event CrossDexArbitrage(uint256 amountIn, uint256 gain, uint8 buyRouter, uint8 sellRouter);

    // ─── Modifiers ──────────────────────────────────────────────────
    modifier onlySigner() {
        require(msg.sender == signer, "Not signer");
        _;
    }

    // ─── Constructor ────────────────────────────────────────────────
    constructor() Ownable(msg.sender) {
        signer = msg.sender;
        rewardsAddress = address(heroToken);
        
        // Approve both routers for HERO
        IERC20(heroToken).forceApprove(address(uniswapRouter), type(uint256).max);
        IERC20(heroToken).forceApprove(address(aerodromeRouter), type(uint256).max);
        
        // Approve WETH for both routers
        weth.forceApprove(address(uniswapRouter), type(uint256).max);
        weth.forceApprove(address(aerodromeRouter), type(uint256).max);
    }

    // ─── Pair Management ────────────────────────────────────────────
    function addPair(
        address tokenA,
        address tokenB,
        address router,
        address pairAddress,
        bool isAerodrome,
        bool isStable
    ) external onlyOwner {
        require(tokenA != address(0) && tokenB != address(0), "Invalid token addresses");
        require(router != address(0), "Invalid router address");
        require(pairAddress != address(0), "Invalid pair address");
        require(
            router == address(uniswapRouter) || router == address(aerodromeRouter),
            "Router not supported"
        );

        // Approve tokens for the router
        IERC20(tokenA).forceApprove(router, type(uint256).max);
        IERC20(tokenB).forceApprove(router, type(uint256).max);

        pairs.push(Pair(tokenA, tokenB, router, pairAddress, 0, 0, isAerodrome, isStable));
        emit PairAdded(tokenA, tokenB, router, pairAddress, isAerodrome);
    }

    // ─── Core: Multi-Swap Arbitrage (Same DEX) ──────────────────────
    // Executes multi-hop arb on a single DEX, picking best router per hop
    function multiSwap(
        address[][] memory swapPaths,
        uint256 amountIn,
        uint256[] memory minAmountsOut,
        bool[] memory useAerodrome,
        bool[] memory isStable
    ) external onlySigner {
        require(swapPaths.length == minAmountsOut.length, "Paths and minAmountsOut mismatch");
        require(swapPaths.length == useAerodrome.length, "Paths and useAerodrome mismatch");
        require(swapPaths.length > 1, "At least two swaps required");

        uint256 currentAmount = amountIn;

        for (uint256 i = 0; i < swapPaths.length; i++) {
            require(swapPaths[i].length == 2, "Each swap path must have exactly 2 tokens");

            uint256 tokenBalanceBefore = IERC20(swapPaths[i][1]).balanceOf(address(this));

            if (useAerodrome[i]) {
                // Use Aerodrome router
                IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
                routes[0] = IAerodromeRouter.Route({
                    from: swapPaths[i][0],
                    to: swapPaths[i][1],
                    stable: isStable[i],
                    factory: aerodromeRouter.defaultFactory()
                });

                aerodromeRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                    currentAmount,
                    minAmountsOut[i],
                    routes,
                    address(this),
                    block.timestamp
                );
            } else {
                // Use Uniswap V2 router
                uniswapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                    currentAmount,
                    minAmountsOut[i],
                    swapPaths[i],
                    address(this),
                    block.timestamp
                );
            }

            uint256 tokenBalanceAfter = IERC20(swapPaths[i][1]).balanceOf(address(this));
            currentAmount = tokenBalanceAfter - tokenBalanceBefore;
        }

        // Verify profit
        require(currentAmount >= amountIn + minGain, "Must gain hero overall");
        uint256 finalGain = currentAmount - amountIn;
        heroGained += finalGain;

        emit ArbitrageExecuted(amountIn, currentAmount, finalGain, 0);
        _handleLpContributionAndDistribution(finalGain, swapPaths);
    }

    // ─── Core: Cross-DEX Arbitrage ──────────────────────────────────
    // Buy on one DEX, sell on another — the HABFF special sauce
    function crossDexArb(
        address tokenIn,
        address tokenMid,
        uint256 amountIn,
        uint256 minGainAmount,
        bool buyOnAerodrome,
        bool buyStable,
        bool sellStable
    ) external onlySigner {
        require(tokenIn == heroToken, "Must start with HERO");
        
        uint256 heroBalanceBefore = IERC20(heroToken).balanceOf(address(this));
        
        // Step 1: Swap HERO → tokenMid on DEX A
        uint256 midBalanceBefore = IERC20(tokenMid).balanceOf(address(this));
        
        if (buyOnAerodrome) {
            _swapAerodrome(tokenIn, tokenMid, amountIn, 0, buyStable);
        } else {
            _swapUniswap(tokenIn, tokenMid, amountIn, 0);
        }
        
        uint256 midAmount = IERC20(tokenMid).balanceOf(address(this)) - midBalanceBefore;
        require(midAmount > 0, "Buy swap returned 0");

        // Step 2: Swap tokenMid → HERO on DEX B (the other one)
        if (buyOnAerodrome) {
            // Bought on Aerodrome, sell on Uniswap
            _swapUniswap(tokenMid, tokenIn, midAmount, 0);
        } else {
            // Bought on Uniswap, sell on Aerodrome
            _swapAerodrome(tokenMid, tokenIn, midAmount, 0, sellStable);
        }

        uint256 heroBalanceAfter = IERC20(heroToken).balanceOf(address(this));
        require(heroBalanceAfter > heroBalanceBefore, "No profit");
        
        uint256 gain = heroBalanceAfter - heroBalanceBefore;
        require(gain >= minGainAmount, "Below min gain");
        
        heroGained += gain;
        
        uint8 buyRouter = buyOnAerodrome ? 1 : 0;
        uint8 sellRouter = buyOnAerodrome ? 0 : 1;
        emit CrossDexArbitrage(amountIn, gain, buyRouter, sellRouter);
        
        address[][] memory fakePaths = new address[][](1);
        fakePaths[0] = new address[](2);
        fakePaths[0][0] = tokenIn;
        fakePaths[0][1] = tokenMid;
        _handleLpContributionAndDistribution(gain, fakePaths);
    }

    // ─── Internal Swap Helpers ──────────────────────────────────────
    function _swapUniswap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minOut
    ) internal {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        
        // Ensure approval
        IERC20(tokenIn).forceApprove(address(uniswapRouter), amountIn);
        
        uniswapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn,
            minOut,
            path,
            address(this),
            block.timestamp
        );
    }

    function _swapAerodrome(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minOut,
        bool stable
    ) internal {
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: tokenIn,
            to: tokenOut,
            stable: stable,
            factory: aerodromeRouter.defaultFactory()
        });
        
        // Ensure approval
        IERC20(tokenIn).forceApprove(address(aerodromeRouter), amountIn);
        
        aerodromeRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn,
            minOut,
            routes,
            address(this),
            block.timestamp
        );
    }

    // ─── Quote Helpers (for bot to find best route) ─────────────────
    function getUniswapQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        try uniswapRouter.getAmountsOut(amountIn, path) returns (uint256[] memory amounts) {
            return amounts[1];
        } catch {
            return 0;
        }
    }

    function getAerodromeQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        bool stable
    ) external view returns (uint256) {
        IAerodromeRouter.Route[] memory routes = new IAerodromeRouter.Route[](1);
        routes[0] = IAerodromeRouter.Route({
            from: tokenIn,
            to: tokenOut,
            stable: stable,
            factory: aerodromeRouter.defaultFactory()
        });
        try aerodromeRouter.getAmountsOut(amountIn, routes) returns (uint256[] memory amounts) {
            return amounts[1];
        } catch {
            return 0;
        }
    }

    // ─── LP & Distribution (same as HeroABLE-Base) ──────────────────
    function _handleLpContributionAndDistribution(uint256 finalGain, address[][] memory swapPaths) private {
        uint256 lpContribution = (finalGain * lpPercent) / 100;
        if (lpContribution > 0 && pairs.length > 0) {
            if (targetedLpMode && targetLpPairs.length > 0) {
                uint256 perPair = lpContribution / targetLpPairs.length;
                for (uint256 t = 0; t < targetLpPairs.length; t++) {
                    for (uint256 i = 0; i < pairs.length; i++) {
                        if (pairs[i].pairAddress == targetLpPairs[t]) {
                            pairs[i].heroForLp += perPair;
                            if (pairs[i].heroForLp >= lpAddThreshold) {
                                _addLiquidity(pairs[i]);
                            }
                            break;
                        }
                    }
                }
            } else {
                for (uint256 s = 0; s < swapPaths.length; s++) {
                    for (uint256 i = 0; i < pairs.length; i++) {
                        if (pairs[i].tokenA == swapPaths[s][1] || pairs[i].tokenB == swapPaths[s][1]) {
                            pairs[i].heroForLp += lpContribution;
                            if (pairs[i].heroForLp >= lpAddThreshold) {
                                _addLiquidity(pairs[i]);
                            }
                            break;
                        }
                    }
                }
            }
        }
        pendingGainsDistribution += (finalGain - lpContribution);
        if (pendingGainsDistribution >= distributeThreshold) {
            _distributeGains();
        }
    }

    function _distributeGains() internal {
        uint256 rewardsAmount = (pendingGainsDistribution * rewardsPercent) / (100 - lpPercent);
        uint256 burnAmount = (pendingGainsDistribution * burnPercent) / (100 - lpPercent);
        uint256 gasCompAmount = (pendingGainsDistribution * gasCompPercent) / (100 - lpPercent);

        if (rewardsAmount > 0) {
            IERC20(heroToken).safeTransfer(rewardsAddress, rewardsAmount);
            totalHeroReward += rewardsAmount;
        }
        if (burnAmount > 0) {
            IERC20(heroToken).safeTransfer(burnAddress, burnAmount);
            totalHeroBurn += burnAmount;
        }
        if (gasCompAmount > 0) {
            // Swap HERO → ETH for gas compensation via Uniswap
            address[] memory path = new address[](2);
            path[0] = address(heroToken);
            path[1] = address(weth);
            uniswapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
                gasCompAmount,
                0,
                path,
                signer,
                block.timestamp
            );
            totalHeroGasComp += gasCompAmount;
        }
        pendingGainsDistribution = 0;
    }

    function _addLiquidity(Pair storage pair) internal {
        uint256 heroAmount = pair.heroForLp;
        address router = pair.router;
        (, address otherToken) = pair.tokenA == heroToken
            ? (pair.tokenA, pair.tokenB)
            : (pair.tokenB, pair.tokenA);

        uint256 heroBalance = IERC20(heroToken).balanceOf(address(this));
        if (heroAmount > 0 && heroBalance >= heroAmount) {
            pair.heroForLp = 0;
            pair.totalHeroLpAdded += heroAmount;
            uint256 halfHeroAmount = heroAmount / 2;

            // Swap half HERO → otherToken (always via Uniswap V2 for LP)
            address[] memory path = new address[](2);
            path[0] = address(heroToken);
            path[1] = address(otherToken);
            uint256 initialOtherBalance = IERC20(otherToken).balanceOf(address(this));

            IUniswapV2Router02(router).swapExactTokensForTokensSupportingFeeOnTransferTokens(
                halfHeroAmount, 0, path, address(this), block.timestamp
            );

            uint256 swappedOtherBalance = IERC20(otherToken).balanceOf(address(this)) - initialOtherBalance;

            (uint256 amountA, uint256 amountB, ) = IUniswapV2Router02(router).addLiquidity(
                heroToken, otherToken, halfHeroAmount, swappedOtherBalance,
                0, 0, owner(), block.timestamp
            );

            if (halfHeroAmount > amountA) {
                pair.heroForLp += (halfHeroAmount - amountA);
            }
            if (swappedOtherBalance > amountB) {
                IERC20(otherToken).safeTransfer(owner(), swappedOtherBalance - amountB);
            }
        }
    }

    // ─── Admin Functions ────────────────────────────────────────────
    function getPairs() external view returns (Pair[] memory) {
        uint256 pairCount = pairs.length;
        Pair[] memory result = new Pair[](pairCount);
        for (uint256 i = 0; i < pairCount; i++) {
            result[i] = pairs[i];
        }
        return result;
    }

    function setRewardsAddress(address _rewardsAddress) external onlyOwner {
        rewardsAddress = _rewardsAddress;
    }

    function setLpAddThreshold(uint256 _newThreshold) external onlyOwner {
        lpAddThreshold = _newThreshold;
    }

    function setTargetLpPairs(address[] calldata lpPairs, bool enabled) external onlyOwner {
        require(lpPairs.length <= 4, "Cannot set more than 4 LP target pairs");
        for (uint256 i = 0; i < lpPairs.length; i++) {
            require(lpPairs[i] != address(0), "Invalid LP target address");
        }
        targetLpPairs = lpPairs;
        targetedLpMode = enabled;
    }

    function setMinGain(uint256 _newMinGain) external onlyOwner {
        minGain = _newMinGain;
    }

    function setSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid signer");
        signer = _signer;
    }

    function setDistributionSettings(
        uint256 _rewardsPercent,
        uint256 _burnPercent,
        uint256 _lpPercent,
        uint256 _gasCompPercent
    ) external onlyOwner {
        require(
            _rewardsPercent + _burnPercent + _lpPercent + _gasCompPercent == 100,
            "Must sum to 100"
        );
        rewardsPercent = _rewardsPercent;
        burnPercent = _burnPercent;
        lpPercent = _lpPercent;
        gasCompPercent = _gasCompPercent;
    }

    function setDistributeThreshold(uint256 _newThreshold) external onlyOwner {
        distributeThreshold = _newThreshold;
    }

    // Update router addresses if needed
    function setUniswapRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router");
        uniswapRouter = IUniswapV2Router02(_router);
        IERC20(heroToken).forceApprove(_router, type(uint256).max);
        weth.forceApprove(_router, type(uint256).max);
    }

    function setAerodromeRouter(address _router) external onlyOwner {
        require(_router != address(0), "Invalid router");
        aerodromeRouter = IAerodromeRouter(_router);
        IERC20(heroToken).forceApprove(_router, type(uint256).max);
        weth.forceApprove(_router, type(uint256).max);
    }

    // Approve a token for a specific router
    function approveToken(address token, address router) external onlyOwner {
        IERC20(token).forceApprove(router, type(uint256).max);
    }

    // ─── Emergency / Withdraw ───────────────────────────────────────
    function withdrawToken(address tokenAddress, uint256 amount) external onlyOwner nonReentrant {
        IERC20(tokenAddress).safeTransfer(owner(), amount);
    }

    function withdrawETH(uint256 amount) external onlyOwner nonReentrant {
        payable(owner()).transfer(amount);
    }

    // ─── View Helpers ───────────────────────────────────────────────
    function getTargetLpPairs() external view returns (address[] memory) {
        return targetLpPairs;
    }

    function getReservesForPairs(address[] memory pairAddresses)
        external
        view
        returns (uint256[] memory reserve0s, uint256[] memory reserve1s)
    {
        uint256 pairCount = pairAddresses.length;
        reserve0s = new uint256[](pairCount);
        reserve1s = new uint256[](pairCount);
        for (uint256 i = 0; i < pairCount; i++) {
            address pairAddress = pairAddresses[i];
            require(pairAddress != address(0), "Invalid pair address");
            try IUniswapV2Pair(pairAddress).getReserves() returns (
                uint112 _reserve0, uint112 _reserve1, uint32
            ) {
                reserve0s[i] = _reserve0;
                reserve1s[i] = _reserve1;
            } catch {
                reserve0s[i] = 0;
                reserve1s[i] = 0;
            }
        }
    }

    function getStats() external view returns (
        uint256 _heroGained,
        uint256 _totalHeroBurn,
        uint256 _totalHeroReward,
        uint256 _totalHeroLp,
        uint256 _totalHeroGasComp,
        uint256 _pendingGains,
        uint256 _pairCount
    ) {
        return (heroGained, totalHeroBurn, totalHeroReward, totalHeroLp, 
                totalHeroGasComp, pendingGainsDistribution, pairs.length);
    }

    receive() external payable {}
}
