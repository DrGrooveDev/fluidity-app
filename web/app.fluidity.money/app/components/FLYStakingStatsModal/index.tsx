import { Card, FlyIcon, GeneralButton, Heading, Hoverable, InfoCircle, LinkButton, StakeIcon, Text, trimAddress, UnstakeIcon, WarningIcon } from "@fluidity-money/surfing";
import { BigNumber } from "ethers";
import BN from "bn.js";
import { FlyToken } from "contexts/EthereumProvider";
import FluidityFacadeContext from "contexts/FluidityFacade";
import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "~/styles/dashboard/airdrop.css";
import { BaseCircle, Checked, NextCircle, TermsModal } from "../FLYClaimSubmitModal";
import { addDecimalToBn, getUsdFromTokenAmount, snapToValidValue } from "~/util/chainUtils/tokens";

export const FlyStakingStatsModalLinks = () => [{ rel: "stylesheet", href: styles }];

interface FlyStakingStatsModalProps {
  visible: boolean
  showConnectWalletModal: () => void;
  close: () => void;
  // true for staking, false for unstaking
  staking?: boolean
}

enum State {
  // Base screen
  Stats,
  // Entering amount
  StakingDetails,
  // Awaiting Connection
  AmountEntered,
  // Awaiting staking
  IsConnected,
  // Finished
  HasStaked
}

