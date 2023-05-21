import type { NavigateFunction } from "@remix-run/react";

import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import {
  Text,
  Heading,
  Display,
  Card,
  GeneralButton,
  Twitter,
  LinkButton,
  ArrowRight,
  LoadingDots,
  Hoverable,
  ProgressBar,
  CopyIcon,
  TextButton,
  useViewport
} from "@fluidity-money/surfing";
import { highlightText } from "~/util";
import { generateReferralTweet } from "~/util/tweeter";

type IReferraModal = {
  connected: boolean;
  network: string;
  connectWallet: () => void;
  closeModal: () => void;
  referrerClaimed: number;
  refereeClaimed: number;
  refereeUnclaimed: number;
  progress: number;
  progressReq: number;
  referralCode: string;
  loaded: boolean;
};

const ReferralModal = ({
  connected,
  network,
  connectWallet,
  closeModal,
  referrerClaimed,
  refereeClaimed,
  refereeUnclaimed,
  progress,
  progressReq,
  referralCode,
  loaded,
}: IReferraModal) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  const navigate = useNavigate();

  const referralsEmoji = referrerClaimed ? "🎉" : "😔";

  const mobileBreakpoint = 768;
  const { width } = useViewport();


  const isMobile = width < mobileBreakpoint;

  return (
    <>
      <div className="referrals-content">
        <div className="referrals-header">
          {/* Help Button */}
          {/* <GeneralButton
            type={"secondary"}
            buttontype={"text"}
            handleClick={() =>
              navigate(`/${network}/dashboard/airdrop#tutorial`)
            }
            size={"small"}
            border="box"
          >
            ?
          </GeneralButton> */}
          <Text size="sm">REFERRAL SYSTEM</Text>
        </div>

        <div>
          <Heading as={"h5"} className="referrals-heading">
            YOU HAVE {referrerClaimed}&nbsp;
            <Hoverable
              style={{ minWidth: 250 }}
              tooltipStyle={isMobile ? 'frosted' : 'solid'}
              tooltipContent={<Text size="xs">Active Referrals are Referrals that have earned 10 Lootboxes</Text>}
            >
              <TextButton style={{ textDecorationThickness: 1, textUnderlineOffset: 5 }}>
                ACTIVE REFERRALS
              </TextButton>
            </Hoverable>
            &nbsp;{referralsEmoji}
          </Heading>
          <Text size="sm">Send more of your link to earn more rewards!</Text>
        </div>

        {!connected ? (
          <GeneralButton
            type={"primary"}
            size={"medium"}
            handleClick={connectWallet}
          >
            Connect Wallet
          </GeneralButton>
        ) : loaded ? (
          <div className="referrals-copy-group">
            <Card
              component="button"
              type="transparent"
              border="dashed"
              color="gray"
              rounded
              onClick={highlightText}
            >
              <Text
                className="referrals-copyable-link"
                code
              >{`https://airdrop.fluidity.money/${referralCode}`}</Text>
            </Card>

            {/* Copy Button */}
            <GeneralButton
              className={"referrals-copy-button"}
              type={"transparent"}
              buttontype={"icon before"}
              handleClick={() => {
                navigator.clipboard.writeText(
                  `https://airdrop.fluidity.money/${referralCode}`
                );
                setLinkCopied(true);
              }}
              size={"medium"}
              icon={<CopyIcon />}
            >
              <Text size="lg" prominent bold style={{ color: 'inherit' }}>{!linkCopied ? "Copy Link" : "Link Copied!"}</Text>
            </GeneralButton>
          </div>
        ) : (
          <LoadingDots />
        )}

        {/*Share Button*/}
        <Text size="sm">
          Share to: &nbsp;
          <TextButton
            style={{ color: 'white' }}
            onClick={() => {
              window.open(generateReferralTweet(
                `https://airdrop.fluidity.money/${referralCode}`
              ))
            }}
          >
            <Text
              code
              prominent
              size={"sm"}
            >
              <Twitter style={{ height: "1em", fill: "currentColor", translate: '0 2px', marginRight: 2 }} />TWITTER
            </Text>
          </TextButton>
        </Text>
      </div>

      {/* How It Works Divider / Links*/}
      <div
        className="referrals-inner-box"
      >
        <div className="referrals-inner-switcher">
          <div className="referrals-inner-divider" />
          <GeneralButton
            type={showHowItWorks ? "primary" : "transparent"}
            buttontype={"text"}
            handleClick={() => setShowHowItWorks(true)}
            size={"small"}
          >
            <Text size="sm" code style={{ color: 'inherit' }}>How It Works</Text>
          </GeneralButton>
          <div className="referrals-inner-divider" />
          <GeneralButton
            type={!showHowItWorks ? "primary" : "transparent"}
            buttontype={"text"}
            handleClick={() => setShowHowItWorks(false)}
            size={"small"}
          >
            <Text size="md" code style={{ color: 'inherit' }}>Links I&apos;ve Clicked</Text>
          </GeneralButton>
          <div className="referrals-inner-divider" />
        </div>
        {/*Contents*/}
        {showHowItWorks ? (
          <HowItWorksContent />
        ) : (
          <LinksClickedContent
            claimed={refereeClaimed}
            unclaimed={refereeUnclaimed}
            progress={progress}
            progressReq={progressReq}
            network={network}
            navigate={navigate}
          />
        )}
      </div>
    </>
  );
};

