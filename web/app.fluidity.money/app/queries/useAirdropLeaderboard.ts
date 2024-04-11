import { jsonPost, gql, fetchInternalEndpoint } from "~/util";

const queryAllTime = gql`
  query AirdropLeaderboard($epoch: lootbox_epoch!) @cached(ttl: 120) {
    airdrop_leaderboard(
      args: { epoch_: $epoch }
      limit: 1000
      order_by: { total_lootboxes: desc }
    ) {
      user: address
      rank
      referralCount: referral_count
      bottles: total_lootboxes
      highestRewardTier: highest_reward_tier
      liquidityMultiplier: liquidity_multiplier
      fusdcEarned: fusdc_earned
      arbEarned: arb_earned
      flyStaked: fly_staked
    }
  }
`;

const query24Hours = gql`
  query AirdropLeaderboard($epoch: lootbox_epoch!) @cached(ttl: 120) {
    airdrop_leaderboard: airdrop_leaderboard_24_hours(
      args: { epoch_: $epoch }
      limit: 1000
      order_by: { total_lootboxes: desc }
    ) {
      user: address
      rank
      referralCount: referral_count
      bottles: total_lootboxes
      highestRewardTier: highest_reward_tier
      liquidityMultiplier: liquidity_multiplier
      fusdcEarned: fusdc_earned
      arbEarned: arb_earned
      flyStaked: fly_staked
    }
  }
`;

const query24HoursByApplication = gql`
  query AirdropLeaderboardByApplication(
    $epoch: lootbox_epoch!
    $application: ethereum_application!
  ) @cached(ttl: 120) {
    airdrop_leaderboard: airdrop_leaderboard_24_hours_by_application(
      args: { epoch_: $epoch, application_: $application }
      limit: 1000
      order_by: { total_lootboxes: desc }
    ) {
      user: address
      rank
      referralCount: referral_count
      bottles: total_lootboxes
      highestRewardTier: highest_reward_tier
      liquidityMultiplier: liquidity_multiplier
      fusdcEarned: fusdc_earned
      arbEarned: arb_earned
      flyStaked: fly_staked
    }
  }
`;

type AirdropLeaderboardBody = {
  query: string;
};

type AirdropLeaderboardByUserBody = AirdropLeaderboardBody & {
  variables: {
    address: string;
  };
};

type AirdropLeaderboardByApplicationBody = AirdropLeaderboardBody & {
  variables: {
    application: string;
  };
};

type AirdropLeaderboardByUserByApplicationBody = AirdropLeaderboardBody & {
  variables: {
    address: string;
    application: string;
  };
};

export type AirdropLeaderboardEntry = {
  user: string;
  rank: number;
  referralCount: number;
  bottles: number;
  highestRewardTier: number;
  liquidityMultiplier: number;
  fusdcEarned: number;
  arbEarned: number;
  flyStaked: number;
};

type AirdropLeaderboardResponse = {
  data?: {
    airdrop_leaderboard: Array<AirdropLeaderboardEntry>;
  };
  errors?: unknown;
};

export const useAirdropLeaderboardAllTime = (epoch: string) => {
  const { url, headers } = fetchInternalEndpoint();
  const variables = { epoch };
  const body = {
    query: queryAllTime,
    variables,
  };

  return jsonPost<AirdropLeaderboardBody, AirdropLeaderboardResponse>(
    url,
    body,
    headers
  );
};

export const useAirdropLeaderboard24Hours = (epoch: string) => {
  const { url, headers } = fetchInternalEndpoint();
  const variables = { epoch };
  const body = {
    variables,
    query: query24Hours,
  };

  return jsonPost<AirdropLeaderboardBody, AirdropLeaderboardResponse>(
    url,
    body,
    headers
  );
};

export const useAirdropLeaderboardByApplication24Hours = (
  epoch: string,
  application: string
) => {
  const { url, headers } = fetchInternalEndpoint();
  const variables = {
    epoch,
    application,
  };
  const body = {
    query: query24HoursByApplication,
    variables,
  };

  return jsonPost<
    AirdropLeaderboardByApplicationBody,
    AirdropLeaderboardResponse
  >(url, body, headers);
};
