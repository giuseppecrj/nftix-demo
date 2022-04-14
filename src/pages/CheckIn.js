import { Button, Flex, Heading, Text, Box, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import QrReader from "react-qr-scanner";

function CheckIn({ connectedContract }) {
  const toast = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedAddress, setScannedAddress] = useState(null);
  const [hasTicket, setHasTicket] = useState(false);
  const [checkInTxnPending, setCheckInTxnPending] = useState(false);

  const checkIn = async () => {
    try {
      if (!connectedContract) return;

      setCheckInTxnPending(true);
      const checkInTxn = await connectedContract.checkIn(scannedAddress);
      await checkInTxn.wait();
      setCheckInTxnPending(false);
      toast({
        status: "success",
        title: "Success",
        variant: "subtle",
        description: (
          <a
            href={`https://rinkeby.etherscan.io/tx/${checkInTxn.hash}`}
            target="_blank"
            rel="noreferrer nofollow"
          >
            Checkout the transaction on Etherscan
          </a>
        ),
      });
    } catch (error) {
      console.log(error);
      setCheckInTxnPending(false);
      toast({
        status: "error",
        title: "Failure",
        variant: "subtle",
        description: error,
      });
    }
  };

  useEffect(() => {
    const confirmOwnership = async () => {
      try {
        if (!connectedContract) return;

        const res = await connectedContract.confirmOwnership(scannedAddress);
        setHasTicket(res);
      } catch (error) {
        console.log(error);
      }
    };

    if (scannedAddress) confirmOwnership();
  }, [connectedContract, scannedAddress]);

  return (
    <>
      <Heading mb={4}>Check In</Heading>

      {!showScanner && scannedAddress && hasTicket && (
        <>
          <Text fontSize="xl" mb={8}>
            This wallet owns a NFTix!
          </Text>
          <Flex width="100%" justifyContent="center">
            <Button
              onClick={checkIn}
              isLoading={checkInTxnPending}
              size="lg"
              colorScheme="teal"
            >
              Check In
            </Button>
          </Flex>
        </>
      )}

      {!showScanner && (
        <>
          {!showScanner && !scannedAddress && (
            <Text fontSize="xl" mb={8}>
              Scan wallet address to verify ticket ownership and check-in.
            </Text>
          )}

          {scannedAddress && !hasTicket && (
            <Text fontSize="xl" mb={8}>
              This wallet does not own a NFTix. Please try again.
            </Text>
          )}

          {!hasTicket && (
            <Flex width="100%" justifyContent="center">
              <Button
                onClick={() => {
                  setShowScanner(true);
                }}
                size="lg"
                colorScheme="teal"
              >
                Scan QR
              </Button>
            </Flex>
          )}
        </>
      )}

      {showScanner && (
        <>
          <Box margin="16px auto 8px auto" padding="0 16px" with="360px">
            <QrReader
              onError={(error) => {
                console.log(error);
                toast({
                  status: "error",
                  title: "Failure",
                  variant: "subtle",
                  description: error,
                });
                setShowScanner(false);
              }}
              onScan={(scanData) => {
                if (!scanData) return;

                const address = scanData.split("ethereum:")[1];

                setScannedAddress(address);
                setShowScanner(false);

                toast({
                  title: "Captured address",
                  description: `${address.slice(0, 6)}...${address.slice(-4)}`,
                  status: "success",
                  variant: "subtle",
                });
              }}
              delay={500}
              style={{ maxWidth: "100%", margin: "0 auto" }}
            ></QrReader>
          </Box>
          <Flex width="100%" justifyContent="center">
            <Button
              onClick={() => {
                setShowScanner(false);
              }}
              size="lg"
              colorScheme="red"
            >
              Cancel
            </Button>
          </Flex>
        </>
      )}
    </>
  );
}

export default CheckIn;
