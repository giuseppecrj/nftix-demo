import {
  Link,
  CircularProgress,
  Flex,
  Heading,
  Text,
  Box,
  Image,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";

function Wallet({ address }) {
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (!address) return;

    setLoadingTicket(true);
    axios
      .get(
        `https://testnets-api.opensea.io/api/v1/assets?owner=${address}&asset_contract_address=${process.env.REACT_APP_CONTRACT_ID}`
      )
      .then((res) => {
        setLoadingTicket(true);
        if (
          res.status === 200 &&
          res?.data?.assets &&
          res?.data?.assets.length
        ) {
          setTicket(res.data.assets[0]);
        }
        setLoadingTicket(false);
      })
      .catch((err) => {
        console.log(err);
        setLoadingTicket(false);
      });
  }, [address]);

  const createTicketDisplay = () => {
    if (!ticket) return null;

    return (
      <Link
        href={ticket.permalink}
        key={ticket.id}
        isExternal
        flexBasis="160px"
        margin="16px 8px"
      >
        <Text fontSize="xl" textAlign="center" mb={2}>
          NFTix #{ticket.token_id}
        </Text>
        <Box padding="12px" border="1px solid black" borderRadius="12px">
          <Image src={ticket.image_url} alt={`NFTix #${ticket.token_id}`} />
        </Box>
      </Link>
    );
  };

  return (
    <>
      <Heading mb={4}>Your ticket</Heading>
      <Flex justifyContent="center" mb={8}>
        {loadingTicket && (
          <CircularProgress
            capIsRound
            isIndeterminate
            color="green.300"
            size="120px"
          />
        )}

        {!loadingTicket && ticket && createTicketDisplay()}

        {!loadingTicket && !ticket && (
          <Text fontSize="xl" mb={2} width="100%">
            You don't own any tickets 😢
          </Text>
        )}
      </Flex>
    </>
  );
}

export default Wallet;
