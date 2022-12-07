import { gql, jsonPost } from "~/util";

const queryAll = gql`
  query WinnersAll($network: network_blockchain!) {
    winners(
      where: {
        network: { _eq: $network }
        send_transaction_hash: { _neq: "" }
        transaction_hash: { _neq: "" }
      }
      distinct_on: transaction_hash
      limit: 240
    ) {
      network
      solana_winning_owner_address
      winning_address
      created
      transaction_hash
      send_transaction_hash
      winning_amount
      token_decimals
      ethereum_application
      solana_application
    }
  }
`;

const queryByAddress = gql`
  query WinnersByAddress($network: network_blockchain!, $address: String!) {
    winners(
      where: { network: { _eq: $network }, winning_address: { _eq: $address } }
      distinct_on: transaction_hash
      limit: 240
    ) {
      network
      solana_winning_owner_address
      winning_address
      transaction_hash
      send_transaction_hash
      winning_amount
      token_decimals
      ethereum_application
      solana_application
    }
  }
`;

const useUserRewardsAll = async (network: string) => {
  const variables = { network };
  const url = "https://fluidity.hasura.app/v1/graphql";
  const body = {
    variables,
    query: queryAll,
  };

  return jsonPost<ExpectedWinnersBody, ExpectedWinnersResponse>(url, body);
};

const useUserRewardsByAddress = async (network: string, address: string) => {
  const variables = { network, address };
  const url = "https://fluidity.hasura.app/v1/graphql";
  const body = {
    variables,
    query: queryByAddress,
  };

  return jsonPost<ExpectedWinnersBody, ExpectedWinnersResponse>(url, body);
};

type ExpectedWinnersBody = {
  variables: {
    network: string;
  };
  query: string;
};

type ExpectedWinnersResponse = {
  data?: {
    winners: Array<Winner>;
  };

  errors?: unknown;
};

export type Winner = {
  network: string;
  solana_winning_owner_address: string | null;
  winning_address: string | null;
  created: string;
  transaction_hash: string;
  send_transaction_hash: string;
  winning_amount: number;
  token_decimals: number;
  ethereum_application?: string;
  solana_application?: string;
};

export { useUserRewardsAll, useUserRewardsByAddress };