const FlyStakingStatsModal = ({ visible, close, showConnectWalletModal, staking = true }: FlyStakingStatsModalProps) => {
  const [modal, setModal] = useState<React.ReactPortal | null>(null);

  const {
    balance,
    address,
    addToken,
    flyStakingStake,
    flyStakingDetails,
    // flyStakingBeginUnstake,
    // flyStakingSecondsUntilSoonestUnstake,
    flyStakingAmountUnstaking,
  } = useContext(FluidityFacadeContext)

  const [flyBalance, setFlyBalance] = useState(new BN(0));

  const closeWithEsc = useCallback(
    (event: { key: string }) => {
      event.key === "Escape" && visible === true && close();
    },
    [visible]
  );

  useEffect(() => {
    document.addEventListener("keydown", closeWithEsc);
    return () => document.removeEventListener("keydown", closeWithEsc);
  }, [visible]);

  useEffect(() => {
    (async () => {
      const bal = await balance?.(FlyToken.address);
      if (!bal) return;
      // setFlyBalance(bal);
      setFlyBalance(new BN(5010001));
    })();
  }, [balance]);

  const [points, setPoints] = useState(BigNumber.from(0));
  // const [flyStaked, setFlyStaked] = useState(BigNumber.from(0));

  useEffect(() => {
    (async () => {
      if (!address) return;
      const details = await flyStakingDetails?.(address);
      if (!details) return; // hope we get an error instead here
      // const { flyStaked, points } = details;
      setPoints(points);
      // setFlyStaked(flyStaked);
    })();
  }, [address, flyStakingDetails]);

  const [pointsUnstaking, setPointsUnstaking] = useState(new BN(0));

  useEffect(() => {
    (async () => {
      if (!address) return;
      const unstaking = await flyStakingAmountUnstaking?.(address);
      if (!unstaking) return;
      setPointsUnstaking(unstaking);
    })();
  }, [address, flyStakingAmountUnstaking]);

  const [isStaking, setIsStaking] = useState(staking)
  const [currentStatus, setCurrentStatus] = useState(State.Stats);
  const [currentAction, setCurrentAction] = useState("Connect")
  const [showTermsModal, setShowTermsModal] = useState(false)

  const potentialPoints = 123;

  useEffect(() => {
    if (address && (currentStatus === State.AmountEntered))
      setCurrentStatus(State.IsConnected);
  }, [address, currentStatus]);

  useEffect(() => {
    switch (currentStatus) {
      case State.Stats:
        setCurrentAction("")
        break;
      case State.StakingDetails:
        setCurrentAction(isStaking ? "Stake" : "Unstake")
        break;
      case State.AmountEntered:
        setCurrentAction("Connect")
        break;
      case State.IsConnected:
        setCurrentAction(isStaking ? "Stake" : "Claim")
        break;
      case State.HasStaked:
        setCurrentAction(isStaking ? "Staked!" : "Unstaked")
        break;
    }

  }, [currentStatus]);

  const handleClose = () => {
    close();
    setCurrentStatus(State.Stats);
  };

  const handleClick = (staking: boolean) => {
    switch (currentStatus) {
      case State.Stats:
        setIsStaking(staking);
        setCurrentStatus(State.StakingDetails);
        break;
      case State.StakingDetails:
        setIsStaking(staking);
        setCurrentStatus(State.AmountEntered);
        break;
      case State.AmountEntered:
        setIsStaking(staking);
        showConnectWalletModal()
        break;
      case State.IsConnected:
        setIsStaking(staking);
        beginStakeInteraction();
        break;
      case State.HasStaked:
        break;
    }
  }

  const setMaxBalance = () => {
    return setSwapInput(
      addDecimalToBn(
        snapToValidValue(
          flyBalance.toString(),
          FlyToken,
          flyBalance,
        ),
        FlyToken.decimals
      )
    );
  };

  const [swapInput, setSwapInput] = useState("");

  const stakeAmount: BN = snapToValidValue(swapInput, FlyToken, flyBalance);

  // kicks off the interaction to begin the staking via the contract
  const [beginStaking, setBeginStaking] = useState(false);

  useEffect(() => {
    if (!flyStakingStake) return;
    if (!beginStaking) return;
    (async () => {
      try {
        await flyStakingStake(stakeAmount);
      } catch (err) {
        throw new Error(`failed to stake: ${err}`);
      }
    })();
  }, [flyStakingStake, beginStaking]);

  const beginStakeInteraction = () => {
    // setCurrentStatus(State.HasStaked);
    setBeginStaking(true);
  };

  const handleChangeSwapInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const tokenDecimals = 6
    // if (/^\d*\.?\d*$/.test(e.currentTarget.value))
    //   setSwapInput(e.target.value);
    const numericChars = e.target.value.replace(/[^0-9.]+/, "");

    const [whole, dec] = numericChars.split(".");

    const unpaddedWhole = whole === "" ? "" : parseInt(whole) || 0;

    if (dec === undefined) {
      return setSwapInput(`${unpaddedWhole}`);
    }

    const limitedDecimals = dec.slice(0 - tokenDecimals);

    return setSwapInput([whole, limitedDecimals].join("."));
  };

  useEffect(() => {
    setModal(
      createPortal(
        <>
          <div
            className={`fly-submit-claim-outer-modal-container ${visible === true ? "show-fly-modal" : "hide-modal"
              }`}
          >
            <div onClick={close} className="fly-submit-claim-modal-background"></div>
              <div
                className={`fly-staking-stats-modal-container ${visible === true ? "show-fly-modal" : "hide-modal"
                  }`}
              >
                <div className="fly-submit-claim-flex-container">
                  <div className="fly-submit-claim-heading-container">
                    <Heading as="h3" className="fly-submit-claim-heading">
                      {currentStatus === State.Stats ?
                        "Your Staking Stats" :
                        currentStatus === State.StakingDetails ?
                          `${isStaking ? "Staking" : "Unstaking"} details` :
                          `${isStaking ? "Staking" : "Unstaking"} $FLY Tokens`
                      }
                    </Heading>
                    <span onClick={handleClose}>
                      <img src="/images/icons/x.svg" className="modal-cancel-btn" />
                    </span>
                  </div>
                  <div className="fly-submit-claim-modal-options">
                    {currentStatus === State.Stats ?
                      <>
                        <div className="flex-column no-gap fly-submit-claim-modal-row">
                          <Text size="xxxl" holo>{points.toString()}</Text>
                          <div className="text-with-info-popup">
                            <Hoverable
                              tooltipStyle={"solid"}
                              tooltipContent={
                                <div className="flex-column">Learn more at the Fluidity Staking blog post.</div>
                              }
                            >
                              <div className="text-with-info-popup">
                                <Text size="md">Your Cumulative Points</Text>
                                <InfoCircle className="info-circle-grey" />
                              </div>
                            </Hoverable>
                          </div>
                        </div>
                        <div className="fly-submit-claim-modal-row">
                          <Card border="solid" fill>
                            <Text className="center-text" size="lg" prominent>
                              💸 Stake your $FLY to earn Airdrop Rewards and [REDACTED] in Superposition (SPN) 🐱
                            </Text>
                          </Card>
                        </div>
                        <div style={{ gap: '0.5em' }} className="fly-submit-claim-modal-row">
                          <Card fill>
                            <Hoverable
                              tooltipStyle={"solid"}
                              tooltipContent={
                                <div className="flex-column">
                                  The amount of $FLY Token you have claimed.
                                </div>
                              }
                            >
                              <div className="flex-column">
                                <div className="text-with-info-popup">
                                  <FlyIcon />
                                  <Text size="lg" prominent>{getUsdFromTokenAmount(flyBalance, FlyToken.decimals)}</Text>
                                </div>
                                <div className="text-with-info-popup">
                                  <Text size="lg">$FLY Balance</Text>
                                  <InfoCircle className="info-circle-grey" />
                                </div>
                              </div>
                            </Hoverable>
                          </Card>
                          <Card fill>
                            <Hoverable
                              tooltipStyle={"solid"}
                              tooltipContent={
                                <div className="flex-column">
                                  The amount of $FLY Token you have staked from your total $FLY Balance.
                                </div>
                              }
                            >
                              <div className="flex-column">
                                <Text size="lg" prominent>{points.toString()}</Text>
                                <div className="text-with-info-popup">
                                  <Text size="lg">Staked</Text>
                                  <InfoCircle className="info-circle-grey" />
                                </div>
                              </div>
                            </Hoverable>
                          </Card>
                          <Card fill>
                            <Hoverable
                              tooltipStyle={"solid"}
                              tooltipContent={
                                <div className="flex-column">
                                  The amount of $FLY Tokens you have unstaked from your total Staked $FLY Balance. Includes unbonding amount.
                                </div>
                              }
                            >
                              <div className="flex-column">
                                <Text size="lg" prominent>{pointsUnstaking.toString()}</Text>
                                <div className="text-with-info-popup">
                                  <Text size="lg">Unstaking</Text>
                                  <InfoCircle className="info-circle-grey" />
                                </div>
                              </div>
                            </Hoverable>
                          </Card>
                        </div>
                      </>
                      :
                      currentStatus === State.StakingDetails ?
                        <div className="fly-submit-claim-modal-options">
                          {isStaking ?
                            <div className="fly-submit-claim-modal-row">
                              <StakingWarning
                                header={
                                  <Text size="lg" bold prominent className="black">Staking will lock up your funds for <span className="underline">7 Days</span>.</Text>
                                }
                                body={
                                  <Text size="md" className="black">To have access to your staked funds once again, you must go through the process of unstaking</Text>

                                } />
                            </div>
                            :
                            <>
                              <div className="fly-submit-claim-modal-row">
                                <StakingWarning
                                  header={
                                    <Text size="lg" bold prominent className="black">Access to the tokens will be <span className="underline">granted in 7 Days</span>.</Text>
                                  }
                                  body={
                                    <Text size="md" className="black">During this period, you will be unable to receive staking rewards and terminate the un-bonding process.</Text>

                                  } />
                              </div>
                              <div className="fly-submit-claim-modal-row">
                                <StakingWarning
                                  header={
                                    <Text size="lg" bold prominent className="black">Unstaking will result in the loss of some points.</Text>
                                  }
                                  body={
                                    <Text size="md" className="black">You will lose the equivalent percentage of unstaked $FLY from your accumulative points. <Text size="md" className="black" bold>(i.e: Unstaking 50% of $FLY will result in 50% Loss of points)</Text></Text>

                                  } />
                              </div>
                            </>
                          }
                          <div className="fly-submit-claim-modal-row">
                            <div className="fly-staking-input-container">
                              <Text prominent size="lg">AMOUNT OF $FLY TO STAKE</Text>
                              <div className="staking-input-underline">
                                <FlyIcon />
                                <input
                                  className="staking-input"
                                  min={""}
                                  value={swapInput}
                                  onChange={handleChangeSwapInput}
                                  placeholder="0"
                                  step="any"
                                />
                              </div>
                              <div className="staking-input-lower">
                                {getUsdFromTokenAmount(flyBalance.sub(stakeAmount), FlyToken.decimals)} $FLY remaining (={0})
                                <div onClick={setMaxBalance}>
                                  <Text prominent size="md" className="max-balance-text">Max</Text>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Text className="fly-once-approved">Once approved, transactions cannot be reverted. By pressing send you agree to our {" "}
                            <a
                              className="link"
                              onClick={() => { setShowTermsModal(true) }}
                            >
                              staking terms and conditions
                            </a>.</Text>
                        </div> :


                        <div className="fly-submit-claim-modal-options">
                          {currentStatus <= State.IsConnected && <div className="fly-submit-claim-modal-row">
                            <div className="fly-points-info-container">
                              <div className="flex">
                                <Text size="lg" prominent>🏄🏼‍♂️</Text>
                                <Text size="lg" holo>Staking $FLY will reward you points.</Text>
                              </div>
                              <div className="fly-caution-border">
                                <Text size="lg" prominent>
                                  You will earn {potentialPoints} points by staking your $FLY. Stake your $FLY to earn Airdrop Rewards and [REDACTED] in Superposition (SPN).
                                </Text>
                              </div>
                            </div>
                          </div>
                          }
                          <div className="fly-submit-claim-modal-row">
                            {currentStatus <= State.AmountEntered
                              ? <NextCircle /> : <Checked />}
                            <div className="flex-column">
                              <Text size="lg" prominent>Connect your Arbitrum wallet</Text>
                              {State.IsConnected && address && <Text size="md" >Connected {trimAddress(address)}</Text>}
                            </div>
                          </div>
                          <div className="fly-submit-claim-modal-row">
                            {currentStatus < State.HasStaked ? <BaseCircle /> : <Checked />}
                            <div className="flex-column">
                              <Text size="lg" prominent>{isStaking ? "Stake" : "Unstake"} $FLY {getUsdFromTokenAmount(stakeAmount, FlyToken)}</Text>
                              {
                                currentStatus >= State.HasStaked && (
                                  isStaking ?
                                    <Text size="md">Earn rewards & [REDACTED] on SPN</Text> :
                                    <LinkButton
                                      size={"medium"}
                                      type={"external"}
                                      handleClick={() => { addToken?.("FLY") }}
                                    >
                                      Add $FLY to My Wallet
                                    </LinkButton >
                                )
                              }
                            </div>
                          </div>
                        </div>
                    }
                  </div>
                  <div className="fly-submit-claim-modal-button-container">
                    <div className="fly-confirming-claim-button-container">
                      {currentStatus === State.Stats ?
                        <>
                          <GeneralButton
                            type="primary"
                            size="large"
                            layout="after"
                            handleClick={() => handleClick(true)}
                            className={`fly-staking-stats-action-button`}
                          >
                            <Text size="md" bold className="fly-submit-claim-action-button-text">
                              <StakeIcon />
                              Stake
                            </Text>
                          </GeneralButton>
                          <GeneralButton
                            type="primary"
                            size="large"
                            layout="after"
                            handleClick={() => handleClick(false)}
                            className={`fly-staking-stats-action-button`}
                          >
                            <Text size="md" bold className="fly-submit-claim-action-button-text">
                              <UnstakeIcon />
                              Unstake
                            </Text>
                          </GeneralButton>
                        </> :
                        <GeneralButton
                          type="primary"
                          size="large"
                          layout="after"
                          disabled={currentStatus === State.HasStaked || stakeAmount.eq(new BN(0))}
                          handleClick={() => handleClick(isStaking)}
                          className={`fly-staking-stats-action-button ${currentStatus === State.HasStaked - 1 ? "rainbow" : ""} ${currentStatus === State.HasStaked ? "claim-button-staked" : ""}`}

                        >
                          <Text size="md" bold className="fly-submit-claim-action-button-text">
                            {currentAction}
                            {currentStatus === State.HasStaked && <Checked size={18} />}
                          </Text>
                        </GeneralButton>

                      }
                    </div>

                  </div>
                  <Text size="xs" className="legal">
                    By signing the following transactions, you agree to Fluidity Money&apos;services{" "}
                    <a
                      className="link"
                      href="https://static.fluidity.money/assets/fluidity-website-tc.pdf"
                    >
                      Terms of Service
                    </a>{" "}
                    and acknowledge that you have read and understand the{" "}
                    <a className="link">Disclaimer</a>
                  </Text>
                  <TermsModal visible={showTermsModal} close={() => setShowTermsModal(false)} />
                </div>
              </div>
          </div>
        </>,
        document.body
      )
    );

  }, [
    visible,
    currentStatus,
    isStaking,
    currentAction,
    showTermsModal,
    points,
    pointsUnstaking,
    swapInput
  ])

  return modal;
}

const StakingWarning = ({ header, body }: { header: ReactNode, body: ReactNode }) => {
  return <Card className="staking-card" >
    <div className="staking-card-container">
      <WarningIcon />
      {header}
    </div>
    {body}
  </Card>
}

export {
  FlyStakingStatsModal
}
