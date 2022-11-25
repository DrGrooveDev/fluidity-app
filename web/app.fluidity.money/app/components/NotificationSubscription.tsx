import { useContext, useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

import { NotificationType, PipedTransaction } from "drivers/types";

import { Token } from "~/util/chainUtils/tokens.js";
import { ColorMap } from "~/webapp.config.server";
import { trimAddress } from "~/util";
import DSSocketManager from "~/util/client-connections";

import { ToolTipContent, useToolTip } from "./ToolTip";
import FluidityFacadeContext from "contexts/FluidityFacade";
import { ViewRewardModal } from "./ViewRewardModal";

type RewardDetails = {
  visible: boolean;
  token: string;
  img: string;
  colour: string;
  winAmount: string;
  explorerUri: string;
  balance: string;
  forSending: boolean;
};

interface INotificationSubscripitionProps {
  network: string;
  explorer: string;
  tokens: Token[];
  colorMap: ColorMap[string];
}

export const NotificationSubscription = ({
  network,
  explorer,
  tokens,
  colorMap,
}: INotificationSubscripitionProps) => {
  const navigate = useNavigate();
  const toolTip = useToolTip();

  const { rawAddress, balance } = useContext(FluidityFacadeContext);

  const [detailedRewardObject, setDetailedRewardObject] =
    useState<RewardDetails>({
      visible: false,
      token: "",
      img: "",
      colour: "",
      winAmount: "",
      explorerUri: "",
      balance: "",
      forSending: false,
    });

  const handleCloseViewRewardDetailModal = () => {
    setDetailedRewardObject({
      visible: false,
      token: "",
      img: "",
      colour: "",
      winAmount: "",
      explorerUri: "",
      balance: "",
      forSending: false,
    });
  };

  const handleClientListener = (payload: PipedTransaction) => {
    const imgUrl = tokens?.at(0)?.logo !== undefined ? tokens?.at(0)?.logo : "";
    const tokenColour = colorMap[tokens?.at(0)?.symbol as unknown as string];

    const transactionUrl = explorer + `/tx/` + payload.transactionHash;

    toolTip.open(
      tokenColour,
      <ToolTipContent
        tokenLogoSrc={tokens.at(0)?.logo}
        boldTitle={payload.amount + ` ` + payload.token}
        details={
          payload.type === NotificationType.REWARD_DATABASE
            ? payload.rewardType === `send`
              ? `reward for s͟e͟n͟d`
              : `reward for r͟e͟c͟e͟i͟v͟i͟n͟g`
            : `r͟e͟c͟e͟i͟v͟e͟d from ` + trimAddress(payload.source)
        }
        linkLabel={"DETAILS"}
        linkLabelOnClickCallback={async () => {
          payload.type === NotificationType.REWARD_DATABASE
            ? setDetailedRewardObject({
                visible: true,
                token: payload.token,
                img: imgUrl as unknown as string,
                colour: tokenColour as unknown as string,
                winAmount: payload.amount,
                explorerUri: transactionUrl,
                balance: String(
                  await balance?.(tokens.at(0)?.address as unknown as string)
                ),
                forSending: payload.rewardType === `send` ? true : false,
              })
            : window.open(transactionUrl, `_`);
        }}
      />
    );

    return payload;
  };

  useEffect(() => {
    const { emitEvent } = DSSocketManager({
      onCallback: handleClientListener,
    });

    emitEvent(network, rawAddress as unknown as string);
  }, [rawAddress]);

  return (
    <ViewRewardModal
      visible={detailedRewardObject.visible}
      close={() => {
        handleCloseViewRewardDetailModal();
      }}
      callback={() => {
        handleCloseViewRewardDetailModal();
        navigate("./rewards/unclaimed");
      }}
      tokenSymbol={detailedRewardObject.token}
      img={detailedRewardObject.img}
      colour={detailedRewardObject.colour}
      winAmount={detailedRewardObject.winAmount}
      explorerUri={detailedRewardObject.explorerUri}
      balance={detailedRewardObject.balance}
      forSending={detailedRewardObject.forSending}
    />
  );
};