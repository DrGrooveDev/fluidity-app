
import { mainDeployTransparentUpgradeableProxy } from "./transparent-upgradeable-proxy";

//FLU_ETHEREUM_PROXY_ADMIN=0x80d82aF50EF0277b7A888616a7CE9F2D2F39DAe2

mainDeployTransparentUpgradeableProxy("StakingV1", [
  "FLU_ARBITRUM_FLY_ADDR", // 0x000F1720A263f96532D1ac2bb9CDC12b72C6f386
  "FLU_ARBITRUM_FLY_MERKLE_DISTRIBUTOR", // 0xe5476af9E9299F139d63077dA735d022953Fd404
  "FLU_ARBITRUM_EMERGENCY_COUNCIL_ADDRESS", // 0x5bC5DB835Af82Ab2333b1a60f529038F6508c94C
  "FLU_ARBITRUM_OPERATOR_ADDRESS" // 0x429Dc27be907e16EF40329503F501361879510e0
]).then(_ => {});