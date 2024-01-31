import {TableContainer,TableHead,TableRow,TableCell,Table,TableBody, Button} from "@mui/material";
import IosShareIcon from '@mui/icons-material/IosShare';
import React from "react";
function createPositionTableData(
    name ,
    sizes ,
    marketPrice ,
    averageCost ,
    marketValue ,
    unrealizedProfit 
  ) {
    return {
      name,
      sizes,
      marketPrice,
      averageCost,
      marketValue,
      unrealizedProfit,
    };
  }
  export function DateTableCell({ date, scanLinkHref }) {
    return (
      <TableCell
        sx={{
          border: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        {date}
        <LinkToscan scanLinkHref={scanLinkHref} />
      </TableCell>
    );
  }
  export function LinkToscan({ scanLinkHref }) {
    return (
      <a
        href={scanLinkHref}
        target="_blank"
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
      <IosShareIcon/>
      </a>
    );
  }
export function OrdersHistoriesTable(props) {
  
    const { limBillHistory } = props;
    console.log("limBillHistory", limBillHistory);
    let rows;
  
   if(limBillHistory){
      rows =  
        limBillHistory
       ;
    } else {
      rows = [
        createPositionTableData("YES", "--", "--", "--", "--", "--"),
        createPositionTableData("NO", "--", "--", "--", "--", "--"),
        createPositionTableData("YES", "--", "--", "--", "--", "--"),
        createPositionTableData("NO", "--", "--", "--", "--", "--"),
        createPositionTableData("YES", "--", "--", "--", "--", "--"),
        createPositionTableData("NO", "--", "--", "--", "--", "--"),
        createPositionTableData("YES", "--", "--", "--", "--", "--"),
        createPositionTableData("NO", "--", "--", "--", "--", "--"),
      ];
    }
  
    const item = {
      question_long: "TEST",
      question_id:
        "0x71ce1defa429fd61976bc04801aa978240fc49cafcbd15355d658fdc177b8d3e",
    };
    const scanLinkHref = `https://mumbai.polygonscan.com/tx/0xbc9f832bf97bbe3d5284ea295b53b89a65038d1ec1696d1e5a6b90d31905f4ff`;
  
    return (
      <TableContainer
        sx={{
          maxHeight: "70vh",
        }}
      >
        <Table stickyHeader>
          <TableHead
            sx={{
              "& .MuiTableCell-root": {
                // color: "#62535e",
                borderBottom: "0.6px solid rgba(255, 255, 255, 0.12)",
                background: "none",
                backgroundImage: "none !important",
                backgroundColor: "none  !important",
                backgroundShadow: "none",
              },
            }}
          >
            <TableRow>
              <TableCell>
                Amount
              </TableCell>
              <TableCell>
                Price
              </TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
  
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.name}>
                <TableCell sx={{ border: "none" }}>{row.uint256Amount}</TableCell>
                <TableCell sx={{ border: "none" }}>{row.price}</TableCell>
                <TableCell sx={{ border: "none" }}>{row.buyOrSell}</TableCell>
                <DateTableCell
                  date={"09/28/2023,04:28:01"}
                  scanLinkHref={scanLinkHref}
                />
              <TableCell sx={{ border: "none" }}><Button sx={{color:"#1976d2" }} variant="outlined"  >Cancel</Button></TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  