const HowItWorksContent = () => (
  <div className="referrals-content referrals-inner-content">
    <div className="spread-center">
      <div className="single-line">
        <img style={{ width: "1.25em" }} src={"/images/icons/circle1.svg"} />
        <Text prominent size="md">
          Copy Your Link.
        </Text>
      </div>
      <div className="single-line">
        <img style={{ width: "1.25em" }} src={"/images/icons/circle2.svg"} />
        <Text prominent size="md">
          Share it with your friends.
        </Text>
      </div>
    </div>
    <Card
      rounded
      type="transparent"
      color="holo"
      border="dashed"
      className="how-it-works-infobox"
    >
      {/* How it works Box Left*/}
      <div>
        <Text prominent size="lg" className="single-line">
          <ul>You Get</ul> 💸
        </Text>
        <Text prominent size="md">
          <strong>10% of their airdrop</strong>
          <br />
          earnings throughout
          <br />
          the entire Epoch.
        </Text>
      </div>
      {/* How it works Box Right*/}
      <div>
        <Text prominent size="lg" className="single-line">
          🍾<ul>They Get</ul>
        </Text>
        <Text prominent size="md">
          <strong>10 Loot Bottles,</strong>
          <br />
          not affected by
          <br />
          your 10% reward.
        </Text>
      </div>
    </Card>
    <div className="how-it-works-warning-container">
      <img style={{ width: "50px" }} src="/images/icons/circleInfo.svg" />
      <Text prominent size="md" className="how-it-works-warning-text">
        They will have to earn 10 Loot Boxes for each referral in order to claim
        their reward and activate yours
      </Text>
    </div>
  </div>
);

type ILinksClickedContent = {
  claimed: number;
  unclaimed: number;
  progress: number;
  progressReq: number;
  network: string;
  navigate: NavigateFunction;
};

const LinksClickedContent = ({
  claimed,
  unclaimed,
  progress,
  progressReq,
  network,
  navigate,
}: ILinksClickedContent) => (
  <div className="referrals-content referrals-inner-content">
    <Text size="md" prominent>
      In order to claim your referral rewards, you must earn 10 Loot Bottles for{" "}
      <strong style={{ color: "yellow" }}>each</strong> unclaimed referral.
    </Text>
    <GeneralButton
      layout="after"
      size="large"
      type="transparent"
      icon={<ArrowRight />}
      handleClick={() => navigate(`/${network}/dashboard/airdrop`)}
    >
      Go to Fluidity Airdrop Page
    </GeneralButton>

    <div className="links-clicked-stats">
      <div className="statistics-set">
        <Text size="lg" className="single-line">
          Claimed
          <div className="dot green" />
        </Text>
        <Display size={"xs"} style={{ margin: "0.2em 0 0.2em 0" }}>
          {claimed}
        </Display>
        <Text size="md" code>
          {claimed * progressReq} BOTTLES
        </Text>
      </div>

      <div className="statistics-set">
        <Text size="lg" className="single-line">
          Unclaimed
          <div className="dot red" />
        </Text>
        <Display size={"xs"} style={{ margin: "0.2em 0 0.2em 0" }}>
          {unclaimed}
        </Display>
        <LinkButton
          size="small"
          type="internal"
          handleClick={() =>
            navigate(`/${network}/dashboard/airdrop#referrals`)
          }
        >
          Start Claiming
        </LinkButton>
      </div>

      <div className="statistics-set">
        <Text size="lg">Until Next Claim</Text>
        <Display size={"xs"} style={{ margin: "0.2em 0 0.2em 0" }}>
          {progress}/{progressReq}
        </Display>
        <ProgressBar value={progress} max={progressReq} />
      </div>
    </div>
  </div>
);

export default ReferralModal;
