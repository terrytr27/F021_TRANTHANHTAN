/*
 * Issue: Anti-patterns
 * Suggest: Declare type for blockchain to avoid any type casting
 */
enum BlockChainType {
  Osmosis = "Osmosis",
  Ethereum = "Ethereum",
  Arbitrum = "Arbitrum",
  Zilliqa = "Zilliqa",
  Neo = "Neo",
}

/*
 * Issue: Anti-patterns
 * Suggest: Add blockchain prop for better usage in sortedBalances func
 */
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: BlockChainType; // add
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

/*
 * Issue: Inefficiency code
 * Suggest: Declare a dictionary used for mapping blockchain type allow us do not need switch case to get priority of blockchain
 */
const BlockChainDict = new Map<BlockChainType, number>([
  [BlockChainType.Osmosis, 100],
  [BlockChainType.Ethereum, 50],
  [BlockChainType.Arbitrum, 30],
  [BlockChainType.Zilliqa, 20],
  [BlockChainType.Neo, 20],
]);

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  /**
   * Issue: Inefficiency codes and Anti-patterns
   * Suggest: Remove any type and use map instead of switch case in getPriority
   */
  //   const getPriority = (blockchain: any): number => {
  //     switch (blockchain) {
  //       case "Osmosis":
  //         return 100;
  //       case "Ethereum":
  //         return 50;
  //       case "Arbitrum":
  //         return 30;
  //       case "Zilliqa":
  //         return 20;
  //       case "Neo":
  //         return 20;
  //       default:
  //         return -99;
  //     }
  //   };
  const getPriority = (blockchain: BlockChainType): number => {
    const result = BlockChainDict.get(blockchain);
    return result === undefined ? -99 : result;
  };

  const sortedBalances = useMemo(() => {
    return (
      balances
        .filter((balance: WalletBalance) => {
          const balancePriority = getPriority(balance.blockchain);
          /*
           * Issue: Anti-patterns
           * Suggest: lhsPriority has not been declared, should use balancePriority instead of lhsPriority
           */
          //if (lhsPriority > -99) {
          if (balancePriority > -99) {
            if (balance.amount <= 0) {
              return true;
            }
          }
          return false;
        })
        /*
         * Issue: Inefficiency codes
         * Suggest: Should use `sort(function(a, b){return a - b})` for better understanding and performance
         */
        //   .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        //     const leftPriority = getPriority(lhs.blockchain);
        //     const rightPriority = getPriority(rhs.blockchain);
        //     if (leftPriority > rightPriority) {
        //       return -1;
        //     } else if (rightPriority > leftPriority) {
        //       return 1;
        //     }
        //   });
        .sort((lhs: WalletBalance, rhs: WalletBalance) => {
          return getPriority(lhs.blockchain) - getPriority(rhs.blockchain);
        })
    );
    /*
     * Issue: Inefficiency code
     * Suggest: Prices is not used in this function, should remove from depencies to prevent unneccessary recalculation
     */
    //}, [balances, prices]);
  }, [balances]);

  /*
   * Issue: Anti-patterns
   * Suggest: Add return type for formattedBalances
   */

  const formattedBalances: FormattedWalletBalance[] = sortedBalances.map(
    (balance: WalletBalance) => {
      return {
        ...balance,
        formatted: balance.amount.toFixed(),
      };
    }
  );

  /*
   * Issue: Anti-patterns
   * Suggest: sortedBalances type is WalletBalance[] should use formattedBalances whose type FormattedWalletBalance[]
   */
  const rows = formattedBalances.map(
    //const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  /*
   * Issue: Anti-patterns
   * Suggest: <div> may not contains props of BoxProps, should use <Box> instead of <div>
   */
  // return <div {...rest}>{rows}</div>;
  return <Box {...rest}>{rows}</Box>;
};
