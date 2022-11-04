import { Card, Heading, Text } from "@fluidity-money/surfing";
import config from "~/webapp.config.server";
import { motion } from "framer-motion";
import { useLoaderData } from "@remix-run/react";

const parent = {
  variantA: { scale: 1 },
  variantB: { scale: 1 },
};

const child = {
  variantA: { scale: 1 },
  variantB: { scale: 1.05 },
};

type LoaderData = {
  provider: typeof config.liquidity_providers;
  network: string;
};

const ProvideLiquidity = () => {
  const { provider, network } = useLoaderData<LoaderData>();

  const providers =
    network === "ethereum"
      ? provider["ethereum"].providers
      : provider["solana"].providers;

  const liqidityProviders = (
    <div className="liquidity-providers">
      {providers.map((provider) => (
        <motion.a
          key={provider.name}
          href={provider.link}
          rel="noopener noreferrer"
          target="_blank"
          variants={parent}
          initial="variantA"
          whileHover="variantB"
        >
          <motion.img src={provider.img} variants={child} />
        </motion.a>
      ))}
    </div>
  );

  return (
    <Card
      id="provide-liquidity"
      className="card-outer"
      component="div"
      rounded={true}
      type={"box"}
    >
      <div className="card-inner">
        <section className="provide-liquidity-left">
          <div>
            <Heading as="h2" className="provide-heading">
              Provide Liquidity
            </Heading>
            <Text size="lg">
              Make your assets work harder for your rewards. Get involved.
            </Text>
          </div>

          {liqidityProviders}
        </section>
        <section className="provide-liquidity-right">
          <img src="/images/doubleDollarCoins.svg" />
        </section>
      </div>
    </Card>
  );
};

export default ProvideLiquidity;