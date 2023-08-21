import Transaction from "~/types/Transaction";
import {fetchGqlEndpoint, gql, jsonPost, Queryable} from "~/util";

export type AggregatedTransaction = Omit<Transaction, 
  'utilityTokens' | 'swapType' | 'logo' | 'provider'
> & {
  utility_amount: number, 
  utility_name: string | null
}

const queryByAddress: Queryable = {
  arbitrum: gql`
  query userActionsAggregateByAddress(
      $offset: Int = 0,
      $limit: Int = 12,
      $address: String!,
  ) {
    arbitrum: user_transactions_aggregate(args: {network_: "arbitrum", filter_address: $address, limit_: $limit, offset_: $offset}) {
      value: amount
      receiver: recipient_address
      rewardHash: reward_hash
      sender: sender_address
      hash: transaction_hash
      utility_amount
      utility_name
      winner: winning_address
      reward: winning_amount
      application
      currency
      timestamp: time
    }
  }`
}
const queryAll: Queryable = {
  arbitrum: gql`
  query userActionsAggregateAll(
      $offset: Int = 0,
      $limit: Int = 12,
  ) {
    arbitrum: user_transactions_aggregate(args: {network_: "arbitrum",limit_: $limit, offset_: $offset}) {
      value: amount
      receiver: recipient_address
      rewardHash: reward_hash
      sender: sender_address
      hash: transaction_hash
      utility_amount
      utility_name
      winner: winning_address
      reward: winning_amount
      application
      currency
      timestamp: time
    }
  }`
}

type UserTransactionsAggregateBody = {
  query: string;
  variables: {
    limit: number;
    offset: number;
  };
};

export type UserTransactionsAggregateRes = {
  data?: {[network: string]: AggregatedTransaction[]};
  errors?: unknown;
};

const useUserActionsAll = async (
  network: string,
  page: number,
  limit = 12
) => {
  const variables = {
    offset: (page - 1) * 12,
    limit,
  };

  const body = {
    query: queryAll[network],
    variables,
  };

  const {url, headers} = fetchGqlEndpoint(network) || {};

  if (!url || !headers)
    return {
      errors: `Failed to fetch GraphQL URL and headers for network ${network}`,
    };

  const result = await jsonPost<
          UserTransactionsAggregateBody,
          UserTransactionsAggregateRes 
        >(url, body, headers)

  return result;
}

const useUserActionsByAddress = async (
  network: string,
  address: string,
  page: number,
  limit = 12
) => {
  const variables = {
    offset: (page - 1) * 12,
    limit,
    address,
  };

  const body = {
    query: queryByAddress[network],
    variables,
  };

  const {url, headers} = fetchGqlEndpoint(network) || {};

  if (!url || !headers)
    return {
      errors: `Failed to fetch GraphQL URL and headers for network ${network}`,
    };

  const result = await jsonPost<
          UserTransactionsAggregateBody,
          UserTransactionsAggregateRes 
        >(url, body, headers)

  return result;
}

export {
  useUserActionsAll,
  useUserActionsByAddress,
}