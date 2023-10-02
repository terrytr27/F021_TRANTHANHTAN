import { useEffect, useState } from "react";
import { Currency } from "../../models/CurrencyModel";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import formatNumber, {
  convertCurrency,
  removeDuplicateCurrency,
  validate,
} from "../../utils/currency";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Wrapper } from "./styles";
import CurrencyDropdown from "../CurrencyDropdown";

type Props = {
  currencyList: Currency[];
};

const FormInput = (props: Props) => {
  const { currencyList } = props;
  const optionList = removeDuplicateCurrency(currencyList);
  const currencyOptions = optionList.map((item) => {
    return {
      name: item.currency,
      value: item.currency,
    };
  });

  const [swapState, setSwapState] = useState({
    usdAmount: "",
    showUsdOnSend: true,
    sendCurrency: "",
    receiveCurrency: "",
    sendAmount: "",
    receiveAmount: "",
  });

  const {
    setValue,
    register,
    handleSubmit,
    control,
    trigger,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validate),
    defaultValues: {
      send_amount: "",
      send_currency: "",
      receive_amount: "",
      receive_currency: "",
    },
  });

  const convert = ({ input }: { input: "send" | "receive" }) => {
    clearErrors([
      "send_amount",
      "receive_amount",
      "send_currency",
      "receive_currency",
    ]);
    const sendAmount = getValues("send_amount");
    const receiveAmount = getValues("receive_amount");
    const sendCurrency = getValues("send_currency");
    const receiveCurrency = getValues("receive_currency");

    if (!((sendAmount || receiveAmount) && sendCurrency && receiveCurrency))
      return;

    /// case input send change
    if (input === "send") {
      const inAmount = sendAmount ? parseInt(sendAmount) : undefined;
      const amount = convertCurrency(
        inAmount,
        sendCurrency,
        receiveCurrency,
        optionList
      );
      setSwapState({
        ...swapState,
        receiveAmount: amount,
        sendAmount,
        sendCurrency,
        receiveCurrency,
      });
      setValue("receive_amount", amount);
    }
    /// case input receive change
    else if (input === "receive") {
      const inAmount = receiveAmount ? parseFloat(receiveAmount) : undefined;
      const amount = convertCurrency(
        inAmount,
        receiveCurrency,
        sendCurrency,
        optionList
      );
      setSwapState({
        ...swapState,
        sendAmount: amount,
        receiveCurrency,
        receiveAmount,
        sendCurrency,
      });
      setValue("send_amount", amount);
    }
  };

  const swap = () => {
    clearErrors([
      "send_amount",
      "receive_amount",
      "send_currency",
      "receive_currency",
    ]);
    const {
      showUsdOnSend,
      sendAmount,
      receiveAmount,
      sendCurrency,
      receiveCurrency,
    } = swapState;
    setValue("send_currency", receiveCurrency);
    setValue("receive_currency", sendCurrency);
    setValue("send_amount", receiveAmount);
    setValue("receive_amount", sendAmount);
    setSwapState({
      ...swapState,
      showUsdOnSend: !showUsdOnSend,
      sendAmount: receiveAmount,
      sendCurrency: receiveCurrency,
      receiveAmount: sendAmount,
      receiveCurrency: sendCurrency,
    });
  };

  const onChangeSendAmount = (e: any) => {
    trigger("send_amount");
    setValue("send_amount", e.target.value as string);
    setSwapState({ ...swapState, sendAmount: e.target.value as string });
    convert({ input: "send" });
  };

  const onChangeReceiveAmount = (e: any) => {
    trigger("receive_amount");
    setValue("receive_amount", e.target.value as string);
    setSwapState({ ...swapState, receiveAmount: e.target.value as string });
    convert({ input: "receive" });
  };

  const onChangeSendCurrency = (e: any) => {
    setValue("send_currency", e.target.value as string);
    setSwapState({ ...swapState, sendCurrency: e.target.value as string });
    convert({
      input: swapState.sendAmount ? "send" : "receive",
    });
  };

  const onChangeReceiveCurrency = (e: any) => {
    setValue("receive_currency", e.target.value as string);
    setSwapState({ ...swapState, receiveCurrency: e.target.value as string });
    convert({
      input: swapState.receiveAmount ? "receive" : "send",
    });
  };

  useEffect(() => {
    if (!swapState.sendAmount || !swapState.sendCurrency) return;
    const usdAmount = convertCurrency(
      parseFloat(swapState.sendAmount),
      swapState.sendCurrency,
      "USD",
      optionList
    );
    setSwapState({
      ...swapState,
      usdAmount: formatNumber(usdAmount).toString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapState.sendAmount, swapState.sendCurrency]);

  const {
    showUsdOnSend,
    usdAmount,
    sendAmount,
    receiveAmount,
    sendCurrency,
    receiveCurrency,
  } = swapState;

  return (
    <Wrapper style={{ borderRadius: 10 }}>
      <Container component="main">
        <Box
          sx={{
            borderRadius: 2,
            px: 4,
            py: 6,
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            style={{ fontWeight: "bold", color: "#5A5A5A" }}
          >
            Exchange
          </Typography>
          <Box
            component="form"
            noValidate
            sx={{ mt: 1 }}
            onSubmit={handleSubmit(swap)}
          >
            <Box sx={{ borderTop: 1, paddingBottom: "20px" }} />
            <Typography
              component="h1"
              variant="h5"
              style={{ fontWeight: "bold", color: "#5A5A5A" }}
            >
              Transfering Amount
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Box sx={{ height: "100px", width: "100%" }}>
                <Controller
                  {...register("send_amount")}
                  name="send_amount"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange, ...field } }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      onChange={(e) => {
                        onChange(e);
                        onChangeSendAmount(e);
                      }}
                      value={sendAmount}
                      placeholder="Enter currency amount"
                      autoComplete="off"
                      style={{ borderRadius: 10 }}
                      InputProps={{
                        endAdornment: (
                          <CurrencyDropdown
                            {...register("send_currency")}
                            options={currencyOptions}
                            value={sendCurrency}
                            onChange={(e) => {
                              onChangeSendCurrency(e);
                            }}
                            error={!!errors?.send_currency?.message}
                          />
                        ),
                      }}
                    />
                  )}
                />
                {errors?.send_amount?.message && (
                  <Typography
                    className={"text-xs mt-1"}
                    component="p"
                    color={"error.main"}
                  >
                    {errors?.send_amount?.message}
                  </Typography>
                )}
                {showUsdOnSend &&
                  usdAmount &&
                  usdAmount !== "NaN" &&
                  !errors?.send_currency?.message && (
                    <Typography
                      className={"text-xs mt-1"}
                      component="p"
                      color="blue"
                    >
                      {`$${usdAmount}`}
                    </Typography>
                  )}
              </Box>
            </Box>
            <Typography
              component="h1"
              variant="h5"
              style={{ fontWeight: "bold", color: "#5A5A5A" }}
            >
              Receving Amount
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Box sx={{ height: "100px", width: "100%" }}>
                <Controller
                  {...register("receive_amount")}
                  name="receive_amount"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      onChange={(e) => {
                        onChange(e);
                        onChangeReceiveAmount(e);
                      }}
                      value={receiveAmount}
                      placeholder="Enter currency amount"
                      autoComplete="off"
                      InputProps={{
                        endAdornment: (
                          <CurrencyDropdown
                            {...register("receive_currency")}
                            options={currencyOptions}
                            placeholder="Select Currency"
                            value={receiveCurrency}
                            onChange={(e) => {
                              onChangeReceiveCurrency(e);
                            }}
                            error={!!errors?.receive_currency?.message}
                          />
                        ),
                      }}
                    />
                  )}
                />

                {errors?.receive_amount?.message && (
                  <Typography
                    className={"text-xs mt-1"}
                    component="p"
                    color={"error.main"}
                  >
                    {errors?.receive_amount?.message}
                  </Typography>
                )}
                {!showUsdOnSend &&
                  usdAmount &&
                  usdAmount !== "NaN" &&
                  !errors?.receive_amount?.message && (
                    <Typography
                      className={"text-xs mt-1"}
                      component="p"
                      color="blue"
                    >
                      {`$${usdAmount}`}
                    </Typography>
                  )}
              </Box>
            </Box>
            {sendCurrency && receiveCurrency && (
              <span>
                <Typography
                  className={"text-xs mt-5"}
                  component="span"
                  color="brown"
                  fontWeight="bold"
                >
                  {`1${receiveCurrency} = ${convertCurrency(
                    1,
                    receiveCurrency,
                    sendCurrency,
                    optionList,
                    2
                  )}${sendCurrency}`}
                </Typography>
                <Typography
                  className={"text-xs mt-1"}
                  component="span"
                  color="blue"
                >
                  {` ($${convertCurrency(
                    1,
                    receiveCurrency,
                    "USD",
                    optionList,
                    2
                  )})`}
                </Typography>
              </span>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 2,
                paddingX: 8,
                paddingY: 2,
                background: "#F699CD",
                fontWeight: "bold",
              }}
            >
              Exchange
            </Button>
          </Box>
        </Box>
      </Container>
    </Wrapper>
  );
};

FormInput.defaultProps = {
  currencyList: [],
};

export default FormInput;
